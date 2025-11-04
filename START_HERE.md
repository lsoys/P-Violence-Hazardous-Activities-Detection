# 🎬 START HERE - XDVioDet Video Violence Detection

Welcome! This guide will get you up and running in **5 minutes**.

---

## ⚡ Quick Start (Choose Your Platform)

### Windows
```bash
1. Open Command Prompt in this folder
2. Run: setup.bat
3. Run: python app.py
4. Open: http://localhost:5000
```

### Mac/Linux
```bash
1. Open Terminal in this folder
2. Run: bash setup.sh
3. Run: python app.py
4. Open: http://localhost:5000
```

---

## 🎯 What You'll Get

A web interface where you can:
1. ✅ Upload video files (MP4, AVI, MOV, etc.)
2. ✅ Automatically detect violence in the video
3. ✅ See 15 different violence categories
4. ✅ View extracted frames
5. ✅ Track analysis history

---

## 📹 How to Use

### Step 1: Upload Video
- Click the upload area or drag-drop a video
- Supported: MP4, AVI, MOV, MKV, FLV, WMV, WebM
- Max size: 500MB

### Step 2: Wait for Analysis
- Processing typically takes 5-15 seconds
- You'll see a loading spinner

### Step 3: View Results
- **Confidence Score**: 0-100% violence probability
- **Classification**: "Violence Detected" or "No Violence"
- **Violence Labels**: 15 specific categories detected
- **Frame Preview**: Sample frames from the video

### Step 4: Check History
- All your analyses are saved
- Scroll down to see previous uploads
- Refreshing the page keeps the history

---

## 🚨 If Something Goes Wrong

### "Port 5000 already in use"
```bash
# Change the port in app.py (line 25):
# Change: app.run(host='0.0.0.0', port=5000)
# To: app.run(host='0.0.0.0', port=5001)
```

### "Module not found" errors
```bash
# Make sure you ran setup script
# Or manually install: pip install -r requirements.txt
```

### "Video format not supported"
Check that your video is in one of these formats:
- MP4, AVI, MOV, MKV, FLV, WMV, WebM

### "File too large"
Videos must be under 500MB. Try:
- Using a shorter clip
- Compressing the video
- Reducing resolution

---

## 📚 Need More Information?

Read the detailed guides:

| Document | For |
|----------|-----|
| **VIDEO_DETECTION_GUIDE.md** | Complete user guide |
| **IMPLEMENTATION_SUMMARY.md** | Technical details |
| **COMPLETION_CHECKLIST.md** | What's implemented |
| **README.md** | Project overview |

---

## 🔧 Verify Everything Works

```bash
python test_integration.py
```

This checks:
- ✅ Python version
- ✅ All files present
- ✅ Dependencies installed
- ✅ GPU available (if you have one)
- ✅ Model loads correctly

---

## 🎯 15 Violence Categories

The system detects:

**Weapons:**
- 🔫 Gun
- 🔪 Knife
- 💣 Explosion

**Physical:**
- 👊 Fight
- 🤕 Physical Assault
- 🩸 Blood

**Behavior:**
- 🤚 Threatening Gesture
- 🚗 Car Crash
- 👥 Mob Violence

**Other:**
- 🍺 Alcohol
- 💨 Smoke
- 🚬 Cigarette
- 💬 Gesture
- 🔫 Shooting
- 🗡️ Stabbing

Each shows a confidence percentage!

---

## ⏱️ Performance

Small video (10MB): ~2-3 seconds  
Medium video (50MB): ~8-12 seconds  
Large video (100MB): ~20-30 seconds  

*Times vary based on your computer*

---

## 🐳 Docker Alternative

If you have Docker installed:

```bash
docker-compose up
```

Then open: http://localhost:5000

---

## 💡 Tips

✅ **Upload one video at a time** - System processes sequentially  
✅ **Keep videos under 100MB** - Faster processing  
✅ **Check browser console for errors** - Press F12, go to Console tab  
✅ **History is saved locally** - No data sent to server  
✅ **GPU speeds things up** - Check with setup script  

---

## 🎓 API Integration

Want to use the API instead of the web UI?

```bash
# Upload a video
curl -X POST -F "video=@myvideo.mp4" \
     http://localhost:5000/api/upload-video

# Check status
curl http://localhost:5000/api/status
```

See VIDEO_DETECTION_GUIDE.md for full API docs.

---

## ❓ Common Questions

**Q: Is my video data sent to a server?**  
A: No! Everything runs locally on your machine.

**Q: Can I use this without a GPU?**  
A: Yes! It works on CPU, just slower (~2-3x slower).

**Q: What about data privacy?**  
A: All data stays on your local machine. Nothing is uploaded.

**Q: Can I train the model with my own data?**  
A: Yes! See `train.py` and `main.py` in the project.

**Q: What if I get different results each time?**  
A: The model uses slight variations based on features. Small differences are normal.

---

## 📊 Example Workflow

```
1. Download a test video
   └─> or create one with your phone camera

2. Open http://localhost:5000
   └─> drag-drop the video

3. Wait 5-15 seconds
   └─> processing happens automatically

4. View results
   └─> Violence confidence score
   └─> Detected categories
   └─> Frame preview

5. Check history
   └─> see all previous uploads
   └─> persistent across page refreshes
```

---

## 🚀 Next Steps

1. **Right now:**
   - Run setup script
   - Start the app
   - Upload a test video

2. **After testing:**
   - Read detailed guides
   - Explore API endpoints
   - Consider deployment options

3. **For production:**
   - Use Docker
   - Configure settings
   - Set up logging
   - Consider GPU deployment

---

## 📞 Support

**Stuck? Try this:**

1. Run: `python test_integration.py`
2. Read: `VIDEO_DETECTION_GUIDE.md`
3. Check: Browser console (F12)
4. See: `COMPLETION_CHECKLIST.md`

---

## ✅ You're All Set!

Everything you need is ready. Just:

```
1. Run setup script (setup.bat or setup.sh)
2. Run: python app.py
3. Open: http://localhost:5000
4. Upload a video
5. See the magic happen! 🎬
```

---

**Welcome to XDVioDet v2.0 - Video Violence Detection! 🎉**

*For detailed information, see the documentation files.*

