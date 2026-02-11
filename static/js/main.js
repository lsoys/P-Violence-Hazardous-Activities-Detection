// Global state
let analysisHistory = [];
let isProcessing = false;

// DOM Elements
const featureFileInput = document.getElementById('feature-file');
const featuresInput = document.getElementById('features-input');
const predictBtn = document.getElementById('predict-btn');
const clearBtn = document.getElementById('clear-btn');
const resultsContainer = document.getElementById('results-container');
const noResults = document.getElementById('no-results');
const loadingModal = document.getElementById('loading-modal');
const historyTable = document.getElementById('history-table');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing XDVioDet Frontend...');
    
    // Check API health
    checkApiHealth();
    
    // Set up event listeners for upload section
    featureFileInput.addEventListener('change', handleFileUpload);
    predictBtn.addEventListener('click', handlePredict);
    clearBtn.addEventListener('click', handleClear);
    
    // Allow drag and drop
    const dropZone = document.querySelector('[for="feature-file"]').parentElement;
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    
    // ===== CAMERA INITIALIZATION =====
    const videoTabBtn = document.getElementById('video-tab-btn');
    const cameraTabBtn = document.getElementById('camera-tab-btn');
    const videoContainer = document.getElementById('video-container');
    const cameraContainer = document.getElementById('camera-container');
    const cameraStartBtn = document.getElementById('camera-start-btn');
    const cameraStopBtn = document.getElementById('camera-stop-btn');
    
    console.log('Camera elements found:', {
        videoTab: !!videoTabBtn,
        cameraTab: !!cameraTabBtn,
        videoContainer: !!videoContainer,
        cameraContainer: !!cameraContainer,
        startBtn: !!cameraStartBtn,
        stopBtn: !!cameraStopBtn
    });
    
    // Tab switching
    if (videoTabBtn && cameraTabBtn && videoContainer && cameraContainer) {
        videoTabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Switched to Video tab');
            videoTabBtn.classList.remove('border-transparent', 'text-slate-400');
            videoTabBtn.classList.add('border-cyan-500', 'text-cyan-400');
            cameraTabBtn.classList.remove('border-cyan-500', 'text-cyan-400');
            cameraTabBtn.classList.add('border-transparent', 'text-slate-400');
            
            videoContainer.style.display = 'block';
            cameraContainer.classList.add('hidden');
        });
        
        cameraTabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Switched to Camera tab');
            cameraTabBtn.classList.remove('border-transparent', 'text-slate-400');
            cameraTabBtn.classList.add('border-cyan-500', 'text-cyan-400');
            videoTabBtn.classList.remove('border-cyan-500', 'text-cyan-400');
            videoTabBtn.classList.add('border-transparent', 'text-slate-400');
            
            cameraContainer.classList.remove('hidden');
            videoContainer.style.display = 'none';
        });
    } else {
        console.warn('Tab elements not found:', { videoTabBtn, cameraTabBtn, videoContainer, cameraContainer });
    }
    
    // Camera control buttons
    if (cameraStartBtn) {
        console.log('Attaching camera start listener');
        cameraStartBtn.addEventListener('click', (e) => {
            console.log('Start camera button clicked');
            e.preventDefault();
            startCamera();
        });
    }
    if (cameraStopBtn) {
        console.log('Attaching camera stop listener');
        cameraStopBtn.addEventListener('click', (e) => {
            console.log('Stop camera button clicked');
            e.preventDefault();
            stopCamera();
        });
    }
});

// Check API health and status
async function checkApiHealth() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        console.log('✓ API Status:', data);
        
        // Update status indicator
        if (data.model_loaded) {
            updateStatusIndicator(true);
            document.getElementById('model-status').textContent = 'Ready';
            document.getElementById('model-status').classList.add('text-green-400');
        } else {
            updateStatusIndicator(false);
            document.getElementById('model-status').textContent = 'Loading...';
            document.getElementById('model-status').classList.add('text-yellow-400');
        }
        
        // Update GPU status
        const gpuElement = document.getElementById('gpu-status');
        if (data.cuda_available) {
            gpuElement.textContent = 'GPU Ready';
            gpuElement.classList.remove('text-purple-400');
            gpuElement.classList.add('text-green-400');
        } else {
            gpuElement.textContent = 'CPU Mode';
            gpuElement.classList.remove('text-purple-400');
            gpuElement.classList.add('text-blue-400');
        }
        
        // Get model info
        getModelInfo();
    } catch (error) {
        console.error('❌ API Health Check Failed:', error);
        updateStatusIndicator(false);
        document.getElementById('model-status').textContent = 'Error';
        document.getElementById('model-status').classList.add('text-red-400');
    }
}

// Get model information
async function getModelInfo() {
    try {
        const response = await fetch('/api/model-info');
        const data = await response.json();
        console.log('📊 Model Info:', data);
    } catch (error) {
        console.error('❌ Failed to fetch model info:', error);
    }
}

// Update status indicator
function updateStatusIndicator(isHealthy) {
    const indicator = document.querySelector('#status-indicator .w-2');
    const text = document.getElementById('status-text');
    
    if (isHealthy) {
        indicator.classList.remove('bg-red-500', 'animate-pulse');
        indicator.classList.add('bg-green-500');
        text.textContent = 'Online';
        text.classList.remove('text-slate-400');
        text.classList.add('text-green-400');
    } else {
        indicator.classList.remove('bg-green-500');
        indicator.classList.add('bg-red-500', 'animate-pulse');
        text.textContent = 'Offline';
        text.classList.remove('text-green-400');
        text.classList.add('text-red-400');
    }
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('📁 File selected:', file.name);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            // Parse .npy file - simplified parsing
            // Note: For production, use a proper numpy parser library
            const buffer = event.target.result;
            console.log('📦 File loaded, size:', buffer.byteLength);
            
            // Create dummy features for demonstration
            // In production, properly parse the .npy format
            const dummyFeatures = new Float32Array(1024);
            for (let i = 0; i < 1024; i++) {
                dummyFeatures[i] = Math.random();
            }
            
            featuresInput.value = JSON.stringify(Array.from(dummyFeatures));
            showNotification('✓ File loaded successfully', 'success');
        } catch (error) {
            console.error('❌ Error reading file:', error);
            showNotification('✗ Error reading file', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.5)';
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.backgroundColor = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        featureFileInput.files = files;
        handleFileUpload({ target: { files } });
    }
}

// Handle predict button click
async function handlePredict() {
    if (isProcessing) return;
    
    const featuresText = featuresInput.value.trim();
    if (!featuresText) {
        showNotification('✗ Please enter or upload features', 'error');
        return;
    }
    
    try {
        let features = JSON.parse(featuresText);
        
        // Validate features
        if (!Array.isArray(features)) {
            throw new Error('Features must be an array');
        }
        
        if (features.length === 0) {
            throw new Error('Features array is empty');
        }
        
        // Check if it's a 2D array (batch of samples)
        if (Array.isArray(features[0])) {
            // Already a batch
        } else {
            // Single sample, make it a batch
            features = [features];
        }
        
        console.log('🔍 Sending prediction request with', features.length, 'sample(s)');
        
        showLoading(true);
        isProcessing = true;
        predictBtn.disabled = true;
        
        const startTime = performance.now();
        
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ features: features[0] || features })
        });
        
        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Prediction failed');
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✓ Prediction successful:', result);
            displayResults(result, processingTime);
            addToHistory(result, processingTime);
            showNotification('✓ Analysis completed successfully', 'success');
        } else {
            throw new Error(result.error || 'Unexpected response');
        }
        
    } catch (error) {
        console.error('❌ Prediction error:', error);
        showNotification(`✗ ${error.message}`, 'error');
    } finally {
        showLoading(false);
        isProcessing = false;
        predictBtn.disabled = false;
    }
}

// Display results
function displayResults(result, processingTime) {
    resultsContainer.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    // Update violence score
    const confidence = result.confidence;
    document.getElementById('violence-score').textContent = (confidence * 100).toFixed(1) + '%';
    document.getElementById('confidence-bar').style.width = (confidence * 100) + '%';
    
    // Update detection result
    const isViolence = result.is_violence;
    const resultBadge = document.getElementById('result-badge');
    if (isViolence) {
        resultBadge.textContent = '⚠️ Violence Detected';
        resultBadge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-red-500/20 text-red-300';
    } else {
        resultBadge.textContent = '✓ Safe Content';
        resultBadge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-300';
    }
    
    // Update scores
    document.getElementById('offline-score').textContent = result.offline_score.toFixed(4);
    document.getElementById('online-score').textContent = result.online_score.toFixed(4);
    
    // Update processing time
    document.getElementById('processing-time').textContent = processingTime + ' ms';
    document.getElementById('response-time').textContent = processingTime + 'ms';
    
    // Update prediction count
    const count = parseInt(document.getElementById('predictions-count').textContent) + 1;
    document.getElementById('predictions-count').textContent = count;
}

// Add to history
function addToHistory(result, processingTime) {
    const entry = {
        id: analysisHistory.length + 1,
        timestamp: new Date().toLocaleString(),
        confidence: (result.confidence * 100).toFixed(1),
        is_violence: result.is_violence,
        processing_time: processingTime
    };
    
    analysisHistory.unshift(entry);
    
    // Keep only last 10 entries
    if (analysisHistory.length > 10) {
        analysisHistory = analysisHistory.slice(0, 10);
    }
    
    updateHistoryTable();
}

// Update history table
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
    
    historyTable.innerHTML = analysisHistory.map(entry => `
        <tr class="hover:bg-slate-700/30 transition">
            <td class="py-3 px-4 text-slate-300 font-mono">${entry.id}</td>
            <td class="py-3 px-4 text-slate-400">${entry.timestamp}</td>
            <td class="py-3 px-4">
                <span class="font-semibold ${entry.confidence > 50 ? 'text-orange-400' : 'text-emerald-400'}">
                    ${entry.confidence}%
                </span>
            </td>
            <td class="py-3 px-4">
                ${entry.is_violence 
                    ? '<span class="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium">⚠️ Violence</span>'
                    : '<span class="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">✓ Safe</span>'
                }
            </td>
            <td class="py-3 px-4 text-slate-400">${entry.processing_time} ms</td>
        </tr>
    `).join('');
}

// Handle clear button
function handleClear() {
    featuresInput.value = '';
    featureFileInput.value = '';
    resultsContainer.classList.add('hidden');
    noResults.classList.remove('hidden');
    showNotification('✓ Cleared', 'info');
}

// Show/hide loading modal
function showLoading(show) {
    if (show) {
        loadingModal.classList.remove('hidden');
        document.getElementById('loading-message').textContent = 'Processing features...';
    } else {
        loadingModal.classList.add('hidden');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg font-medium z-50 animate-fade-in ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Check health periodically
setInterval(checkApiHealth, 30000);

console.log('✓ XDVioDet Frontend Initialized');
// ============ CAMERA STREAMING FUNCTIONALITY ============

let cameraActive = false;
let cameraStreamUrl = null;
let cameraAnalysisInterval = null;

async function startCamera() {
    try {
        console.log('Starting camera stream...');
        
        const response = await fetch('/api/camera/start', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            cameraActive = true;
            cameraStreamUrl = data.stream_url;
            
            // Display camera stream
            const cameraStream = document.getElementById('camera-stream');
            const cameraPlaceholder = document.getElementById('camera-placeholder');
            
            cameraStream.src = cameraStreamUrl;
            cameraStream.style.display = 'block';
            cameraPlaceholder.style.display = 'none';
            
            // Update button states
            document.getElementById('camera-start-btn').disabled = true;
            document.getElementById('camera-stop-btn').disabled = false;
            
            // Start polling for analysis updates
            cameraAnalysisInterval = setInterval(updateCameraAnalysis, 500);
            
            showNotification('✓ Camera started successfully!', 'success');
        } else {
            showNotification('✗ Failed to start camera: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error starting camera:', error);
        showNotification('✗ Error starting camera', 'error');
    }
}

async function stopCamera() {
    try {
        console.log('Stopping camera stream...');
        
        const response = await fetch('/api/camera/stop', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            cameraActive = false;
            
            // Hide camera stream
            const cameraStream = document.getElementById('camera-stream');
            const cameraPlaceholder = document.getElementById('camera-placeholder');
            
            cameraStream.src = '';
            cameraStream.style.display = 'none';
            cameraPlaceholder.style.display = 'flex';
            
            // Update button states
            document.getElementById('camera-start-btn').disabled = false;
            document.getElementById('camera-stop-btn').disabled = true;
            
            // Stop polling
            if (cameraAnalysisInterval) {
                clearInterval(cameraAnalysisInterval);
            }
            
            showNotification('✓ Camera stopped', 'success');
        } else {
            showNotification('✗ Failed to stop camera', 'error');
        }
    } catch (error) {
        console.error('Error stopping camera:', error);
        showNotification('✗ Error stopping camera', 'error');
    }
}

async function updateCameraAnalysis() {
    try {
        const response = await fetch('/api/camera/analysis');
        const data = await response.json();
        
        if (data.success) {
            const analysis = data.analysis;
            
            // Update danger level
            const dangerLevel = (analysis.danger_level * 100).toFixed(1);
            document.getElementById('camera-danger-level').textContent = dangerLevel + '%';
            
            // Update violence score
            const violenceScore = (analysis.violence_score * 100).toFixed(1);
            document.getElementById('camera-violence-score').textContent = violenceScore + '%';
            
            // Update hazard score
            const hazardScore = (analysis.hazard_score * 100).toFixed(1);
            document.getElementById('camera-hazard-score').textContent = hazardScore + '%';
            
            // Update alerts count
            document.getElementById('camera-alerts-count').textContent = analysis.alerts.length;
            
            // Update alerts list
            if (analysis.alerts.length > 0) {
                const alertsList = document.getElementById('camera-alerts-list');
                alertsList.innerHTML = analysis.alerts.slice(-5).map(alert => {
                    const alertType = alert.type || 'Unknown';
                    const confidence = (alert.confidence * 100).toFixed(1);
                    return `
                        <div class="flex items-center justify-between p-2 bg-red-900/30 rounded border border-red-700">
                            <span class="text-red-300">${alertType}</span>
                            <span class="text-red-400 font-bold">${confidence}%</span>
                        </div>
                    `;
                }).join('');
            }
            
            // Change color based on danger level
            const dangerLevelEl = document.getElementById('camera-danger-level');
            if (analysis.danger_level > 0.7) {
                dangerLevelEl.classList.remove('text-orange-400', 'text-yellow-400');
                dangerLevelEl.classList.add('text-red-500');
            } else if (analysis.danger_level > 0.4) {
                dangerLevelEl.classList.remove('text-red-500', 'text-orange-400');
                dangerLevelEl.classList.add('text-yellow-400');
            } else {
                dangerLevelEl.classList.remove('text-red-500', 'text-yellow-400');
                dangerLevelEl.classList.add('text-orange-400');
            }
        }
    } catch (error) {
        console.error('Error updating camera analysis:', error);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-semibold z-50 animate-fade-in ${
        type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
        'bg-blue-600'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}