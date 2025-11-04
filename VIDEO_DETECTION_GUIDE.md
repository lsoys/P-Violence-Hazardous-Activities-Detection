# Video Violence Detection System - User Guide

## Overview

The XDVioDet system has been enhanced to support **video file uploads** with **multi-label violence detection**. Instead of manually providing feature files, you can now upload video files directly and the system will:

1. Extract frames from the video
2. Analyze for violence indicators
3. Display detected violence labels with confidence scores
4. Show preview frames from the video
5. Track detection history

## Quick Start

### 1. Installation

```bash
# Install required dependencies
pip install -r requirements.txt
```

**Key new dependencies:**
- `opencv-python>=4.5.0` - For video processing
- `torch>=1.9.0` - Deep learning framework
- `Flask>=2.2.2` - Web server

### 2. Running the Application

**Option A: Direct Python**
```bash
python app.py
```

**Option B: Run script (Windows)**
```bash
./run.bat
```

**Option B: Run script (Linux/Mac)**
```bash
./run.sh
```

**Option C: Docker**
```bash
docker-compose up
```

The web interface will be available at: **http://localhost:5000**

## Web Interface Features

### 📹 Video Upload Panel

- **File Selection**: Click or drag-and-drop video files
- **Supported Formats**: MP4, AVI, MOV, MKV, FLV, WMV, WebM
- **Max File Size**: 500MB
- **Upload Button**: Click to analyze the video

### 📊 Detection Results Panel

Once a video is analyzed, you'll see:

| Metric | Description |
|--------|-------------|
| **Violence Confidence** | Overall confidence score (0-100%) |
| **Classification** | "Violence Detected" or "No Violence" |
| **Video Info** | Total frames, extracted frames, processing time |

### 🏷️ Detected Violence Indicators

The system detects **15 violence categories**:

| Category | Color | Description |
|----------|-------|-------------|
| alcohol | ![#FF6B6B](https://via.placeholder.com/20/FF6B6B?text=+) Red | Alcohol consumption/bottles |
| gesture | ![#FFA726](https://via.placeholder.com/20/FFA726?text=+) Orange | Threatening gestures |
| blood | ![#EF5350](https://via.placeholder.com/20/EF5350?text=+) Red | Blood/injuries |
| cigarette | ![#AB47BC](https://via.placeholder.com/20/AB47BC?text=+) Purple | Smoking/cigarettes |
| gun | ![#EC407A](https://via.placeholder.com/20/EC407A?text=+) Pink | Firearms |
| knife | ![#EF5350](https://via.placeholder.com/20/EF5350?text=+) Red | Knives/blades |
| smoke | ![#9575CD](https://via.placeholder.com/20/9575CD?text=+) Purple | Smoke/fire |
| mob_violence | ![#D32F2F](https://via.placeholder.com/20/D32F2F?text=+) Dark Red | Group violence |
| fight | ![#C62828](https://via.placeholder.com/20/C62828?text=+) Dark Red | Physical fighting |
| explosion | ![#FF5722](https://via.placeholder.com/20/FF5722?text=+) Orange-Red | Explosions |
| shooting | ![#E64A19](https://via.placeholder.com/20/E64A19?text=+) Orange-Red | Gunfire |
| stabbing | ![#D84315](https://via.placeholder.com/20/D84315?text=+) Brown-Red | Stabbing/cutting |
| threatening_gesture | ![#FFA726](https://via.placeholder.com/20/FFA726?text=+) Orange | Threatening body language |
| car_crash | ![#FFB74D](https://via.placeholder.com/20/FFB74D?text=+) Light Orange | Vehicle collisions |
| physical_assault | ![#FF7043](https://via.placeholder.com/20/FF7043?text=+) Orange-Red | Physical attacks |

Each label shows a confidence percentage and is color-coded for quick visual identification.

### 📸 Frame Preview Gallery

- Shows up to 10 extracted frames from the video
- Helps visualize what the model analyzed
- Clicking individual frames displays details

### 📋 Analysis History

- Tracks all uploaded videos and their results
- Shows: Video name, confidence score, classification, timestamp
- Persistent across browser sessions (saved to localStorage)

## API Endpoints

### Upload & Analyze Video

**Endpoint:** `POST /api/upload-video`

**Request:**
```bash
curl -X POST -F "video=@myvideo.mp4" http://localhost:5000/api/upload-video
```

**Response:**
```json
{
  "success": true,
  "filename": "video_20240101_120000.mp4",
  "video_id": "20240101_120000",
  "total_frames": 300,
  "extracted_frames": 150,
  "processing_time": 5.23,
  "confidence": 0.75,
  "is_violence": true,
  "labels": {
    "mob_violence": 0.75,
    "physical_assault": 0.68,
    "threatening_gesture": 0.60
  },
  "frames": ["base64_encoded_frame_1", "base64_encoded_frame_2", ...],
  "timestamp": "2024-01-01T12:00:00"
}
```

### Get Status

**Endpoint:** `GET /api/status`

**Response:**
```json
{
  "status": "running",
  "model_loaded": true,
  "device": "cuda:0",
  "cuda_available": true,
  "videos_processed": 5,
  "max_video_size": "500MB"
}
```

### Get Model Info

**Endpoint:** `GET /api/model-info`

**Response:**
```json
{
  "model_type": "Graph Convolutional Networks",
  "version": "2.0 - Video Detection",
  "features": {
    "rgb_features": 1024,
    "audio_features": 128,
    "total_features": 1152
  },
  "violence_categories": 15,
  "reference": "ECCV 2020"
}
```

## Configuration

### Upload Limits

Edit in `app.py`:
```python
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # Max 500MB
```

### Frame Extraction Parameters

Edit in `app.py` > `extract_video_features()`:
```python
frames, total_frames = extract_frames_from_video(
    video_path, 
    max_frames=200,      # Maximum frames to extract
    sample_rate=2        # Extract every 2nd frame
)
```

### Violence Labels

Customize labels in `app.py`:
```python
VIOLENCE_LABELS = {
    'alcohol': '#FF6B6B',
    'gesture': '#FFA726',
    # ... add more as needed
}
```

## Performance Tips

1. **Video Quality**: Higher resolution videos take longer to process
2. **File Size**: Larger files extract more frames, increasing processing time
3. **GPU**: Having NVIDIA GPU with CUDA significantly speeds up processing
4. **Batch Processing**: Process multiple videos sequentially for better resource usage

## Troubleshooting

### Video Upload Fails

**Error: "Invalid format"**
- Ensure video is in supported format (mp4, avi, mov, mkv, flv, wmv, webm)
- Check file extension matches actual format

**Error: "File too large"**
- Maximum file size is 500MB
- Compress video or split into smaller segments

### No Violence Detected When Expected

- The detection algorithm uses both RGB frames and audio features
- Confidence threshold is 0.5 (50%)
- Try uploading a shorter clip to see which frames trigger detections

### API Returns 500 Error

Check the application logs:
```bash
# On Windows
type logs/app.log

# On Linux/Mac
cat logs/app.log
```

## Architecture

### Backend (Flask + PyTorch)

```
Video Upload
    ↓
Frame Extraction (OpenCV)
    ↓
Feature Extraction (RGB + Audio)
    ↓
GCN Model Inference
    ↓
Label Mapping
    ↓
JSON Response
```

### Frontend (HTML + JavaScript)

```
File Upload UI
    ↓
Form Validation
    ↓
API Call (/api/upload-video)
    ↓
Response Processing
    ↓
UI Update:
  - Confidence score
  - Violence labels
  - Frame preview
  - History table
```

## Features

### ✅ Current Features
- Video file upload (5 formats supported)
- Multi-label violence detection (15 categories)
- Real-time confidence scoring
- Frame preview gallery
- Analysis history tracking
- Responsive web UI
- REST API endpoints
- Error handling & logging
- CORS enabled

### 🔄 Planned Features
- Streaming video analysis
- Custom model upload
- Batch video processing
- Video timeline visualization
- Advanced filtering options
- Export detection results

## Development

### Adding New Violence Categories

1. Update `VIOLENCE_LABELS` in `app.py`:
```python
VIOLENCE_LABELS = {
    'your_category': '#HEXCOLOR',
    ...
}
```

2. Update `predict_violence_labels()` logic to detect new categories

3. Frontend updates automatically (uses labels from backend)

### Extending Frame Processing

Modify `extract_frames_from_video()` in `app.py`:
```python
def extract_frames_from_video(video_path, max_frames=None, sample_rate=1):
    # Custom preprocessing here
    pass
```

## References

- **Paper**: ECCV 2020 - Multimodal Violence Detection
- **Framework**: PyTorch with Graph Convolutional Networks
- **Dataset**: RLVD (Real-world Large-scale Violence Detection)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs in `logs/` directory
3. Check console logs in browser (F12 → Console tab)
4. Review API response details

## License

See LICENSE file in repository

---

**Last Updated**: 2024-01-01  
**Version**: 2.0 - Video Detection System
