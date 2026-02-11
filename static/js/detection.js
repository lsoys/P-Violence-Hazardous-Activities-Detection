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
    const bgColor = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : type === 'warning' ? 'bg-orange-600' : 'bg-blue-600';
    const icon = type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
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
 * Show alert banner for violence/hazard detection
 */
function showAlertBanner(data) {
    // Remove any existing alert banner
    const existingBanner = document.getElementById('alert-banner');
    if (existingBanner) existingBanner.remove();
    
    const alertTypes = [];
    if (data.is_violence) alertTypes.push('VIOLENCE');
    if (data.is_hazard) alertTypes.push('HAZARD');
    
    const labels = data.labels ? Object.keys(data.labels).join(', ').toUpperCase() : '';
    const alertCount = data.alert_count || data.alerts?.length || 0;
    
    const banner = document.createElement('div');
    banner.id = 'alert-banner';
    banner.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white py-4 px-6 z-50 animate-pulse';
    banner.innerHTML = `
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-4">
                <i class="fas fa-exclamation-triangle text-3xl"></i>
                <div>
                    <h3 class="font-bold text-xl">⚠️ ${alertTypes.join(' & ')} DETECTED!</h3>
                    <p class="text-sm opacity-90">
                        Confidence: ${(data.confidence * 100).toFixed(1)}% | 
                        ${alertCount} alerts | 
                        ${labels ? `Detected: ${labels}` : ''}
                    </p>
                </div>
            </div>
            <button onclick="dismissAlertBanner()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                <i class="fas fa-times"></i> Dismiss
            </button>
        </div>
    `;
    document.body.prepend(banner);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => dismissAlertBanner(), 10000);
}

/**
 * Dismiss alert banner
 */
function dismissAlertBanner() {
    const banner = document.getElementById('alert-banner');
    if (banner) {
        banner.style.animation = 'slideUp 0.3s ease-out forwards';
        setTimeout(() => banner.remove(), 300);
    }
}

/**
 * Play alert sound
 */
function playAlertSound() {
    try {
        // Create an audio context for alert sound
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = 880; // A5 note
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        
        // Beep pattern: 3 short beeps
        setTimeout(() => gainNode.gain.value = 0, 150);
        setTimeout(() => gainNode.gain.value = 0.3, 250);
        setTimeout(() => gainNode.gain.value = 0, 400);
        setTimeout(() => gainNode.gain.value = 0.3, 500);
        setTimeout(() => gainNode.gain.value = 0, 650);
        setTimeout(() => oscillator.stop(), 700);
    } catch (e) {
        console.log('Could not play alert sound:', e);
    }
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
        
        // Show alerts if violence/hazard detected
        if (data.is_violence || data.is_hazard) {
            showAlertBanner(data);
            playAlertSound();
        }
        
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
    
    // Update badge based on detection type
    const badge = document.getElementById('result-badge');
    if (data.is_violence || data.is_hazard) {
        badge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-red-600/30 text-red-400';
        if (data.is_violence && data.is_hazard) {
            badge.textContent = '⚠️ Violence & Hazard';
        } else if (data.is_hazard) {
            badge.textContent = '🔥 Hazard Detected';
        } else {
            badge.textContent = '⚠️ Violence Detected';
        }
    } else {
        badge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-green-600/30 text-green-400';
        badge.textContent = '✓ Safe - No Threats';
    }
    
    // Update video info
    document.getElementById('total-frames').textContent = data.total_frames;
    document.getElementById('extracted-frames').textContent = data.analyzed_frames || data.extracted_frames;
    document.getElementById('processing-time').textContent = (data.processing_time || 0).toFixed(2) + 's';
    
    // Update status
    document.getElementById('videos-count').textContent = analysisHistory.length;
    document.getElementById('response-time').textContent = (data.processing_time || 0).toFixed(2) + 's';
    
    // Display labels if available (handle both object and array format)
    if (data.labels) {
        const labelsArray = Array.isArray(data.labels) ? data.labels : Object.keys(data.labels);
        if (labelsArray.length > 0) {
            displayLabels(labelsArray, data.labels);
        }
    }
    
    // Display alerts if available
    if (data.alerts && data.alerts.length > 0) {
        displayAlerts(data.alerts);
    }
    
    // Display frames if available
    if (data.frames && data.frames.length > 0) {
        displayFrames(data.frames, data.frames_info);
    }
}

/**
 * Display detected labels/tags
 */
function displayLabels(labelsArray, labelsData) {
    const labelsSection = document.getElementById('labels-section');
    const labelsGrid = document.getElementById('labels-grid');
    
    labelsGrid.innerHTML = '';
    
    labelsArray.forEach(label => {
        const tag = document.createElement('span');
        // Get confidence if available
        const confidence = typeof labelsData === 'object' && !Array.isArray(labelsData) ? labelsData[label] : null;
        
        // Color based on type
        let colorClass = 'bg-purple-600/20 text-purple-400';
        if (['fire', 'smoke', 'hazard'].includes(label.toLowerCase())) {
            colorClass = 'bg-orange-600/20 text-orange-400';
        } else if (['violence', 'fight', 'aggression'].includes(label.toLowerCase())) {
            colorClass = 'bg-red-600/20 text-red-400';
        } else if (['knife', 'gun', 'weapon'].includes(label.toLowerCase())) {
            colorClass = 'bg-red-700/20 text-red-300';
        } else if (['person'].includes(label.toLowerCase())) {
            colorClass = 'bg-green-600/20 text-green-400';
        }
        
        tag.className = `px-3 py-2 ${colorClass} rounded-full text-sm font-medium`;
        const labelText = label.replace(/_/g, ' ').toUpperCase();
        tag.textContent = confidence ? `${labelText} (${(confidence * 100).toFixed(0)}%)` : labelText;
        labelsGrid.appendChild(tag);
    });
    
    labelsSection.classList.remove('hidden');
}

/**
 * Display alerts
 */
function displayAlerts(alerts) {
    // Create alerts section if not exists
    let alertsSection = document.getElementById('alerts-section');
    if (!alertsSection) {
        alertsSection = document.createElement('div');
        alertsSection.id = 'alerts-section';
        alertsSection.className = 'bg-slate-800/50 rounded-xl p-6 border border-slate-700';
        alertsSection.innerHTML = `
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i class="fas fa-exclamation-triangle text-red-400"></i>
                Detection Alerts
            </h3>
            <div id="alerts-list" class="space-y-2 max-h-64 overflow-y-auto"></div>
        `;
        resultsContainer.appendChild(alertsSection);
    }
    
    const alertsList = document.getElementById('alerts-list');
    alertsList.innerHTML = '';
    
    alerts.slice(0, 10).forEach(alert => {
        const severityColors = {
            'critical': 'bg-red-600/20 border-red-600 text-red-400',
            'high': 'bg-orange-600/20 border-orange-600 text-orange-400',
            'medium': 'bg-yellow-600/20 border-yellow-600 text-yellow-400',
            'low': 'bg-blue-600/20 border-blue-600 text-blue-400'
        };
        const colorClass = severityColors[alert.severity] || severityColors['medium'];
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `${colorClass} border rounded-lg p-3 text-sm`;
        alertDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="font-semibold">${alert.type.replace(/_/g, ' ')}</span>
                <span class="text-xs opacity-75">${alert.timestamp?.toFixed(1)}s</span>
            </div>
            <p class="mt-1 opacity-90">${alert.message}</p>
        `;
        alertsList.appendChild(alertDiv);
    });
    
    alertsSection.classList.remove('hidden');
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
    console.log('Setting up video player with data:', data);
    
    // Scroll to video player
    setTimeout(() => {
        const videoElement = document.getElementById('analysis-video');
        if (videoElement) {
            videoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
    
    // Set video source
    analysisVideo.src = data.video_path;
    analysisVideo.controls = true;
    analysisVideo.muted = true;  // Mute for autoplay compliance
    
    console.log('Video source set to:', data.video_path);
    
    // Setup canvas
    const ctx = annotationCanvas.getContext('2d');
    
    // Configure canvas positioning and sizing
    annotationCanvas.style.position = 'absolute';
    annotationCanvas.style.top = '0';
    annotationCanvas.style.left = '0';
    annotationCanvas.style.cursor = 'pointer';
    annotationCanvas.style.zIndex = '5';
    
    // Handle loadedmetadata event to setup canvas size
    const handleMetadataLoaded = function() {
        console.log('Video metadata loaded');
        
        // Set canvas dimensions to match container
        const rect = videoContainer.getBoundingClientRect();
        annotationCanvas.width = videoContainer.offsetWidth;
        annotationCanvas.height = videoContainer.offsetHeight;
        
        console.log('Canvas size set to:', annotationCanvas.width, 'x', annotationCanvas.height);
        
        // Create violence timeline
        if (data.frame_predictions) {
            createViolenceTimeline(data.frame_predictions);
        }
        
        // Show canvas and start playback
        annotationCanvas.style.display = 'block';
        analysisVideo.autoplay = true;
        analysisVideo.play().catch(e => console.log('Autoplay prevented:', e));
    };
    
    analysisVideo.removeEventListener('loadedmetadata', handleMetadataLoaded);
    analysisVideo.addEventListener('loadedmetadata', handleMetadataLoaded);
    
    // If metadata is already loaded, call handler
    if (analysisVideo.readyState >= 1) {
        handleMetadataLoaded();
    }
    
    // Track video playback for frame updates
    const updateFrameAndDraw = () => {
        updateFrameInfo(analysisVideo);
        drawDetectionBoxes(analysisVideo, ctx);
    };
    analysisVideo.removeEventListener('timeupdate', updateFrameAndDraw);
    analysisVideo.addEventListener('timeupdate', updateFrameAndDraw);
    
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
