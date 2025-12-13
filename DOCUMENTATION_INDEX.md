# XDVioDet Frontend - Complete Documentation Index

## Getting Started (Choose One)

### 📚 Quick Start (5 minutes)
Start here if you want to run the app immediately:
```bash
cd XDVioDet-Frontend
npm install
npm run dev
```
Then open http://localhost:5173

**File**: [QUICKSTART.md](QUICKSTART.md)

### 📖 Detailed Installation Guide
Complete step-by-step setup instructions with troubleshooting:
**File**: [INSTALL_GUIDE.md](INSTALL_GUIDE.md)

### 📋 Full Feature Documentation
Complete feature reference and usage guide:
**File**: [README.md](README.md)

---

## Project Documentation

### 🏗️ Project Structure
Detailed breakdown of all files and folders:
**File**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

### ✨ Enhancement Summary
What was added, improved, and changed:
**File**: [ENHANCEMENT_SUMMARY.md](ENHANCEMENT_SUMMARY.md)

### 📝 This File
Complete documentation index and navigation guide:
**File**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) (current file)

---

## Understanding the Application

### Navigation Map

```
Dashboard (Home)
├── Quick Statistics (4 cards)
├── Quick Actions (3 buttons)
├── Feature Overview (6 features)
└── Getting Started Guide

Upload Video Page
├── Drag-Drop Upload Zone
├── File Information Display
└── Detection Results
    ├── Confidence Percentage
    ├── 15-Category Breakdown
    ├── Frame Previews
    └── Processing Time

Live Camera Page
├── Video Feed Preview
├── Recording Controls
└── Detection Results

History Page
├── Detection List
├── Filters (Violence/Safe/All)
├── Sorting Options
└── Export/Clear Functions

About Page
├── Project Overview
├── 15 Categories List
├── Technology Stack
├── How It Works
└── Performance Metrics

Settings Page
├── Video Settings (3 options)
├── API Configuration
├── Application Settings (3 toggles)
├── Data Management
└── System Information

Help Page
├── Quick Start Guide
├── 12 FAQs (Expandable)
├── 6 Troubleshooting Scenarios
├── Video Format Guide
├── Best Practices
└── Additional Resources
```

---

## Component Reference

### Main Components
- **App.jsx** - Application root, page routing
- **Layout.jsx** - Sidebar + Header + Footer

### Feature Components
- **VideoUpload.jsx** - Video file upload with drag-drop
- **CameraCapture.jsx** - Live camera recording
- **DetectionResults.jsx** - Results display with 15 categories
- **History.jsx** - Detection history tracking

### Page Components
- **Dashboard.jsx** - Home page
- **About.jsx** - Project information
- **Settings.jsx** - User preferences
- **Help.jsx** - Documentation

### Utility Modules
- **api.js** - API calls and violence labels

---

## Feature Documentation

### Video Upload Feature
- Upload video files (MP4, MOV, AVI, MKV, WebM)
- Drag-and-drop support
- File validation (type, size)
- Automatic API upload
- Results display with confidence scores
- Frame previews from video

### Live Camera Feature
- Real-time camera access
- Video recording (up to 60 seconds)
- Recording timer display
- Auto-upload and analysis
- Error handling for permissions
- Results display

### Detection Results
- Overall confidence percentage
- Violence/Safe classification
- 15-category breakdown with individual scores
- Color-coded category cards
- Frame preview grid
- Processing time display
- File metadata

### History Tracking
- All detections stored locally
- Filter by violence/safe
- Sort by date or confidence
- Export to CSV
- Clear history option
- Expandable result details

### Settings System
- Video settings (file size, recording time, threshold)
- API endpoint configuration
- Application preferences (notifications, dark mode, auto-export)
- Data management (export, clear)
- System information display

### Help System
- 12 FAQs with expandable answers
- 6 troubleshooting scenarios
- Video format compatibility guide
- Best practices and tips
- Additional resources and links

---

## Technical Reference

### Technology Stack
- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **CSS Framework**: Tailwind CSS 3.3.6
- **HTTP Client**: Axios 1.6.0
- **Runtime**: Node.js/Browser APIs

### Browser APIs Used
- MediaRecorder API (camera recording)
- getUserMedia API (camera access)
- Fetch API (HTTP requests)
- LocalStorage API (data persistence)
- Blob API (file handling)

### State Management
- React useState hooks
- Component-level state
- localStorage for persistence
- Callback pattern for parent-child communication

### Styling
- Tailwind CSS utility classes
- CSS custom properties for colors
- Gradient backgrounds
- Responsive design with breakpoints
- Dark mode optimized

---

## File Locations Quick Reference

```
Project Root/
├── Components
│   └── src/components/
│       ├── Layout.jsx
│       ├── VideoUpload.jsx
│       ├── CameraCapture.jsx
│       ├── DetectionResults.jsx
│       └── History.jsx
│
├── Pages
│   └── src/pages/
│       ├── Dashboard.jsx
│       ├── About.jsx
│       ├── Settings.jsx
│       └── Help.jsx
│
├── Utilities
│   └── src/utils/
│       └── api.js
│
├── Styles
│   └── src/
│       ├── index.css (global)
│       ├── tailwind.config.js (config)
│       └── postcss.config.js (config)
│
├── Main App
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.html
│
└── Documentation
    ├── README.md
    ├── QUICKSTART.md
    ├── INSTALL_GUIDE.md
    ├── PROJECT_STRUCTURE.md
    ├── ENHANCEMENT_SUMMARY.md
    └── DOCUMENTATION_INDEX.md (this file)
```

---

## Common Tasks

### Running the Application
```bash
npm install      # Install dependencies (first time)
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Managing Settings
1. Click Settings in sidebar
2. Modify desired settings
3. Click "Save Settings" button
4. Settings automatically persist to localStorage

### Viewing Detection History
1. Click History in sidebar
2. Use filters to find specific detections
3. Sort by date or confidence
4. Click "Export CSV" to download
5. Click "Clear History" to reset (with confirmation)

### Uploading a Video
1. Click Upload Video in sidebar
2. Drag-drop or click to select video file
3. Wait for upload and processing
4. View results automatically
5. Click "Clear Results" to upload another

### Recording with Camera
1. Click Live Camera in sidebar
2. Click "Start Camera" (grant permission)
3. Click "Start Recording"
4. Recording timer will display
5. Click "Stop & Analyze" when done
6. View results automatically

### Reading Help & Documentation
1. Click Help in sidebar
2. Expand FAQ items for answers
3. Scroll to troubleshooting section
4. Check video format guide
5. Review best practices

---

## Troubleshooting Guide

### Problem: App Won't Start
**Solution**: 
1. Check Node.js is installed: `node --version`
2. Clear cache: `npm cache clean --force`
3. Reinstall: `rm -rf node_modules && npm install`

### Problem: Port Already in Use
**Solution**: Kill process on port 5173 or change port in `vite.config.js`

### Problem: Camera Not Working
**Solution**:
1. Grant camera permission
2. Check if another app uses camera
3. Restart browser
4. Try different browser

### Problem: Video Won't Upload
**Solution**:
1. Check file size (max 500MB)
2. Verify format (MP4, MOV, etc.)
3. Check internet connection
4. Review API endpoint in Settings

### Problem: API Shows Unreachable
**Solution**:
1. Check internet connection
2. Verify API endpoint URL in Settings
3. API might be down - check uptime

### More Help
See [Help Page](src/pages/Help.jsx) or [INSTALL_GUIDE.md](INSTALL_GUIDE.md)

---

## API Integration

### Endpoints Used
- `POST /api/upload-video` - Upload and analyze video
- `GET /api/status` - Check API status
- `GET /api/model-info` - Get model information

### Response Format
```json
{
  "confidence": 0.85,
  "is_violence": true,
  "labels": {
    "fight": 0.92,
    "physical_assault": 0.78,
    ...
  },
  "frames": ["base64_frame1", ...],
  "processing_time": 12.5,
  "filename": "video.mp4",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Default API Endpoint
```
http://127.0.0.1:5000/ (local development)
https://p-violence-hazardous-activities-detection.onrender.com/ (production)
```

Can be configured in Settings page.

---

## Security & Privacy

### Privacy Features
- No permanent video storage
- HTTPS-only API communication
- Local-only history storage
- No user tracking
- No third-party analytics

### Security Best Practices
- Don't share API endpoint publicly
- Use HTTPS in production
- Validate user input (automatic)
- Clear browser cache if having issues
- Keep sensitive settings safe

---

## Performance Tips

### For Faster Processing
1. Use shorter videos (5-15 seconds)
2. Lower video resolution if possible
3. Use MP4 format
4. Ensure good internet connection

### Browser Performance
1. Use latest browser version
2. Clear browser cache
3. Close unnecessary tabs
4. Disable browser extensions
5. Monitor browser memory usage

---

## Development Tips

### Adding New Features
1. Create component in `src/components/` or `src/pages/`
2. Import in `App.jsx`
3. Add navigation item to `Layout.jsx`
4. Handle state in `App.jsx`
5. Style with Tailwind CSS

### Modifying Colors
Edit `src/tailwind.config.js` theme section:
```javascript
colors: {
  blue: { ... },
  red: { ... },
  // Add custom colors
}
```

### Customizing Layout
Edit `src/components/Layout.jsx` for:
- Sidebar width
- Header styling
- Footer content
- Navigation items

---

## Deployment Options

1. **Netlify** - Connect GitHub repo, auto-deploy on push
2. **Vercel** - Optimized for React/Next.js apps
3. **GitHub Pages** - Free static hosting
4. **AWS S3** - Scalable cloud storage with CDN
5. **Docker** - Containerized deployment

### Build for Production
```bash
npm run build
# Creates optimized dist/ folder
# Deploy dist/ folder to hosting service
```

---

## Useful Links

### External Resources
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- MDN Web Docs: https://developer.mozilla.org

### Browser Developer Tools
- Chrome DevTools: F12
- Firefox DevTools: F12
- Safari DevTools: Cmd+Option+I
- Edge DevTools: F12

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Dec 2024 | Added sidebar, pages, removed emojis |
| 1.0.0 | Initial | Basic upload and camera features |

---

## Support Channels

1. **In-App Help** - Click Help in sidebar
2. **Documentation** - Read this documentation
3. **Browser Console** - F12 for error details
4. **API Status** - Check API endpoint
5. **GitHub Issues** - Submit bug reports

---

## Quick Links by Purpose

### "I want to..."

**...run the app**
→ [QUICKSTART.md](QUICKSTART.md) or [INSTALL_GUIDE.md](INSTALL_GUIDE.md)

**...understand the project structure**
→ [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

**...learn what was added**
→ [ENHANCEMENT_SUMMARY.md](ENHANCEMENT_SUMMARY.md)

**...use all features**
→ [README.md](README.md)

**...troubleshoot issues**
→ [INSTALL_GUIDE.md](INSTALL_GUIDE.md) Troubleshooting section

**...get help in the app**
→ Help page (click in sidebar)

---

## Final Checklist

Before deployment:
- [ ] All dependencies installed
- [ ] App runs locally without errors
- [ ] All pages load correctly
- [ ] Upload feature works
- [ ] Camera feature works
- [ ] History tracking works
- [ ] Settings persist
- [ ] API endpoint configured
- [ ] No console errors
- [ ] Responsive on mobile

---

## Contact & Feedback

For issues, questions, or suggestions:
1. Review relevant documentation
2. Check Help page in-app
3. Check browser console for errors
4. Test with different browsers
5. Verify API endpoint is accessible

---

**Last Updated**: December 13, 2024
**Version**: 2.0.0
**Status**: Production Ready

**Thank you for using XDVioDet! 🎥**
