// Violence Detection System - Video Detection UI
// Handles video upload, analysis, and results visualization

// Configuration
const CONFIG = {
    MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
    ALLOWED_FORMATS: ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'],
    API_BASE: '/api'
};

// Violence labels with colors
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

// Global state
let selectedFile = null;
let analysisHistory = [];
let currentResultId = null;
let currentAnalysisData = null; // Store current analysis data
let violenceFrames = []; // Store frame-level predictions

// DOM Elements
const videoFileInput = document.getElementById('video-file');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const uploadBtn = document.getElementById('upload-btn');
const clearBtn = document.getElementById('clear-btn');
const resultsContainer = document.getElementById('results-container');
const noResults = document.getElementById('no-results');
const labelsSection = document.getElementById('labels-section');
const previewSection = document.getElementById('preview-section');
const playerSection = document.getElementById('player-section');
const historyTable = document.getElementById('history-table');
const loadingModal = document.getElementById('loading-modal');
const loadingMessage = document.getElementById('loading-message');
const analysisVideo = document.getElementById('analysis-video');
const violenceTimeline = document.getElementById('violence-timeline');
const violenceOverlay = document.getElementById('violence-overlay');

/**
 * Format bytes to human readable format
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
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * Show success notification
 */
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
    successDiv.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 4000);
}

/**
 * Show/hide loading modal
 */
function setLoading(isLoading, message = 'Processing video...') {
    if (isLoading) {
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
    // Validate file
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!CONFIG.ALLOWED_FORMATS.includes(fileExt)) {
        showError(`Invalid format. Allowed: ${CONFIG.ALLOWED_FORMATS.join(', ')}`);
        return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showError(`File too large. Maximum: ${formatBytes(CONFIG.MAX_FILE_SIZE)}`);
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    fileInfo.classList.remove('hidden');
    uploadBtn.disabled = false;
}

/**
 * Handle file input change
 */
videoFileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
});

/**
 * Handle drag and drop
 */
const dropZone = document.querySelector('label[for="video-file"]');
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-orange-500', 'bg-slate-700/50');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-orange-500', 'bg-slate-700/50');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-orange-500', 'bg-slate-700/50');
    handleFileSelect(e.dataTransfer.files[0]);
});

/**
 * Clear form
 */
clearBtn.addEventListener('click', () => {
    selectedFile = null;
    videoFileInput.value = '';
    fileInfo.classList.add('hidden');
    uploadBtn.disabled = true;
});

/**
 * Display detected labels
 */
function displayLabels(detectedLabels) {
    const labelsGrid = document.getElementById('labels-grid');
    labelsGrid.innerHTML = '';

    for (const [label, confidence] of Object.entries(detectedLabels)) {
        const color = VIOLENCE_LABELS[label] || '#808080';
        const labelEl = document.createElement('div');
        labelEl.className = 'p-3 rounded-lg text-center transition transform hover:scale-105 cursor-pointer';
        labelEl.style.backgroundColor = color + '20';
        labelEl.style.borderLeft = `4px solid ${color}`;
        labelEl.innerHTML = `
            <p class="text-xs font-bold uppercase text-slate-200 truncate">${label.replace(/_/g, ' ')}</p>
            <p class="text-sm font-semibold mt-1" style="color: ${color};">${(confidence * 100).toFixed(1)}%</p>
        `;
        labelsGrid.appendChild(labelEl);
    }

    labelsSection.classList.remove('hidden');
}

/**
 * Display extracted frames
 */
function displayFrames(frames) {
    const framesGallery = document.getElementById('frames-gallery');
    framesGallery.innerHTML = '';

    frames.forEach((frameData, index) => {
        const frameEl = document.createElement('div');
        frameEl.className = 'relative group cursor-pointer rounded-lg overflow-hidden border border-slate-600 hover:border-orange-500 transition';
        frameEl.innerHTML = `
            <img src="data:image/jpeg;base64,${frameData}" alt="Frame ${index + 1}" class="w-full h-24 object-cover" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <span class="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition">Frame ${index + 1}</span>
            </div>
        `;
        framesGallery.appendChild(frameEl);
    });

    previewSection.classList.remove('hidden');
}

/**
 * Create violence detection timeline visualization
 */
function createViolenceTimeline(totalFrames, violenceData) {
    violenceTimeline.innerHTML = '';
    
    if (!violenceData || violenceData.length === 0) {
        violenceTimeline.innerHTML = '<div class="w-full h-full bg-emerald-600/20 rounded-lg flex items-center justify-center"><span class="text-xs text-emerald-400">No violence detected</span></div>';
        return;
    }

    // Create segments for each frame
    const segmentWidth = (violenceTimeline.offsetWidth - 4) / totalFrames;
    
    violenceData.forEach((confidence, frameIndex) => {
        if (confidence > 0.3) { // Only show frames with significant violence score
            const segment = document.createElement('div');
            segment.className = 'absolute h-full transition-all';
            segment.style.left = (frameIndex * segmentWidth) + 'px';
            segment.style.width = segmentWidth + 'px';
            
            // Color based on confidence
            if (confidence > 0.7) {
                segment.style.backgroundColor = '#DC2626'; // Red
            } else if (confidence > 0.5) {
                segment.style.backgroundColor = '#F97316'; // Orange
            } else {
                segment.style.backgroundColor = '#EAB308'; // Yellow
            }
            
            segment.title = `Frame ${frameIndex + 1}: ${(confidence * 100).toFixed(1)}%`;
            violenceTimeline.appendChild(segment);
        }
    });
}

/**
 * Setup video player with detection data
 */
function setupVideoPlayer(videoPath) {
    // Set video source
    analysisVideo.src = videoPath;
    
    // Update timeline
    const totalFrames = currentAnalysisData.total_frames || 200;
    createViolenceTimeline(totalFrames, violenceFrames);

    // Update video event listeners
    analysisVideo.addEventListener('timeupdate', updateFrameInfo);
    analysisVideo.addEventListener('play', () => {
        violenceOverlay.classList.remove('hidden');
    });
    analysisVideo.addEventListener('pause', () => {
        violenceOverlay.classList.add('hidden');
    });
    
    // Auto-play the video
    analysisVideo.play().catch(err => {
        console.warn('Autoplay prevented:', err);
    });
    
    playerSection.classList.remove('hidden');
}

/**
 * Update frame information during playback
 */
function updateFrameInfo() {
    if (!analysisVideo.duration) return;
    
    const currentTime = analysisVideo.currentTime;
    const totalTime = analysisVideo.duration;
    const frameNumber = Math.floor((currentTime / totalTime) * (currentAnalysisData.total_frames || 200));
    const frameConfidence = violenceFrames[frameNumber] || 0;
    
    // Format time
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('current-frame').textContent = frameNumber + 1;
    document.getElementById('current-time').textContent = timeStr;
    document.getElementById('frame-confidence').textContent = (frameConfidence * 100).toFixed(1) + '%';
    
    // Update overlay score
    const overlayScore = document.getElementById('overlay-score');
    if (overlayScore) {
        overlayScore.textContent = (frameConfidence * 100).toFixed(1) + '%';
        // Update color based on confidence
        if (frameConfidence > 0.7) {
            overlayScore.className = 'text-2xl font-bold text-red-500';
        } else if (frameConfidence > 0.5) {
            overlayScore.className = 'text-2xl font-bold text-orange-400';
        } else {
            overlayScore.className = 'text-2xl font-bold text-yellow-400';
        }
    }
}

/**
 * Update results display
 */
function displayResults(data) {
    const violenceScore = data.confidence || 0;
    const isViolence = data.is_violence || false;

    // Store current analysis data
    currentAnalysisData = data;

    // Update confidence score
    document.getElementById('violence-score').textContent = (violenceScore * 100).toFixed(1) + '%';
    document.getElementById('confidence-bar').style.width = (violenceScore * 100) + '%';

    // Update result badge
    const resultBadge = document.getElementById('result-badge');
    if (isViolence) {
        resultBadge.className = 'px-4 py-2 rounded-full text-sm font-semibold bg-red-600/20 text-red-400 border border-red-600';
        resultBadge.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Violence Detected';
    } else {
        resultBadge.className = 'px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-600';
        resultBadge.innerHTML = '<i class="fas fa-check-circle mr-2"></i>No Violence';
    }

    // Update video info
    document.getElementById('total-frames').textContent = data.total_frames || '0';
    document.getElementById('extracted-frames').textContent = data.extracted_frames || '0';
    document.getElementById('processing-time').textContent = 
        (data.processing_time ? data.processing_time.toFixed(2) : '0') + ' s';
    
    // Update overall confidence display
    document.getElementById('overall-confidence-display').textContent = (violenceScore * 100).toFixed(1) + '%';

    // Display labels
    if (data.labels) {
        displayLabels(data.labels);
    }

    // Display frames
    if (data.frames && data.frames.length > 0) {
        displayFrames(data.frames);
    }

    // Setup video player if video path is available
    if (data.video_path) {
        // Generate frame-level violence scores
        if (data.frame_predictions) {
            violenceFrames = data.frame_predictions;
        } else {
            // Fallback: create dummy frame predictions
            const totalFrames = data.total_frames || 200;
            violenceFrames = new Array(totalFrames).fill(violenceScore);
        }
        
        setupVideoPlayer(data.video_path);
    }

    // Show results
    resultsContainer.classList.remove('hidden');
    noResults.classList.add('hidden');
}

/**
 * Upload and analyze video
 */
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        showError('Please select a video file');
        return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
        setLoading(true, `Processing ${selectedFile.name}...`);
        uploadBtn.disabled = true;

        const response = await fetch(`${CONFIG.API_BASE}/upload-video`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLoading(false);

        if (data.error) {
            showError(data.error);
            uploadBtn.disabled = false;
            return;
        }

        // Display results
        displayResults(data);

        // Add to history
        const historyItem = {
            id: Date.now(),
            video: selectedFile.name,
            confidence: data.confidence,
            result: data.is_violence ? 'Violence' : 'No Violence',
            timestamp: new Date().toLocaleString()
        };
        analysisHistory.unshift(historyItem);
        updateHistoryTable();

        showSuccess('Video analysis completed successfully!');
        currentResultId = historyItem.id;

        // Reset form
        selectedFile = null;
        videoFileInput.value = '';
        fileInfo.classList.add('hidden');
        uploadBtn.disabled = false;

    } catch (error) {
        setLoading(false);
        uploadBtn.disabled = false;
        showError(`Error: ${error.message}`);
        console.error('Upload error:', error);
    }
});

/**
 * Update history table
 */
function updateHistoryTable() {
    if (analysisHistory.length === 0) {
        historyTable.innerHTML = `
            <tr>
                <td colspan="5" class="py-8 px-4 text-center text-slate-400">
                    <i class="fas fa-database text-2xl mb-2"></i>
                    <p>No analysis history yet</p>
                </td>
            </tr>
        `;
        return;
    }

    historyTable.innerHTML = analysisHistory.map((item, index) => `
        <tr class="hover:bg-slate-700/30 transition cursor-pointer">
            <td class="py-3 px-4 text-slate-300">${index + 1}</td>
            <td class="py-3 px-4 text-slate-300 truncate max-w-xs" title="${item.video}">${item.video}</td>
            <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                    <div class="w-16 bg-slate-700 rounded-full h-1.5">
                        <div class="bg-orange-500 h-1.5 rounded-full" style="width: ${item.confidence * 100}%"></div>
                    </div>
                    <span class="text-xs font-semibold text-slate-300">${(item.confidence * 100).toFixed(0)}%</span>
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded text-sm font-medium ${
                    item.result === 'Violence' 
                        ? 'bg-red-600/20 text-red-400' 
                        : 'bg-emerald-600/20 text-emerald-400'
                }">
                    ${item.result}
                </span>
            </td>
            <td class="py-3 px-4 text-slate-400 text-sm">${item.timestamp}</td>
        </tr>
    `).join('');
}

/**
 * Initialize page
 */
function init() {
    // Set initial state
    uploadBtn.disabled = true;
    
    // Load any saved history from localStorage
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
        try {
            analysisHistory = JSON.parse(savedHistory);
            updateHistoryTable();
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }
}

// Auto-save history to localStorage
function saveHistory() {
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
}

// Save history on update
const originalUpdateHistoryTable = updateHistoryTable;
updateHistoryTable = function() {
    originalUpdateHistoryTable();
    saveHistory();
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Prevent accidental page navigation with unsaved work
window.addEventListener('beforeunload', (e) => {
    if (selectedFile) {
        e.preventDefault();
        e.returnValue = '';
    }
});
