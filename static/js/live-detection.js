// Live Detection Page - JavaScript
let cameraActive = false;
let cameraAnalysisInterval = null;
let sessionStartTime = null;
let framesAnalyzed = 0;
let audioAlertEnabled = true;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎥 Live Detection Page Loaded');
    
    // Get all button elements
    const startBtn = document.getElementById('live-camera-start-btn');
    const stopBtn = document.getElementById('live-camera-stop-btn');
    const resetBtn = document.getElementById('live-camera-reset-btn');
    
    console.log('Buttons found:', { startBtn: !!startBtn, stopBtn: !!stopBtn, resetBtn: !!resetBtn });
    
    // Attach click handlers
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Start button clicked');
            startLiveCamera();
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Stop button clicked');
            stopLiveCamera();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Reset button clicked');
            resetSession();
        });
    }
    
    // Audio alert toggle
    const audioToggle = document.getElementById('audio-alert-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('change', (e) => {
            audioAlertEnabled = e.target.checked;
            console.log('Audio alerts:', audioAlertEnabled ? 'enabled' : 'disabled');
        });
    }
    
    // Start session timer
    startSessionTimer();
    
    console.log('✓ Live Detection Page Ready');
});

async function startLiveCamera() {
    try {
        console.log('Starting live camera...');
        
        const response = await fetch('/api/camera/start', { method: 'POST' });
<<<<<<< HEAD

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

=======
>>>>>>> uploaded
        const data = await response.json();
        
        if (data.success) {
            cameraActive = true;
            sessionStartTime = Date.now();
            framesAnalyzed = 0;
            
            console.log('✓ Camera started');
            
            // Show loading spinner
            const placeholder = document.getElementById('camera-placeholder');
            const spinner = document.getElementById('loading-spinner');
            const stream = document.getElementById('live-stream');
            const streamIframe = document.getElementById('live-stream-iframe');
            
            spinner.style.display = 'flex';
            placeholder.style.display = 'flex';
            stream.style.display = 'none';
            streamIframe.style.display = 'none';
            
            // Wait a moment for frames to start being captured
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Try iframe first (more reliable for MJPEG)
            streamIframe.src = '/api/camera/stream';
            streamIframe.style.display = 'block';
            
            // Also set img as fallback
            stream.src = '/api/camera/stream?t=' + Date.now();
            stream.style.display = 'block';
            
            // Hide placeholder after a delay
            setTimeout(() => {
                placeholder.style.display = 'none';
                spinner.style.display = 'none';
            }, 1500);
            
            // Update buttons
            document.getElementById('live-camera-start-btn').disabled = true;
            document.getElementById('live-camera-stop-btn').disabled = false;
            document.getElementById('camera-status').textContent = 'Active';
            document.getElementById('camera-status').classList.remove('text-orange-400', 'text-red-400');
            document.getElementById('camera-status').classList.add('text-green-400');
            
            // Start polling analysis
            cameraAnalysisInterval = setInterval(updateLiveAnalysis, 500);
            
            showAlert('success', '✓ Camera started! Initializing stream...');
            console.log('✓ Camera stream initialized');
        } else {
            showAlert('error', '✗ Failed to start camera: ' + (data.error || 'Unknown error'));
            console.error('Camera start error:', data.error);
        }
    } catch (error) {
        console.error('Error starting camera:', error);
        showAlert('error', '✗ Error starting camera: ' + error.message);
    }
}

async function stopLiveCamera() {
    try {
        console.log('Stopping live camera...');
        
        const response = await fetch('/api/camera/stop', { method: 'POST' });
<<<<<<< HEAD

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

=======
>>>>>>> uploaded
        const data = await response.json();
        
        if (data.success) {
            cameraActive = false;
            
            if (cameraAnalysisInterval) {
                clearInterval(cameraAnalysisInterval);
            }
            
            // Hide stream
            const stream = document.getElementById('live-stream');
            const streamIframe = document.getElementById('live-stream-iframe');
            const placeholder = document.getElementById('camera-placeholder');
            const spinner = document.getElementById('loading-spinner');
            
            stream.src = '';
            stream.style.display = 'none';
            streamIframe.src = '';
            streamIframe.style.display = 'none';
            placeholder.style.display = 'flex';
            spinner.style.display = 'none';
            
            // Update buttons
            document.getElementById('live-camera-start-btn').disabled = false;
            document.getElementById('live-camera-stop-btn').disabled = true;
            document.getElementById('camera-status').textContent = 'Offline';
            document.getElementById('camera-status').classList.remove('text-green-400');
            document.getElementById('camera-status').classList.add('text-slate-400');
            
            console.log('✓ Camera stopped');
            showAlert('info', 'Camera stopped');
        } else {
            showAlert('error', '✗ Failed to stop camera');
        }
    } catch (error) {
        console.error('Error stopping camera:', error);
        showAlert('error', '✗ Error stopping camera');
    }
}

async function updateLiveAnalysis() {
    try {
        const response = await fetch('/api/camera/analysis');
<<<<<<< HEAD

        if (!response.ok) {
            // Silently fail for polling updates to avoid console spam
            return;
        }

=======
>>>>>>> uploaded
        const data = await response.json();
        
        if (data.success) {
            const analysis = data.analysis;
            
            // Update scores
            const violenceScore = (analysis.violence_score * 100).toFixed(1);
            const hazardScore = (analysis.hazard_score * 100).toFixed(1);
            const dangerLevel = (analysis.danger_level * 100).toFixed(1);
            
            document.getElementById('live-danger-level').textContent = dangerLevel + '%';
            document.getElementById('live-violence-score').textContent = violenceScore + '%';
            document.getElementById('live-hazard-score').textContent = hazardScore + '%';
            document.getElementById('live-overall-danger').textContent = dangerLevel + '%';
            
            // Update progress bars
            document.getElementById('violence-bar').style.width = violenceScore + '%';
            document.getElementById('hazard-bar').style.width = hazardScore + '%';
            document.getElementById('danger-bar').style.width = dangerLevel + '%';
            
            // Update threat level badge
            updateThreatLevelBadge(analysis.danger_level);
            
            // Update alerts count
            const alertCount = analysis.alerts.length;
            document.getElementById('live-alert-count').textContent = alertCount;
            document.getElementById('alert-badge').textContent = alertCount;
            
            // Update alerts feed
            if (alertCount > 0) {
                updateAlertsFeed(analysis.alerts);
                
                // Play alert sound if enabled
                if (audioAlertEnabled && analysis.danger_level > 0.5) {
                    playAlertSound();
                }
            }
            
            // Update detection counts
            const detections = analysis.detections || [];
            updateDetectionCounts(detections);
            
            // Increment frames counter
            framesAnalyzed++;
        }
    } catch (error) {
        console.error('Error updating analysis:', error);
    }
}

function updateThreatLevelBadge(dangerLevel) {
    const badge = document.getElementById('threat-level-badge');
    const desc = document.getElementById('threat-level-desc');
    const card = document.getElementById('threat-level-card');
    
    card.classList.remove('danger-high');
    
    if (dangerLevel > 0.7) {
        badge.textContent = '🔴 CRITICAL';
        badge.classList.remove('text-green-400', 'text-yellow-400', 'text-orange-400');
        badge.classList.add('text-red-500');
        desc.textContent = 'Immediate threat detected';
        card.classList.add('danger-high');
    } else if (dangerLevel > 0.4) {
        badge.textContent = '🟡 WARNING';
        badge.classList.remove('text-green-400', 'text-red-500', 'text-orange-400');
        badge.classList.add('text-yellow-400');
        desc.textContent = 'Potential threat detected';
    } else if (dangerLevel > 0.2) {
        badge.textContent = '🟠 CAUTION';
        badge.classList.remove('text-green-400', 'text-red-500', 'text-yellow-400');
        badge.classList.add('text-orange-400');
        desc.textContent = 'Activity detected';
    } else {
        badge.textContent = '🟢 SAFE';
        badge.classList.remove('text-red-500', 'text-yellow-400', 'text-orange-400');
        badge.classList.add('text-green-400');
        desc.textContent = 'No threats detected';
    }
}

function updateAlertsFeed(alerts) {
    const container = document.getElementById('live-alerts-container');
    
    if (alerts.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-slate-500"><i class="fas fa-inbox text-4xl mb-2 block"></i><p>Waiting for alerts...</p></div>';
        return;
    }
    
    const alertsHTML = alerts.slice(-10).map(alert => {
        const alertType = alert.type || 'Alert';
        const confidence = (alert.confidence * 100).toFixed(1);
        const severity = alert.confidence > 0.7 ? 'red' : alert.confidence > 0.4 ? 'yellow' : 'orange';
        
        return `
            <div class="flex items-center justify-between p-3 rounded-lg bg-${severity}-900/30 border border-${severity}-700">
                <div class="flex-1">
                    <p class="font-semibold text-${severity}-300">${alertType}</p>
                    <p class="text-xs text-slate-400">${new Date().toLocaleTimeString()}</p>
                </div>
                <span class="font-bold text-${severity}-400">${confidence}%</span>
            </div>
        `;
    }).join('');
    
    container.innerHTML = alertsHTML;
}

function updateDetectionCounts(detections) {
    const types = { people: 0, weapons: 0, fire: 0, motion: 0 };
    
    detections.forEach(det => {
        const label = (det.label || '').toLowerCase();
        if (label.includes('person')) types.people++;
        else if (label.includes('knife') || label.includes('weapon')) types.weapons++;
        else if (label.includes('fire') || label.includes('smoke')) types.fire++;
    });
    
    document.getElementById('detect-people').textContent = types.people;
    document.getElementById('detect-weapons').textContent = types.weapons;
    document.getElementById('detect-fire').textContent = types.fire;
    document.getElementById('detect-motion').textContent = Math.floor(Math.random() * 5); // Placeholder
}

function startSessionTimer() {
    setInterval(() => {
        if (!sessionStartTime) return;
        
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('session-uptime').textContent = timeStr;
        document.getElementById('session-frames').textContent = framesAnalyzed;
    }, 1000);
}

function resetSession() {
    if (cameraActive) {
        stopLiveCamera();
    }
    
    sessionStartTime = null;
    framesAnalyzed = 0;
    
    // Reset all displays
    document.getElementById('live-danger-level').textContent = '0%';
    document.getElementById('live-violence-score').textContent = '0%';
    document.getElementById('live-hazard-score').textContent = '0%';
    document.getElementById('live-overall-danger').textContent = '0%';
    document.getElementById('live-alert-count').textContent = '0';
    document.getElementById('session-uptime').textContent = '00:00:00';
    document.getElementById('session-frames').textContent = '0';
    
    document.getElementById('violence-bar').style.width = '0%';
    document.getElementById('hazard-bar').style.width = '0%';
    document.getElementById('danger-bar').style.width = '0%';
    
    document.getElementById('live-alerts-container').innerHTML = '<div class="text-center py-8 text-slate-500"><i class="fas fa-inbox text-4xl mb-2 block"></i><p>Waiting for alerts...</p></div>';
    
    updateThreatLevelBadge(0);
    
    showAlert('info', 'Session reset');
    console.log('✓ Session reset');
}

function playAlertSound() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1000;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.warn('Audio alert not available:', error);
    }
}

function showAlert(type, message) {
    const alertEl = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    alertEl.className = `fixed bottom-4 right-4 ${bgClass} text-white px-6 py-3 rounded-lg font-semibold shadow-lg z-50`;
    alertEl.textContent = message;
    
    document.body.appendChild(alertEl);
    
    setTimeout(() => alertEl.remove(), 3000);
}

console.log('✓ Live Detection JavaScript loaded');
