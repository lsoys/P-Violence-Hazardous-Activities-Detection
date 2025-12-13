# 🚀 XDVioDet Frontend - Quick Start Guide

## Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 7.0.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API calls)

## One-Command Setup

If you have Node.js and npm installed:

```bash
# Navigate to the frontend directory
cd XDVioDet-Frontend

# Install all dependencies
npm install

# Start the development server
npm run dev
```

The app will open automatically at **http://localhost:5173**

## Step-by-Step Setup

### 1. Install Node.js
If not already installed:
- Download from https://nodejs.org/ (LTS version recommended)
- Install and verify: `node --version` and `npm --version`

### 2. Navigate to Project
```bash
cd XDVioDet-Frontend
```

### 3. Install Dependencies
```bash
npm install
```

This will install:
- React & React DOM
- Vite build tool
- Tailwind CSS
- PostCSS & Autoprefixer
- Axios (HTTP client)

### 4. Start Development Server
```bash
npm run dev
```

Output will show:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### 5. Open in Browser
Visit **http://localhost:5173** in your browser

## First Time Usage

### Option A: Upload a Video
1. Click **"📤 Upload Video"** tab
2. Drag and drop a video file OR click to browse
3. Supported: MP4, MOV, AVI, MKV, WebM (max 500MB)
4. Wait for processing (typically 10-30 seconds)
5. View results in **"📊 Results"** tab

### Option B: Use Your Camera
1. Click **"📹 Live Camera"** tab
2. Click **"Start Camera"** (grant camera permission)
3. Click **"Start Recording"** to begin
4. Recording time shows at top (max 60 seconds)
5. Click **"Stop Recording"** when done
6. Video automatically uploads and processes
7. View results in **"📊 Results"** tab

### Option C: Review History
1. Process a video using upload or camera
2. Click **"📋 History"** tab
3. See all past detections
4. Filter by violence/safe or sort by date/confidence
5. Export as CSV for reports

## Project Structure

```
XDVioDet-Frontend/
├── index.html              # Main HTML file
├── package.json           # Dependencies & scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
├── README.md              # Full documentation
├── QUICKSTART.md          # This file
└── src/
    ├── main.jsx           # React entry point
    ├── App.jsx            # Main app component
    ├── index.css          # Global styles
    ├── components/
    │   ├── VideoUpload.jsx        # Video upload with drag-drop
    │   ├── CameraCapture.jsx      # Live camera recording
    │   ├── DetectionResults.jsx   # Results display
    │   └── History.jsx            # History & analytics
    └── utils/
        └── api.js         # API calls & violence labels
```

## Available Scripts

```bash
# Development server (auto-reload on file changes)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Show help for Vite
npm run build -- --help
```

## Configuration

### API Endpoint
The app connects to: `https://p-violence-hazardous-activities-detection.onrender.com/`

To change this, edit [src/utils/api.js](src/utils/api.js):
```javascript
const API_BASE = 'https://your-api-endpoint.com'
```

### Maximum Video Size
Default is 500MB. To change, edit [src/components/VideoUpload.jsx](src/components/VideoUpload.jsx):
```javascript
const MAX_FILE_SIZE = 500 * 1024 * 1024 // Change 500 to your limit in MB
```

### Maximum Recording Time
Default is 60 seconds. To change, edit [src/components/CameraCapture.jsx](src/components/CameraCapture.jsx):
```javascript
const MAX_RECORDING_TIME = 60 // Change to your limit in seconds
```

## Troubleshooting

### Port Already in Use
If you see "Port 5173 is in use":
```bash
# Kill process using port 5173
# Windows (PowerShell):
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9
```

### Dependencies Installation Failed
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Camera Permission Denied
- Check browser camera settings
- Restart browser and reload page
- Try a different browser

### Video Upload Fails
- Check file size (max 500MB)
- Verify file format (MP4, MOV, AVI, MKV, WebM)
- Check internet connection
- Open browser console (F12) for error details

### "API Unreachable" Error
- Verify API endpoint URL in [src/utils/api.js](src/utils/api.js)
- Check internet connection
- API server might be down (check uptime)
- Try clearing browser cache

## Performance Tips

1. **For Faster Processing**
   - Use shorter videos (< 2 minutes)
   - Lower video resolution if possible
   - Ensure good internet connection

2. **Browser Performance**
   - Use latest browser version
   - Close unnecessary tabs/apps
   - Clear browser cache periodically

3. **Storage**
   - History is stored locally (cleared if browser storage is cleared)
   - Export history as CSV before clearing
   - Max ~50 detections stored by default

## Feature Overview

### 15 Violence Categories
The system detects:
- 🍺 Alcohol
- 👇 Gesture
- 🩸 Blood
- 🚬 Cigarette
- 🔫 Gun
- 🔪 Knife
- 💨 Smoke
- 👥 Mob Violence
- 👊 Fight
- 💣 Explosion
- 🔥 Shooting
- 🔪 Stabbing
- ⚠️ Threatening Gesture
- 🚗 Car Crash
- 💥 Physical Assault

### Key Metrics
- **Confidence**: Overall violence probability (0-100%)
- **Processing Time**: Time to analyze video
- **Frames Analyzed**: Number of frames extracted
- **Category Scores**: Confidence for each threat type

## Browser Requirements

| Browser | Version | Camera | Upload |
|---------|---------|--------|--------|
| Chrome  | 90+     | ✅     | ✅     |
| Firefox | 88+     | ✅     | ✅     |
| Safari  | 14+     | ✅     | ✅     |
| Edge    | 90+     | ✅     | ✅     |

## Next Steps

1. ✅ Start the dev server: `npm run dev`
2. 🎥 Try uploading a test video
3. 📹 Try recording with your camera
4. 📊 Review detection results
5. 📋 Check detection history

## Getting Help

### Check Logs
Open browser DevTools (F12 → Console) to see:
- API call details
- Error messages
- Performance metrics

### Common Issues
See [README.md](README.md#troubleshooting) for detailed troubleshooting

### API Status
Check if API is online:
```bash
curl https://p-violence-hazardous-activities-detection.onrender.com/api/status
```

## Production Deployment

When ready to deploy:

```bash
# Build for production
npm run build

# This creates optimized files in 'dist/' folder
```

Then deploy the `dist/` folder to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Your own server

## Useful Links

- 📚 React Docs: https://react.dev
- ⚡ Vite Docs: https://vitejs.dev
- 🎨 Tailwind Docs: https://tailwindcss.com
- 📦 npm Registry: https://www.npmjs.com

## Questions?

Refer to:
1. **README.md** - Full documentation
2. **Browser Console (F12)** - Error messages and logs
3. **API Response** - Check in Network tab (F12)

---

**Ready to start?** Run `npm install && npm run dev` 🚀
