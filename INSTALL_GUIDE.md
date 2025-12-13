# XDVioDet Frontend - Installation & Launch Guide

## Quick Start (2 Minutes)

### Step 1: Install Dependencies
```bash
cd XDVioDet-Frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
The app will automatically open at `http://localhost:5173`

---

## Complete Project Structure

```
XDVioDet-Frontend/
│
├── 📁 public/                          # Static assets
│   └── (favicon, etc.)
│
├── 📁 src/
│   │
│   ├── 📁 assets/                      # Images, icons, media
│   │   └── (placeholder for images)
│   │
│   ├── 📁 components/                  # Reusable React Components
│   │   ├── 📄 Layout.jsx              # Sidebar + Header layout
│   │   ├── 📄 VideoUpload.jsx         # Video file upload
│   │   ├── 📄 CameraCapture.jsx       # Camera recording
│   │   ├── 📄 DetectionResults.jsx    # Results display
│   │   └── 📄 History.jsx             # History & tracking
│   │
│   ├── 📁 pages/                       # Full Page Components
│   │   ├── 📄 Dashboard.jsx           # Home page
│   │   ├── 📄 About.jsx               # Project info
│   │   ├── 📄 Settings.jsx            # Preferences
│   │   └── 📄 Help.jsx                # FAQs & docs
│   │
│   ├── 📁 utils/
│   │   └── 📄 api.js                  # API calls & labels
│   │
│   ├── 📄 App.jsx                     # Main app component
│   ├── 📄 main.jsx                    # React entry point
│   └── 📄 index.css                   # Global styles
│
├── 📄 index.html                      # HTML entry point
├── 📄 package.json                    # Dependencies
├── 📄 vite.config.js                  # Vite config
├── 📄 tailwind.config.js              # Tailwind config
├── 📄 postcss.config.js               # PostCSS config
│
├── 📄 README.md                       # Full documentation
├── 📄 QUICKSTART.md                   # Quick start guide
├── 📄 PROJECT_STRUCTURE.md            # Project details
├── 📄 ENHANCEMENT_SUMMARY.md          # Changes summary
└── 📄 INSTALL_GUIDE.md                # This file
```

---

## Features Overview

### 🎨 User Interface
- **Sidebar Navigation**: 7 main navigation items
- **Professional Design**: No emojis, clean typography
- **Dark Mode**: Optimized dark theme throughout
- **Responsive**: Works on desktop and mobile
- **Fast**: Built with Vite for quick development

### 🎯 Core Features
- **Video Upload**: Drag-drop or click to upload videos
- **Live Camera**: Record videos with your webcam
- **AI Detection**: 15 threat categories detection
- **Results Display**: Detailed analysis with confidence scores
- **History Tracking**: Save and export detection history
- **Settings Panel**: Configure preferences and API

### 📊 Pages
1. **Dashboard** - Home page with statistics
2. **Upload** - Video file upload interface
3. **Camera** - Live camera recording
4. **History** - Past detections and analytics
5. **About** - Project information
6. **Settings** - User preferences
7. **Help** - FAQs and documentation

---

## Navigation Guide

### Sidebar Menu Items

| Icon | Name | Purpose | Function |
|------|------|---------|----------|
| ▤ | Dashboard | Home page | View statistics & quick actions |
| ⬆ | Upload Video | Upload page | Select video files to analyze |
| ⚫ | Live Camera | Camera page | Record with webcam |
| ◼ | History | History page | View past detections |
| ℹ | About | About page | Learn about the system |
| ⚙ | Settings | Settings page | Configure preferences |
| ? | Help | Help page | FAQs and guides |

### How to Navigate
1. Click a menu item to go to that page
2. Sidebar collapses on mobile for more space
3. Click the collapse button (◀/▶) to toggle sidebar width
4. Current page is highlighted in blue

---

## Detailed Features

### Dashboard Page
- Welcome message
- 4 Quick statistics:
  - Total detections
  - Violence detected
  - Safe detections
  - Average confidence
- 3 Quick action buttons
- Feature overview
- Getting started guide

### Upload Video Page
- Drag-drop upload zone
- File type validation
- File size checking (max 500MB)
- Selected file information
- Real-time processing
- Detailed results with:
  - Overall confidence percentage
  - 15 category scores
  - Frame previews
  - Processing time

### Live Camera Page
- Real-time camera feed
- Recording timer (max 60 seconds)
- Start/Stop controls
- Camera permission handling
- Auto-upload and analysis
- Results display

### History Page
- All past detections list
- Filter options:
  - All detections
  - Violence only
  - Safe only
- Sort options:
  - Newest first
  - Oldest first
  - Highest confidence
- Export as CSV
- Clear history option
- Expandable details for each detection

### About Page
- Project overview
- 6 Key features explained
- All 15 violence categories
- Technology stack:
  - Frontend: React, Vite, Tailwind
  - Backend: PyTorch, GCN, OpenCV
- How the system works (6 steps)
- Performance metrics (92% accuracy)
- Credits and version info

### Settings Page
- **Video Settings**:
  - Max file size (10-2000 MB)
  - Max recording time (10-300 seconds)
  - Confidence threshold (0-100%)
- **API Settings**:
  - API endpoint URL configuration
- **Application Settings**:
  - Dark mode toggle
  - Notifications toggle
  - Auto-export toggle
- **Data Management**:
  - Clear detection history
  - Export settings backup
- **System Information**:
  - Browser info
  - Storage availability
  - Camera support status
- Save and Reset buttons

### Help Page
- **Quick Start**: 5-step guide
- **FAQs**: 12 Frequently Asked Questions
- **Troubleshooting**: 6 common issues and solutions
- **Video Formats**: Support guide with 6 formats
- **Best Practices**: DO's and DON'Ts
- **Resources**: Links and additional help

---

## Keyboard Shortcuts (Optional Future)

The app is fully mouse/touch compatible. Keyboard shortcuts can be added:
- Press `/` to search
- Press `?` to show help
- Press `Escape` to close dialogs

---

## System Requirements

### Browser Requirements
- **Chrome/Edge**: Version 90 or newer
- **Firefox**: Version 88 or newer
- **Safari**: Version 14 or newer
- **Mobile**: Modern browsers with camera support

### Hardware Requirements
- 2GB RAM minimum
- 100MB free disk space
- Internet connection for API calls
- Webcam for camera features (optional)

### Network Requirements
- Stable internet connection
- HTTPS required for camera access (in production)
- Access to: https://p-violence-hazardous-activities-detection.onrender.com/

---

## Troubleshooting

### Port Already in Use
```bash
# Windows (PowerShell):
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### Dependencies Won't Install
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Camera Not Working
- Grant camera permission in browser settings
- Restart your browser
- Try a different browser
- Check if another app is using camera

### Video Upload Fails
- Check file size (max 500MB)
- Verify file format (MP4, MOV, AVI, MKV, WebM)
- Check internet connection
- Verify API endpoint in Settings

---

## Development Commands

```bash
# Start development server (auto-reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# List available commands
npm run
```

---

## Production Deployment

### Build the Project
```bash
npm run build
```

This creates an optimized `dist/` folder with:
- Minified JavaScript
- Optimized CSS
- Compressed assets

### Deploy Options
1. **Netlify**: Connect GitHub repo and auto-deploy
2. **Vercel**: Optimize React apps
3. **GitHub Pages**: Free static hosting
4. **AWS S3**: Scalable cloud storage
5. **Docker**: Containerized deployment

---

## File Sizes & Performance

### Bundle Size (Approximate)
- React + Vite: ~100KB
- Tailwind CSS: ~30KB
- Gzipped Total: ~50KB
- Assets: Variable

### Performance
- First load: < 2 seconds
- Page transitions: Instant
- Video upload: Limited by file size
- Processing: Limited by API speed

---

## Tips & Best Practices

### For Best Results
1. Use clear, well-lit videos
2. Keep videos 5-30 seconds long
3. Use MP4 format (most compatible)
4. Ensure good internet connection
5. Grant camera permissions when prompted

### Saving Data
1. Export history as CSV regularly
2. Clear old detections to save space
3. Backup settings before major changes
4. Keep API endpoint URL safe

### Security
1. Don't share API endpoint publicly
2. Clear browser cache if having issues
3. Use HTTPS in production
4. Keep videos private (not stored permanently)

---

## Getting Help

### In-App Help
- Click "Help" in sidebar
- Check FAQ section
- Read troubleshooting guide
- Review best practices

### Documentation
- **README.md** - Full feature documentation
- **QUICKSTART.md** - Quick start guide
- **PROJECT_STRUCTURE.md** - Technical structure
- **ENHANCEMENT_SUMMARY.md** - What was added

### Support
- Check browser console (F12) for error details
- Review API status
- Test with sample videos
- Clear cache and reload

---

## Next Steps

1. ✅ Install: `npm install`
2. ✅ Run: `npm run dev`
3. ✅ Explore Dashboard
4. ✅ Try uploading a test video
5. ✅ Check out other pages
6. ✅ Customize in Settings
7. ✅ Read Help for more info

---

## Version Info

- **App Version**: 2.0.0
- **Release Date**: December 2024
- **Status**: Production Ready
- **Last Updated**: December 13, 2024

---

## Contact & Support

For issues or questions:
1. Check the Help page first
2. Review documentation files
3. Check browser console for errors (F12)
4. Verify API endpoint is accessible
5. Test with different browsers

---

**Happy detecting! 🎥**

The frontend is fully functional and ready to use with the hosted XDVioDet API.
