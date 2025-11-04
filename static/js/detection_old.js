 /**
 * XDVioDet - Violence Detection UI with Canvas Overlay
 * Handles video upload, playback, and real-time detection visualization
 */

const CONFIG = {
    MAX_FILE_SIZE: 500 * 1024 * 1024,
    ALLOWED_FORMATS: ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'],
    API_BASE: '/api',
    CONFIDENCE_THRESHOLD: 0.3
};

const VIOLENCE_LABELS = {
    'alcohol': '#FF6B6B',
    'gesture': '#FFA726',
    'blood': '#EF5350',
    'cigarette': '#AB47BC',
    'gun': '#EC407A',
    'knife': '#EF5350',
    'smoke': '#9575CD',
    'mob_violence': '#D32F2F',
    'fight': '#C62828',
    'explosion': '#FF5722',
    'shooting': '#E64A19',
    'stabbing': '#D84315',
    'threatening_gesture': '#FFA726',
    'car_crash': '#FFB74D',
    'physical_assault': '#FF7043'
};

let currentFile = null;
let analysisHistory = [];
let currentAnalysis = null;
let violenceFrames = [];
let detectionBoxes = [];

// DOM Elements
const videoFile = document.getElementById('video-file');
const browseBtn = document.getElementById('browse-btn');
const clearBtn = document.getElementById('clear-btn');
const uploadBtn = document.getElementById('upload-btn');
const videoSection = document.getElementById('video-display-section');
const uploadSection = document.getElementById('upload-section');
const detectionVideo = document.getElementById('detection-video');
const detectionCanvas = document.getElementById('detection-canvas');
const resultsContainer = document.getElementById('results-container');
const resultsPlaceholder = document.getElementById('results-placeholder');
const loadingModal = document.getElementById('loading-modal');

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Show error notification
 */
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md animate-pulse';
    toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

/**
 * Show success notification
 */
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

/**
 * Show/hide loading modal
 */
function setLoading(visible, message = 'Analyzing video...') {
    if (visible) {
        document.getElementById('loading-detail').textContent = message;
        loadingModal.classList.remove('hidden');
    } else {
        loadingModal.classList.add('hidden');
    }
}

/**
 * Handle file selection
 */
function handleFileSelect(file) {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!CONFIG.ALLOWED_FORMATS.includes(ext)) {
        showError(`Invalid format. Allowed: ${CONFIG.ALLOWED_FORMATS.join(', ')}`);
        return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showError(`File too large. Maximum: ${formatBytes(CONFIG.MAX_FILE_SIZE)}`);
        return;
    }

    currentFile = file;
    document.getElementById('file-info-text').innerHTML = `<strong>${file.name}</strong> (${formatBytes(file.size)})`;
    uploadBtn.disabled = false;
}

/**
 * Event listeners for file upload
 */
browseBtn.addEventListener('click', () => videoFile.click());

videoFile.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
});

// Drag and drop
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('border-orange-500', 'bg-slate-700/50');
});

uploadSection.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('border-orange-500', 'bg-slate-700/50');
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('border-orange-500', 'bg-slate-700/50');
    handleFileSelect(e.dataTransfer.files[0]);
});

clearBtn.addEventListener('click', () => {
    currentFile = null;
    videoFile.value = '';
    document.getElementById('file-info-text').textContent = 'Supported formats: MP4, AVI, MOV, MKV, FLV, WMV, WebM (Max 500MB)';
    uploadBtn.disabled = true;
});

/**
 * Draw detection boxes on canvas
 */
function drawDetectionBoxes(timestamp) {
    if (!detectionCanvas || !detectionVideo.paused === false) return;

    const ctx = detectionCanvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);

    // Get frame index
    const totalDuration = detectionVideo.duration;
    const frameIndex = Math.floor((timestamp / totalDuration) * (currentAnalysis.total_frames || 200));
    
    // Get violence confidence for this frame
    const confidence = violenceFrames[frameIndex] || 0;

    // Draw detection boxes
    if (confidence > CONFIG.CONFIDENCE_THRESHOLD) {
        // Get canvas dimensions
        const videoWidth = detectionVideo.videoWidth;
        const videoHeight = detectionVideo.videoHeight;
        const displayWidth = detectionCanvas.width;
        const displayHeight = detectionCanvas.height;

        const scaleX = displayWidth / videoWidth;
        const scaleY = displayHeight / videoHeight;

        // Determine box properties
        let boxColor, lineWidth;
        if (confidence > 0.7) {
            boxColor = '#dc2626'; // Red
            lineWidth = 4;
        } else if (confidence > 0.5) {
            boxColor = '#f97316'; // Orange
            lineWidth = 3;
        } else {
            boxColor = '#eab308'; // Yellow
            lineWidth = 2;
        }

        // Draw main detection box (center-based, covers 60% of video)
        const boxWidth = displayWidth * 0.6;
        const boxHeight = displayHeight * 0.6;
        const boxX = (displayWidth - boxWidth) / 2;
        const boxY = (displayHeight - boxHeight) / 2;

        // Draw box
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        ctx.setLineDash([]);

        // Draw corner markers
        const cornerSize = 20;
        ctx.fillStyle = boxColor;
        // Top-left
        ctx.fillRect(boxX, boxY, cornerSize, lineWidth);
        ctx.fillRect(boxX, boxY, lineWidth, cornerSize);
        // Top-right
        ctx.fillRect(boxX + boxWidth - cornerSize, boxY, cornerSize, lineWidth);
        ctx.fillRect(boxX + boxWidth - lineWidth, boxY, lineWidth, cornerSize);
        // Bottom-left
        ctx.fillRect(boxX, boxY + boxHeight - lineWidth, cornerSize, lineWidth);
        ctx.fillRect(boxX, boxY + boxHeight - cornerSize, lineWidth, cornerSize);
        // Bottom-right
        ctx.fillRect(boxX + boxWidth - cornerSize, boxY + boxHeight - lineWidth, cornerSize, lineWidth);
        ctx.fillRect(boxX + boxWidth - lineWidth, boxY + boxHeight - cornerSize, lineWidth, cornerSize);

        // Draw label
        ctx.fillStyle = boxColor;
        ctx.font = 'bold 16px Arial';
        const label = `Violence: ${(confidence * 100).toFixed(1)}%`;
        const textWidth = ctx.measureText(label).width;
        const padding = 8;

        ctx.fillRect(boxX, boxY - 35, textWidth + padding * 2, 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, boxX + padding, boxY - 10);

        // Add glow effect
        ctx.strokeStyle = boxColor;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = lineWidth + 4;
        ctx.strokeRect(boxX - 5, boxY - 5, boxWidth + 10, boxHeight + 10);
        ctx.globalAlpha = 1.0;
    }
}

/**
 * Setup video player with detection
 */
function setupVideoPlayer(videoPath) {
    // Set video source
    detectionVideo.src = videoPath;
    detectionVideo.autoplay = true;

    // Setup canvas
    const updateCanvasDimensions = () => {
        detectionCanvas.width = detectionVideo.videoWidth;
        detectionCanvas.height = detectionVideo.videoHeight;
    };

    detectionVideo.addEventListener('loadedmetadata', updateCanvasDimensions);

    // Show canvas overlay
    detectionCanvas.classList.remove('hidden');

    // Timeline setup
    createViolenceTimeline();

    // Update during playback
    detectionVideo.addEventListener('timeupdate', () => {
        updateFrameInfo();
        drawDetectionBoxes(detectionVideo.currentTime);
    });

    // Show video section
    videoSection.classList.remove('hidden');
    uploadSection.style.display = 'none';
}

/**
 * Create violence detection timeline
 */
function createViolenceTimeline() {
    const timeline = document.getElementById('violence-timeline');
    timeline.innerHTML = '';

    if (!violenceFrames || violenceFrames.length === 0) return;

    const totalFrames = currentAnalysis.total_frames || 200;
    const segmentWidth = (timeline.offsetWidth - 8) / totalFrames;

    violenceFrames.forEach((confidence, frameIndex) => {
        if (confidence > CONFIG.CONFIDENCE_THRESHOLD) {
            const segment = document.createElement('div');
            segment.className = 'absolute h-full transition-opacity hover:opacity-100';
            segment.style.left = (frameIndex * segmentWidth) + 'px';
            segment.style.width = segmentWidth + 'px';

            if (confidence > 0.7) {
                segment.style.backgroundColor = '#dc2626';
                segment.style.opacity = '0.8';
            } else if (confidence > 0.5) {
                segment.style.backgroundColor = '#f97316';
                segment.style.opacity = '0.6';
            } else {
                segment.style.backgroundColor = '#eab308';
                segment.style.opacity = '0.4';
            }

            segment.title = `Frame ${frameIndex}: ${(confidence * 100).toFixed(1)}%`;
            segment.addEventListener('click', () => {
                const time = (frameIndex / totalFrames) * detectionVideo.duration;
                detectionVideo.currentTime = time;
            });

            timeline.appendChild(segment);
        }
    });
}

/**
 * Update frame information during playback
 */
function updateFrameInfo() {
    if (!detectionVideo.duration) return;

    const currentTime = detectionVideo.currentTime;
    const totalTime = detectionVideo.duration;
    const frameIndex = Math.floor((currentTime / totalTime) * (currentAnalysis.total_frames || 200));
    const confidence = violenceFrames[frameIndex] || 0;

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('current-frame').textContent = frameIndex + 1;
    document.getElementById('current-time').textContent = timeStr;
    document.getElementById('frame-violence-score').textContent = (confidence * 100).toFixed(1) + '%';
}

/**
 * Display detected labels
 */
function displayLabels(labels) {
    const labelsDiv = document.getElementById('detected-labels');
    labelsDiv.innerHTML = '';

    for (const [label, confidence] of Object.entries(labels)) {
        const badge = document.createElement('span');
        badge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-slate-700 text-white';
        const color = VIOLENCE_LABELS[label] || '#808080';
        badge.style.borderLeft = `3px solid ${color}`;
        badge.textContent = `${label.replace(/_/g, ' ')} (${(confidence * 100).toFixed(0)}%)`;
        labelsDiv.appendChild(badge);
    }
}

/**
 * Display results
 */
function displayResults(data) {
    currentAnalysis = data;
    violenceFrames = data.frame_predictions || [];

    // Update confidence
    const confidence = (data.confidence * 100).toFixed(1);
    document.getElementById('overall-confidence').textContent = confidence + '%';
    document.getElementById('confidence-bar').style.width = confidence + '%';

    // Update classification badge
    const badge = document.getElementById('classification-badge');
    if (data.is_violence) {
        badge.className = 'px-4 py-2 rounded-lg font-semibold bg-red-600/20 text-red-400 border border-red-600 text-center';
        badge.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Violence Detected';
    } else {
        badge.className = 'px-4 py-2 rounded-lg font-semibold bg-green-600/20 text-green-400 border border-green-600 text-center';
        badge.innerHTML = '<i class="fas fa-check-circle mr-2"></i>No Violence';
    }

    // Update video info
    document.getElementById('result-filename').textContent = data.filename || 'Unknown';
    document.getElementById('result-total-frames').textContent = data.total_frames || '0';
    document.getElementById('result-analyzed-frames').textContent = data.extracted_frames || '0';
    document.getElementById('result-processing-time').textContent = (data.processing_time || 0).toFixed(2) + 's';

    // Display labels
    if (data.labels) {
        displayLabels(data.labels);
    }

    // Show results
    resultsContainer.classList.remove('hidden');
    resultsPlaceholder.classList.add('hidden');

    // Setup video player
    if (data.video_path) {
        setupVideoPlayer(data.video_path);
    }
}

/**
 * Upload video
 */
uploadBtn.addEventListener('click', async () => {
    if (!currentFile) {
        showError('Please select a video file');
        return;
    }

    const formData = new FormData();
    formData.append('video', currentFile);

    try {
        setLoading(true, 'Uploading and analyzing video...');
        uploadBtn.disabled = true;

        const response = await fetch(`${CONFIG.API_BASE}/upload-video`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setLoading(false);

        if (data.error) {
            showError(data.error);
            uploadBtn.disabled = false;
            return;
        }

        displayResults(data);
        showSuccess('Video analysis completed!');

        // Add to history
        analysisHistory.unshift({
            id: Date.now(),
            filename: currentFile.name,
            confidence: data.confidence,
            result: data.is_violence ? 'Violence' : 'No Violence',
            timestamp: new Date().toLocaleString()
        });

        // Reset
        currentFile = null;
        videoFile.value = '';
        document.getElementById('file-info-text').textContent = 'Supported formats: MP4, AVI, MOV, MKV, FLV, WMV, WebM (Max 500MB)';
        uploadBtn.disabled = false;

    } catch (error) {
        setLoading(false);
        uploadBtn.disabled = false;
        showError(`Error: ${error.message}`);
        console.error(error);
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    uploadBtn.disabled = true;
});
