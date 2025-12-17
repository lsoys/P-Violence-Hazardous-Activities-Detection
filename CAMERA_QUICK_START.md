# 🎥 Quick Start: Real-Time Camera Detection

## Setup (60 seconds)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python app.py
```

You should see:
```
============================================================
  XDVioDet Pro - Violence & Hazard Detection System
  Powered by YOLOv8 + Motion Analysis
============================================================

Initializing YOLOv8 detector...
Detector ready!
Access the application at: http://localhost:5000
```

### 3. Open Browser
Navigate to: **http://localhost:5000**

## Using Live Camera (2 clicks)

1. **Click "Live Camera" tab**
   - Switch from "Uploaded Video" to "Live Camera" tab

2. **Click "Start Camera" button**
   - Wait for video to appear (~3-5 seconds)
   - You'll see real-time video feed with detection boxes

3. **Watch for Alerts**
   - Danger Level updates in real-time (%)
   - Violence Score shows fight detection confidence
   - Hazard Score shows fire/weapon detection
   - Alert feed shows all detected threats

4. **Stop When Done**
   - Click "Stop Camera" to end streaming

## What Gets Detected

### ✅ Violence/Fighting
- People fighting or aggressive behavior
- Weapons being held or used
- Unusual aggressive movements

### 🔥 Fire/Hazard
- Flames or fire
- Smoke
- High motion/panic situations

### ⚠️ General Alerts
- Weapons detected (knives, etc.)
- Sudden motion anomalies
- Person detection with activity context

## Real-Time Dashboard

| Metric | Shows | Range |
|--------|-------|-------|
| Danger Level | Overall threat percentage | 0-100% |
| Violence Score | Fight/aggression confidence | 0-100% |
| Hazard Score | Fire/weapon/danger confidence | 0-100% |
| Active Alerts | Number of detections | Count |

### Color Coding
- 🟢 **< 40%** - Safe/Normal
- 🟡 **40-70%** - Caution/Investigate
- 🔴 **> 70%** - Alert/Emergency

## Performance Tips

### For Smoother Video
- Increase camera-start button wait time if laggy
- Reduce browser tab count
- Close other applications
- Ensure good lighting

### For Better Detection
- Position camera 2-3 meters from subject
- Ensure good lighting (not backlit)
- Keep entire scene in frame
- Test with known test videos first

## Troubleshooting

### Camera won't start
```bash
# Check if camera is recognized
# Windows: Device Manager > Cameras
# Linux: ls /dev/video*

# Restart Flask app if stuck
# Press Ctrl+C, then: python app.py
```

### Very slow/laggy
- Check CPU usage (may need smaller resolution)
- Edit app.py: change `analysis_interval = 3` to `5`
- Reduce quality or resolution

### No detections
- Ensure good lighting
- Test with sample violent video first
- Check server logs for errors
- Verify detector loaded: check console for "Ready"

## Test It Now

### Test Detection Works
1. Upload a sample violent video first
2. Verify it detects violence correctly
3. Then try live camera

### Common Test Scenarios
- Fast movements (should trigger motion detection)
- Person moving hands (should detect person)
- Bright lights (should detect if like fire)

## Advanced: API Calls

### Start camera programmatically
```bash
curl -X POST http://localhost:5000/api/camera/start
```

### Get current analysis
```bash
curl http://localhost:5000/api/camera/analysis
```

### Stop camera
```bash
curl -X POST http://localhost:5000/api/camera/stop
```

## See Also
- [Full Documentation](CAMERA_STREAMING.md)
- [API Reference](CAMERA_STREAMING.md#api-endpoints)
- [Troubleshooting](CAMERA_STREAMING.md#troubleshooting)

---

**Ready?** Open http://localhost:5000 in your browser now! 🚀
