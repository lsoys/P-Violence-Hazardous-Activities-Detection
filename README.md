# XDVioDet Frontend - React + Vite

Professional AI-powered violence and hazardous activity detection system with real-time monitoring and analysis.

## Features

✨ **Dual Input Methods**
- 📤 Upload video files (MP4, MOV, AVI, MKV, WebM)
- 📹 Real-time camera capture with recording

🎯 **15-Category Detection**
- Alcohol, Gesture, Blood, Cigarette, Gun
- Knife, Smoke, Mob Violence, Fight
- Explosion, Shooting, Stabbing, Threatening Gesture
- Car Crash, Physical Assault

📊 **Advanced Analytics**
- Confidence scoring with visual progress bars
- Frame-by-frame analysis preview
- Color-coded threat categories
- Processing time metrics
- Detection history tracking

🔒 **Privacy-First**
- Client-side processing initiation
- Secure API communication
- No permanent video storage
- LocalStorage history management

## Tech Stack

- **Frontend**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.3.6
- **HTTP Client**: Axios 1.6.0
- **APIs**: Browser APIs (MediaRecorder, getUserMedia, Fetch)

## Installation

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
XDVioDet-Frontend/
├── src/
│   ├── components/
│   │   ├── VideoUpload.jsx      # Video file upload with drag-drop
│   │   ├── CameraCapture.jsx    # Live camera recording
│   │   ├── DetectionResults.jsx # Results display with 15 categories
│   │   └── History.jsx          # Detection history and analytics
│   ├── utils/
│   │   └── api.js               # API utilities and violence labels
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind CSS styles
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## API Integration

The frontend connects to the hosted XDVioDet API:

**Base URL**: `https://p-violence-hazardous-activities-detection.onrender.com/`

### Endpoints

#### Upload Video
```
POST /api/upload-video
Content-Type: multipart/form-data

Request:
- file: Video file (binary)

Response:
{
  "confidence": 0.85,
  "is_violence": true,
  "labels": {
    "fight": 0.92,
    "physical_assault": 0.78,
    ...
  },
  "frames": ["base64_frame1", "base64_frame2", ...],
  "processing_time": 12.5,
  "filename": "test.mp4",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Get Status
```
GET /api/status

Response:
{
  "status": "running",
  "models_loaded": true,
  "version": "1.0.0"
}
```

#### Get Model Info
```
GET /api/model-info

Response:
{
  "model": "XDVioDet",
  "labels": 15,
  "framework": "PyTorch",
  "version": "1.0.0"
}
```

## Component Documentation

### App.jsx
Main application container that manages:
- Tab navigation between upload/camera/results/history
- Global state (results, loading, error)
- Error handling and display
- Header and footer layout

Props: None
State: `activeTab`, `results`, `isLoading`, `error`
Callbacks: `handleResultsReceived()`, `handleLoading()`, `handleError()`

### VideoUpload.jsx
Handles video file upload with drag-and-drop:
- Drag-drop file zone with visual feedback
- File validation (type, size)
- Progress indication
- Error handling for file size/type

Props:
- `onResultsReceived(results)` - Called when API returns results
- `onLoading(boolean)` - Called during upload/processing
- `onError(message)` - Called on error

State: `fileName`, `fileSize`, `isDragActive`

### CameraCapture.jsx
Real-time camera recording interface:
- Camera access with permission handling
- MediaRecorder setup with WebM codec
- 60-second recording limit
- Recording timer display
- Video blob conversion and upload

Props:
- `onResultsReceived(results)` - Called when API returns results
- `onLoading(boolean)` - Called during recording/processing
- `onError(message)` - Called on error

State: `isRecording`, `cameraActive`, `recordingTime`, `recordedChunks`

### DetectionResults.jsx
Displays violence detection results:
- Overall confidence percentage with progress bar
- Violence classification (Yes/No)
- 15-category grid with confidence scores
- Frame preview grid (first 12 frames)
- File metadata and processing time

Props:
- `results` - API response object
  - `confidence`: number (0-1)
  - `is_violence`: boolean
  - `labels`: object with category scores
  - `frames`: array of base64 images
  - `processing_time`: number (seconds)
  - `filename`: string
  - `timestamp`: ISO string

### History.jsx
Detection history management:
- Stores history in localStorage
- Filter by violence/safe/all
- Sort by date/confidence
- Export to CSV functionality
- Clear history option

Props:
- `results` - New result to add to history (triggers update)

State: `history`, `sortBy`, `filterBy`

## Violence Categories

| Icon | Category | Color | Description |
|------|----------|-------|-------------|
| 🍺 | alcohol | #FF6B6B | Alcohol consumption/bottles |
| 👇 | gesture | #FFA726 | Threatening gestures |
| 🩸 | blood | #EF5350 | Blood or injuries |
| 🚬 | cigarette | #AB47BC | Smoking/cigarettes |
| 🔫 | gun | #EC407A | Firearms/weapons |
| 🔪 | knife | #EF5350 | Knives/sharp weapons |
| 💨 | smoke | #9575CD | Smoke/fire |
| 👥 | mob_violence | #D32F2F | Group violence |
| 👊 | fight | #C62828 | Physical fighting |
| 💣 | explosion | #FF5722 | Explosions/blasts |
| 🔥 | shooting | #E64A19 | Gunfire/shooting |
| 🔪 | stabbing | #D84315 | Stabbing actions |
| ⚠️ | threatening_gesture | #FFA726 | Threatening behavior |
| 🚗 | car_crash | #FFB74D | Vehicle accidents |
| 💥 | physical_assault | #FF7043 | Physical assault |

## Usage Guide

### Upload a Video
1. Click the **Upload Video** tab
2. Either drag a video file into the drop zone or click to browse
3. Supported formats: MP4, MOV, AVI, MKV, WebM (max 500MB)
4. Wait for processing to complete
5. View results in the **Results** tab

### Record with Camera
1. Click the **Live Camera** tab
2. Click **Start Camera** to request camera access
3. Click **Start Recording** to begin
4. A timer will show recording duration (max 60 seconds)
5. Click **Stop Recording** when done
6. The video will automatically upload and process
7. View results in the **Results** tab

### Review Results
1. The **Results** tab shows:
   - Overall violence confidence percentage
   - Safe/Violence classification
   - 15-category breakdown with confidence scores
   - Frame previews from the video
   - Processing time and statistics

2. The **History** tab shows:
   - All past detections
   - Filter by violence/safe
   - Sort by date or confidence
   - Export history as CSV
   - Clear history option

## Error Handling

The application handles various error scenarios:

- **File too large**: Show error if > 500MB
- **Invalid file type**: Validate MIME type before upload
- **Camera access denied**: Graceful fallback with error message
- **API errors**: Display error message with retry option
- **Network errors**: Show connection error notification

## Performance Considerations

- Videos are processed on remote servers (not client-side)
- Frame extraction happens on the backend
- Base64 images are lazy-loaded in results
- History is stored in browser localStorage (limited storage)
- CSS is minified and optimized by Vite

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with camera access

## Future Enhancements

- [ ] Batch video processing
- [ ] Custom model selection
- [ ] Real-time alert notifications
- [ ] Video annotation tools
- [ ] Advanced filtering and search
- [ ] User authentication
- [ ] Cloud storage integration
- [ ] Mobile app version

## Privacy & Security

- ✅ No permanent video storage
- ✅ HTTPS-only API communication
- ✅ LocalStorage history (client-side only)
- ✅ No user tracking or analytics
- ✅ CORS-enabled for cross-origin requests

## Troubleshooting

### "Network Error" when uploading
- Check internet connection
- Verify API endpoint is accessible
- Try a smaller video file
- Check browser console for details

### Camera not working
- Grant camera permissions in browser settings
- Check if another app is using the camera
- Try a different browser
- Restart your device

### Video won't upload
- Check file size (max 500MB)
- Verify file format (MP4, MOV, AVI, MKV, WebM)
- Check file isn't corrupted
- Try reducing video resolution

## Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Analyze build size
npm run build -- --analyze
```

## License

© 2024 XDVioDet - Violence Detection System

## Support

For issues, questions, or suggestions, please contact the development team.
