# Real-Time Camera Streaming & Detection

## Overview
XDVioDet now supports **real-time camera/webcam analysis** with live violence, hazard, and fire detection overlays. The system streams video directly from your device's camera and performs AI analysis on each frame with minimal latency.

## Features

### 🎥 Live Camera Streaming
- MJPEG streaming protocol for smooth, low-latency video
- Real-time frame capture from default system camera
- Automatic frame resizing (640x480) for optimal performance
- 30 FPS target with frame rate adaptation

### 🔍 Real-Time Detection
- **Violence Detection** - Detects fighting, aggressive behavior
- **Fire/Smoke Detection** - HSV color-based fire and smoke identification
- **Weapon Detection** - Identifies knives and other weapons
- **Motion Analysis** - Tracks unusual movement patterns
- **Hazard Detection** - General danger assessment

### 📊 Live Analytics Display
- **Danger Level** - Real-time danger percentage (0-100%)
- **Violence Score** - Fighting/aggression confidence score
- **Hazard Score** - Fire/weapon/general hazard score
- **Active Alerts** - Count of triggered alerts
- **Alert Feed** - Last 5 alerts with timestamps and confidence

### 🚨 Alert System
- Real-time alerts for detected threats
- Audio notification when violence/hazard detected
- Alert history with timestamps
- Color-coded severity indicators

## How to Use

### Starting the Server
```bash
# Navigate to project directory
cd "d:\LSOYS APP AND GAMES\GITHUB -- dummy\XDVioDet"

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start the Flask application
python app.py
```

The application will start at `http://localhost:5000`

### Using the Camera Feature

1. **Open the Web Interface**
   - Go to `http://localhost:5000` in your browser

2. **Switch to Camera Tab**
   - Click on the "Live Camera" tab next to "Uploaded Video"

3. **Start Camera**
   - Click the green "Start Camera" button
   - Wait for the camera to initialize and display the live feed
   - You should see real-time video with detection overlays

4. **Monitor Analysis**
   - Watch the danger level, violence score, and hazard score update in real-time
   - Check the "Live Alerts" section for any detected threats
   - Alert count updates automatically when threats are detected

5. **Stop Camera**
   - Click the red "Stop Camera" button to end streaming
   - Video feed will stop and connection will close

## API Endpoints

### Start Camera Stream
```
POST /api/camera/start
```
Initiates camera capture and analysis thread.

**Response:**
```json
{
    "success": true,
    "message": "Camera stream started successfully",
    "stream_url": "/api/camera/stream",
    "analysis_url": "/api/camera/analysis"
}
```

### Stop Camera Stream
```
POST /api/camera/stop
```
Stops camera capture and closes the stream.

**Response:**
```json
{
    "success": true,
    "message": "Camera stream stopped"
}
```

### Get MJPEG Stream
```
GET /api/camera/stream
```
Returns MJPEG video stream for display in browser.

### Get Current Analysis
```
GET /api/camera/analysis
```
Returns latest frame analysis results.

**Response:**
```json
{
    "success": true,
    "analysis": {
        "alerts": [...],
        "detections": [...],
        "danger_level": 0.45,
        "violence_score": 0.12,
        "hazard_score": 0.08,
        "timestamp": "2025-12-17T14:30:45.123456"
    }
}
```

### Camera Status
```
GET /api/camera/status
```
Check if camera is active and get latest analysis summary.

**Response:**
```json
{
    "success": true,
    "camera_active": true,
    "detector_ready": true,
    "latest_analysis": {
        "danger_level": 0.45,
        "alerts_count": 2,
        "timestamp": "2025-12-17T14:30:45.123456"
    }
}
```

## Technical Details

### Frame Processing Pipeline
1. **Capture** - Frame captured from camera via OpenCV (cv2.VideoCapture)
2. **Resize** - Frame resized to 640x480 for consistent processing
3. **Analysis** - Every 3rd frame analyzed by detector (motion, fire, weapons)
4. **Annotation** - Detection boxes and labels drawn on frame
5. **Stream** - Frame encoded as JPEG and streamed via MJPEG

### Performance Optimization
- **Frame Sampling**: Every 3rd frame analyzed to balance accuracy and speed
- **Resolution**: 640x480 provides good balance between quality and speed
- **Queue Management**: Frame queue size limited to 2 to prevent memory bloat
- **Threading**: Dedicated thread for camera capture prevents UI blocking

### Detection Scoring
- **Danger Level**: 0-1 normalized score combining violence, hazard, and motion
- **Violence Score**: Probability of fighting/aggression (0-1)
- **Hazard Score**: Probability of fire/weapons/danger (0-1)
- **Motion Score**: Unusual movement pattern detection

### Color Indicators
- 🟢 **Green** (< 40%): Low danger - normal activity
- 🟡 **Yellow** (40-70%): Medium danger - potential threat
- 🔴 **Red** (> 70%): High danger - active threat detected

## System Requirements

### Hardware
- **Camera/Webcam**: Built-in or USB webcam required
- **CPU**: Intel i5/Ryzen 5 or better recommended
- **RAM**: 4GB minimum (8GB recommended for smooth performance)
- **GPU**: Optional (CPU-based detection supported)

### Software
- Python 3.10+
- OpenCV 4.5+
- PyTorch 1.9+
- Ultralytics (YOLOv8) 8.0+
- Flask 2.2+

### Browser
- Modern browser with HTML5 support
- JavaScript enabled
- WebSocket support (for real-time updates)

## Troubleshooting

### Camera Won't Start
**Problem**: "Camera stream didn't start" or "Cannot open camera"
- Check if camera is connected and recognized by OS
- Run `ls /dev/video*` (Linux) or check Device Manager (Windows)
- Ensure no other application is using the camera
- Try restarting the Flask app

### Low Frame Rate / Laggy Stream
**Problem**: Video is stuttering or dropping frames
- Reduce browser tab count
- Close other demanding applications
- Lower screen resolution or move closer to router
- Check CPU usage (should be < 80%)

### No Detections
**Problem**: Alert system not triggering despite threats
- Ensure detector is initialized (check console logs)
- Verify YOLOv8 weights were downloaded (~40MB)
- Test with uploaded video first to verify detection works
- Check camera lighting and angle

### High Memory Usage
**Problem**: RAM usage keeps increasing
- Stop camera stream and restart
- Clear browser cache and reload page
- Check for memory leaks in analysis thread
- Reduce analysis frequency in code

## Advanced Configuration

### Changing Analysis Interval
Edit `app.py` line where `analysis_interval = 3`:
```python
analysis_interval = 2  # Analyze every 2 frames (faster, more CPU)
analysis_interval = 5  # Analyze every 5 frames (slower, less CPU)
```

### Adjusting Camera Resolution
Edit `camera_capture_thread()` function:
```python
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)   # Increase width
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)   # Increase height
```

### Changing Alert Confidence Thresholds
Edit `detector.py` initialization:
```python
detector = ViolenceDetector(confidence_threshold=0.3)  # More sensitive
detector = ViolenceDetector(confidence_threshold=0.6)  # Less sensitive
```

## Integration Examples

### JavaScript API Usage
```javascript
// Start camera
fetch('/api/camera/start', { method: 'POST' })
    .then(r => r.json())
    .then(data => console.log('Camera started:', data));

// Get current analysis
fetch('/api/camera/analysis')
    .then(r => r.json())
    .then(data => console.log('Analysis:', data.analysis));

// Stop camera
fetch('/api/camera/stop', { method: 'POST' })
    .then(r => r.json())
    .then(data => console.log('Camera stopped'));
```

### Python Backend Integration
```python
import requests

# Start camera
response = requests.post('http://localhost:5000/api/camera/start')
print(response.json())

# Get analysis
response = requests.get('http://localhost:5000/api/camera/analysis')
analysis = response.json()['analysis']
print(f"Danger: {analysis['danger_level']*100:.1f}%")
```

## Performance Metrics

### Expected Performance (CPU-based, i5 processor)
- **Frame Rate**: 8-12 FPS (every 3rd frame analyzed)
- **Latency**: 100-200ms from capture to detection result
- **CPU Usage**: 40-60% during streaming
- **Memory**: 200-400MB base + ~50MB per minute of buffering

### Optimization Tips
1. Use lower resolution if possible (480p instead of 1080p)
2. Increase analysis interval for less CPU usage
3. Disable other browser tabs/extensions
4. Update GPU drivers for hardware acceleration
5. Use wired camera connection if possible

## Security Notes

- Ensure camera stream is only accessible within trusted network
- MJPEG stream is not encrypted - use HTTPS in production
- Credentials stored in `.env` file (never commit to git)
- Camera access requires explicit browser permission
- All alerts logged to server for audit trail

## Future Enhancements

- [ ] WebRTC support for P2P streaming
- [ ] Multi-camera support
- [ ] Recording to video file
- [ ] Custom alert sounds/notifications
- [ ] Mobile app integration
- [ ] Cloud streaming capabilities
- [ ] Edge device deployment (RPi, Jetson)
- [ ] Real-time analytics dashboard

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review console logs in browser (F12 > Console)
3. Check server logs in terminal
4. Review detector.py for analysis issues
5. Test with known violent video first

---

**Version**: 3.0 (Camera Streaming)  
**Last Updated**: December 17, 2025  
**Status**: Production Ready ✓
