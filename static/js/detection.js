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

let currentFile = null;
let analysisHistory = [];
let currentAnalysis = null;
let violenceFrames = [];
let detectionBoxes = [];
let videoPlayCount = 0;

// DOM Elements
const videoFileInput = document.getElementById('video-file');
const clearBtn = document.getElementById('clear-btn');
const uploadBtn = document.getElementById('upload-btn');
const analysisVideo = document.getElementById('analysis-video');
const annotationCanvas = document.getElementById('annotation-canvas');
const resultsContainer = document.getElementById('results-container');
const noResults = document.getElementById('no-results');
const loadingModal = document.getElementById('loading-modal');
const loadingMessage = document.getElementById('loading-message');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const violenceTimeline = document.getElementById('violence-timeline');
const videoContainer = document.getElementById('video-container');

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
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const bgColor = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600';
    const icon = type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    const toast = document.createElement('div');
    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in`;
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Set loading state
 */
function setLoading(visible, message = 'Analyzing video...') {
    if (visible) {
        loadingMessage.textContent = message;
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
        showToast(`Invalid format. Allowed: ${CONFIG.ALLOWED_FORMATS.join(', ')}`, 'error');
        return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast(`File too large. Maximum: ${formatBytes(CONFIG.MAX_FILE_SIZE)}`, 'error');
        return;
    }

    currentFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    fileInfo.classList.remove('hidden');
    uploadBtn.disabled = false;
    
    showToast(`File selected: ${file.name}`, 'info');
}

/**
 * Handle video upload and analysis
 */
async function handleUpload() {
    if (!currentFile) {
        showToast('Please select a video file first', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('video', currentFile);

    setLoading(true, 'Uploading video...');
    uploadBtn.disabled = true;

    try {
        const response = await fetch(`${CONFIG.API_BASE}/upload-video`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        if (!data.success) {
            throw new Error(data.error || data.message || 'Analysis failed');
        }

        currentAnalysis = data;
        violenceFrames = data.frame_predictions || [];
        
        setLoading(false);
        displayResults(data);
        setupVideoPlayer(data);
        
        showToast('Video analysis complete!', 'success');
        
        // Add to history
        const historyEntry = {
            filename: data.filename,
            confidence: data.confidence,
            is_violence: data.is_violence,
            timestamp: new Date().toLocaleTimeString()
        };
        analysisHistory.unshift(historyEntry);
        updateHistoryTable();
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast(`Error: ${error.message}`, 'error');
        setLoading(false);
    } finally {
        uploadBtn.disabled = false;
    }
}

/**
 * Display detection results
 */
function displayResults(data) {
    resultsContainer.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    // Update confidence scores
    document.getElementById('violence-score').textContent = (data.confidence * 100).toFixed(1) + '%';
    document.getElementById('confidence-bar').style.width = (data.confidence * 100) + '%';
    document.getElementById('overall-confidence-display').textContent = (data.confidence * 100).toFixed(1) + '%';
    
    // Update badge
    const badge = document.getElementById('result-badge');
    if (data.is_violence) {
        badge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-red-600/30 text-red-400';
        badge.textContent = 'Violence Detected';
    } else {
        badge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-green-600/30 text-green-400';
        badge.textContent = 'No Violence';
    }
    
    // Update video info
    document.getElementById('total-frames').textContent = data.total_frames;
    document.getElementById('extracted-frames').textContent = data.extracted_frames;
    document.getElementById('processing-time').textContent = (data.processing_time || 0).toFixed(2) + 's';
    
    // Update status
    document.getElementById('videos-count').textContent = analysisHistory.length;
    document.getElementById('response-time').textContent = (data.processing_time || 0).toFixed(2) + 's';
    
    // Display labels if available
    if (data.labels && data.labels.length > 0) {
        displayLabels(data.labels);
    }
    
    // Display frames if available
    if (data.frames && data.frames.length > 0) {
        displayFrames(data.frames);
    }
}

/**
 * Display detected labels/tags
 */
function displayLabels(labels) {
    const labelsSection = document.getElementById('labels-section');
    const labelsGrid = document.getElementById('labels-grid');
    
    labelsGrid.innerHTML = '';
    
    labels.forEach(label => {
        const tag = document.createElement('span');
        tag.className = 'px-3 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium';
        tag.textContent = label.replace(/_/g, ' ').toUpperCase();
        labelsGrid.appendChild(tag);
    });
    
    labelsSection.classList.remove('hidden');
}

/**
 * Display extracted frames - ONLY frames with violence detected
 */
function displayFrames(frames) {
    const previewSection = document.getElementById('preview-section');
    const framesGallery = document.getElementById('frames-gallery');
    
    framesGallery.innerHTML = '';
    
    if (!violenceFrames || violenceFrames.length === 0) {
        framesGallery.innerHTML = '<p class="text-slate-400 col-span-full text-center">No violence detected in this video</p>';
        previewSection.classList.remove('hidden');
        return;
    }
    
    // Get total frames and calculate frame indices
    const totalFrames = violenceFrames.length;
    const framesPerPreview = Math.max(1, Math.floor(frames.length / Math.min(24, totalFrames)));
    
    // Only show frames where violence confidence > 0.3 (above threshold)
    let violentFramesCount = 0;
    frames.forEach((frameData, index) => {
        // Map frame index to prediction index
        const predictionIndex = Math.floor((index / frames.length) * violenceFrames.length);
        const confidence = violenceFrames[predictionIndex] || 0;
        
        // Only display frames with violence detected (confidence > 0.3)
        if (confidence > 0.3) {
            violentFramesCount++;
            
            const frameDiv = document.createElement('div');
            frameDiv.className = 'relative rounded-lg overflow-hidden bg-slate-700 cursor-pointer hover:shadow-lg transition group border-2';
            
            // Color border based on violence level
            if (confidence > 0.7) {
                frameDiv.classList.add('border-red-600');
            } else if (confidence > 0.5) {
                frameDiv.classList.add('border-orange-600');
            } else {
                frameDiv.classList.add('border-yellow-600');
            }
            
            const img = document.createElement('img');
            img.src = `data:image/jpeg;base64,${frameData}`;
            img.className = 'w-full h-auto aspect-video object-cover group-hover:opacity-75 transition';
            
            const overlay = document.createElement('div');
            overlay.className = 'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center';
            overlay.innerHTML = `
                <span class="text-white text-sm font-semibold">Frame ${index + 1}</span>
                <span class="text-yellow-300 text-xs mt-1">${(confidence * 100).toFixed(1)}% Violence</span>
            `;
            
            frameDiv.appendChild(img);
            frameDiv.appendChild(overlay);
            framesGallery.appendChild(frameDiv);
            
            // Limit to 24 violent frames
            if (violentFramesCount >= 24) return;
        }
    });
    
    if (violentFramesCount === 0) {
        framesGallery.innerHTML = '<p class="text-slate-400 col-span-full text-center">No violent frames detected above threshold (30%)</p>';
    }
    
    previewSection.classList.remove('hidden');
}

/**
 * Setup video player with canvas overlay
 */
function setupVideoPlayer(data) {
    // Scroll to video player
    const videoElement = document.getElementById('analysis-video');
    if (videoElement) {
        videoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Set video source
    analysisVideo.src = data.video_path;
    analysisVideo.autoplay = true;  // Enable autoplay
    analysisVideo.controls = true;
    analysisVideo.muted = true;  // Mute for autoplay compliance
    
    // Setup canvas
    const ctx = annotationCanvas.getContext('2d');
    
    // Configure canvas positioning
    annotationCanvas.style.position = 'absolute';
    annotationCanvas.style.top = '0';
    annotationCanvas.style.left = '0';
    annotationCanvas.style.cursor = 'pointer';
    annotationCanvas.style.zIndex = '5';
    
    // Update canvas when video metadata loads
    analysisVideo.addEventListener('loadedmetadata', function() {
        annotationCanvas.width = videoContainer.offsetWidth;
        annotationCanvas.height = annotationCanvas.width * (analysisVideo.videoHeight / analysisVideo.videoWidth);
        annotationCanvas.style.display = 'block';
        
        // Create violence timeline
        createViolenceTimeline(data.frame_predictions);
        
        // Auto-start playback
        analysisVideo.play().catch(e => console.log('Autoplay prevented:', e));
    }, { once: true });
    
    // Track video playback for frame updates
    analysisVideo.addEventListener('timeupdate', function() {
        updateFrameInfo(this);
        drawDetectionBoxes(this, ctx);
    });
    
    // Show overlay on play
    analysisVideo.addEventListener('play', function() {
        annotationCanvas.style.display = 'block';
        document.getElementById('violence-overlay').classList.remove('hidden');
    });
    
    // Hide overlay on pause
    analysisVideo.addEventListener('pause', function() {
        document.getElementById('violence-overlay').classList.add('hidden');
    });
}

/**
 * Create violence timeline with clickable segments
 */
function createViolenceTimeline(framePredictions) {
    violenceTimeline.innerHTML = '';
    
    if (!framePredictions || framePredictions.length === 0) {
        violenceTimeline.innerHTML = '<div class="w-full h-full bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">No frame predictions</div>';
        return;
    }
    
    const segmentWidth = 100 / framePredictions.length;
    
    framePredictions.forEach((confidence, index) => {
        const segment = document.createElement('div');
        segment.className = 'absolute h-full cursor-pointer hover:opacity-100 transition';
        segment.style.width = segmentWidth + '%';
        segment.style.left = (index * segmentWidth) + '%';
        
        // Color based on confidence
        if (confidence > 0.7) {
            segment.className += ' high-violence';
        } else if (confidence > 0.5) {
            segment.className += ' medium-violence';
        } else if (confidence > CONFIG.CONFIDENCE_THRESHOLD) {
            segment.className += ' low-violence';
        } else {
            segment.style.backgroundColor = 'rgba(100, 116, 139, 0.3)';
        }
        
        // Click to seek
        segment.addEventListener('click', (e) => {
            const clickRatio = e.offsetX / violenceTimeline.offsetWidth;
            analysisVideo.currentTime = clickRatio * analysisVideo.duration;
        });
        
        // Tooltip
        segment.title = `Frame ${index}: ${(confidence * 100).toFixed(1)}% violence`;
        
        violenceTimeline.appendChild(segment);
    });
}

/**
 * Update frame information display
 */
function updateFrameInfo(video) {
    if (!video.duration || !currentAnalysis || !violenceFrames.length) return;
    
    const currentTime = video.currentTime;
    const frameNumber = Math.floor((currentTime / video.duration) * violenceFrames.length);
    const confidence = violenceFrames[frameNumber] || 0;
    
    document.getElementById('current-frame').textContent = frameNumber + 1;
    document.getElementById('current-time').textContent = formatTime(currentTime);
    document.getElementById('frame-confidence').textContent = (confidence * 100).toFixed(1) + '%';
    document.getElementById('overlay-score').textContent = (confidence * 100).toFixed(1) + '%';
}

/**
 * Draw YOLO-style detection boxes on canvas
 */
function drawDetectionBoxes(video, ctx) {
    if (!video.duration || !violenceFrames.length) return;
    
    ctx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
    
    const frameNumber = Math.floor((video.currentTime / video.duration) * violenceFrames.length);
    const confidence = violenceFrames[frameNumber] || 0;
    
    if (confidence < CONFIG.CONFIDENCE_THRESHOLD) return;
    
    // Determine colors based on confidence
    let boxColor = '#eab308';  // Yellow - Low
    let lineWidth = 2;
    
    if (confidence > 0.7) {
        boxColor = '#dc2626';  // Red - High
        lineWidth = 4;
    } else if (confidence > 0.5) {
        boxColor = '#f97316';  // Orange - Medium
        lineWidth = 3;
    }
    
    // Draw detection box (center of video, 60% of area)
    const boxWidth = annotationCanvas.width * 0.6;
    const boxHeight = annotationCanvas.height * 0.6;
    const boxX = (annotationCanvas.width - boxWidth) / 2;
    const boxY = (annotationCanvas.height - boxHeight) / 2;
    
    // Draw main box
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
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
    
    // Draw glow effect
    ctx.strokeStyle = boxColor.replace(')', ', 0.3)').replace('rgb', 'rgba');
    ctx.lineWidth = lineWidth + 4;
    ctx.strokeRect(boxX - 5, boxY - 5, boxWidth + 10, boxHeight + 10);
    
    // Draw confidence label
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = boxColor;
    ctx.fillText(`Violence: ${(confidence * 100).toFixed(1)}%`, boxX + 10, boxY - 10);
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Update history table
 */
function updateHistoryTable() {
    const historyTable = document.getElementById('history-table');
    
    if (analysisHistory.length === 0) {
        historyTable.innerHTML = `
            <tr>
                <td colspan="5" class="py-8 px-4 text-center text-slate-400">
                    <i class="fas fa-database text-2xl mb-2 block"></i>
                    <p>No analysis history yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    historyTable.innerHTML = analysisHistory.map((entry, index) => `
        <tr class="hover:bg-slate-700/30 transition">
            <td class="py-3 px-4 text-slate-400">${index + 1}</td>
            <td class="py-3 px-4 text-white truncate max-w-xs">${entry.filename}</td>
            <td class="py-3 px-4">
                <span class="text-blue-400 font-semibold">${(entry.confidence * 100).toFixed(1)}%</span>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded text-xs font-semibold ${entry.is_violence ? 'bg-red-600/30 text-red-400' : 'bg-green-600/30 text-green-400'}">
                    ${entry.is_violence ? 'Violence' : 'Safe'}
                </span>
            </td>
            <td class="py-3 px-4 text-slate-400">${entry.timestamp}</td>
        </tr>
    `).join('');
}

/**
 * Clear all data
 */
function handleClear() {
    currentFile = null;
    currentAnalysis = null;
    violenceFrames = [];
    
    // Reset UI
    videoFileInput.value = '';
    fileInfo.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    noResults.classList.remove('hidden');
    document.getElementById('labels-section').classList.add('hidden');
    document.getElementById('preview-section').classList.add('hidden');
    analysisVideo.src = '';
    uploadBtn.disabled = true;
    
    showToast('Cleared all data', 'info');
}

/**
 * Event Listeners
 */

// File input
videoFileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
});

// Drag and drop
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

// Upload button
uploadBtn.addEventListener('click', handleUpload);

// Clear button
clearBtn.addEventListener('click', handleClear);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('XDVioDet Detection UI initialized');
    uploadBtn.disabled = true;
});
