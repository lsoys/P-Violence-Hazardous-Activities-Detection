# XDVioDet - Multimodal Violence Detection

<div align="center">

![Python 3.8+](https://img.shields.io/badge/Python-3.8%2B-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-1.9%2B-ee4c2c)
![OpenCV](https://img.shields.io/badge/OpenCV-4.5%2B-green)
![License](https://img.shields.io/badge/License-MIT-green)
![ECCV 2020](https://img.shields.io/badge/ECCV-2020-blue)

**Not only Look, but also Listen: Learning Multimodal Violence Detection under Weak Supervision**

[Project Website](https://roc-ng.github.io/XD-Violence/) • [Download Features](https://roc-ng.github.io/XD-Violence/) • [Paper](https://arxiv.org/abs/2007.10442)

</div>

---

## � NEW: Video Detection System (v2.0)

**This project has been enhanced with direct video file upload support!**

Instead of using pre-extracted features, you can now:
- 📹 Upload video files directly
- 🏷️ Detect 15 violence categories automatically  
- 👁️ Preview extracted frames
- 📊 View real-time analysis results

👉 **[Start Here: VIDEO_DETECTION_GUIDE.md](VIDEO_DETECTION_GUIDE.md)** for the new video-based workflow.

---

## �🎯 Overview

XDVioDet is an advanced deep learning system for detecting violence in videos using multimodal analysis (RGB video + Audio). It combines visual and acoustic information to achieve robust violence detection with weak supervision (video-level labels only).

### Key Features

- 🎬 **Video Upload**: Direct video file support (MP4, AVI, MOV, MKV, etc.)
- 🏷️ **Multi-Label Detection**: Detects 15 violence categories simultaneously
- 📊 **Multimodal Analysis**: Combines RGB and Audio features for robust detection
- 🧠 **Graph Convolutional Networks**: Advanced temporal modeling with GCN
- � **Web Interface**: Modern Flask-based web UI with Tailwind CSS
- 📱 **REST API**: Easy-to-use API endpoints for integration
- ⚡ **GPU Support**: CUDA acceleration for fast inference
- 📈 **Real-time Results**: Instant violence detection with confidence scores
- 🚀 **Responsive UI**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- CUDA 11.0+ (optional, for GPU acceleration)
- pip or conda

### Installation

#### Option 1: Automated Setup (Windows)

```bash
# Simply run the batch script
run.bat
```

#### Option 2: Automated Setup (Linux/macOS)

```bash
# Make the script executable
chmod +x run.sh

# Run the script
./run.sh
```

#### Option 3: Manual Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Application

#### Web Interface (Recommended)

```bash
python app.py
```

Then open your browser and navigate to: **http://localhost:5000**

#### Command Line Training

```bash
python main.py
```

#### Inference

```bash
python infer.py
```

## 📖 Usage

### Web Interface Features

- **Upload Features**: Drag-and-drop .npy files or enter JSON features
- **Real-time Analysis**: Get instant violence detection results
- **Confidence Scores**: View detailed offline and online analysis scores
- **History Tracking**: Keep track of all analyses performed
- **System Monitoring**: Monitor GPU/CPU usage and API health

### API Endpoints

#### Health Check
```bash
GET /api/health
GET /api/status
GET /api/model-info
```

#### Prediction
```bash
POST /api/predict
Content-Type: application/json

{
  "features": [0.1, 0.2, ..., 0.9]  // 1024-dimensional feature vector
}
```

**Response:**
```json
{
  "success": true,
  "offline_score": 0.85,
  "online_score": 0.82,
  "is_violence": true,
  "confidence": 0.85
}
```

## 📁 Project Structure

```
XDVioDet/
├── app.py                    # Flask application
├── main.py                   # Training script
├── infer.py                  # Inference script
├── train.py                  # Training functions
├── test.py                   # Testing functions
├── model.py                  # Model architecture
├── dataset.py                # Dataset loader
├── layers.py                 # Custom neural layers
├── option.py                 # Configuration parameters
├── utils.py                  # Utility functions
├── requirements.txt          # Python dependencies
├── SETUP_GUIDE.md            # Detailed setup guide
├── run.bat                   # Windows startup script
├── run.sh                    # Linux/macOS startup script
├── .env.example              # Environment configuration template
├── ckpt/                     # Model checkpoints
├── list/                     # Feature lists and ground truth
├── templates/                # HTML templates
│   └── index.html           # Web interface
└── static/                   # Static files
    ├── css/                 # Stylesheets (Tailwind CSS)
    └── js/                  # JavaScript
        └── main.js          # Frontend logic
```

## ⚙️ Configuration

Edit `option.py` or `.env` to customize:

- **modality**: Input modality (AUDIO, RGB, FLOW, MIX1, MIX2, MIX3, MIX_ALL)
- **batch_size**: Training batch size (default: 128)
- **lr**: Learning rate (default: 0.0001)
- **max_epoch**: Maximum training epochs (default: 50)
- **feature_size**: Feature dimension (default: 1152)
- **max_seqlen**: Maximum sequence length (default: 200)

## 📊 Data Preparation

1. **Download Features**: Get pre-extracted features from [XD-Violence website](https://roc-ng.github.io/XD-Violence/)

2. **Generate Lists**: Create training/test lists
   ```bash
   cd list
   python make_list.py
   cd ..
   ```

3. **Feature Format**: Features are organized with "5-crop" augmentation:
   - `_0.npy`: Center crop
   - `_1-4.npy`: Corner crops

## 🏗️ Model Architecture

- **Visual Stream**: RGB features (1024-dim) via 1D convolution
- **Audio Stream**: Audio features (128-dim) via 1D convolution
- **Fusion**: Multimodal fusion combining both streams
- **Temporal Modeling**: Graph Convolutional Networks (GCN)
- **Classification**: Multi-layer perceptron for violence classification

## 🎓 Citation

If you use this code in your research, please cite:

```bibtex
@inproceedings{wu2020not,
  title={Not only look, but also listen: Learning multimodal violence detection under weak supervision},
  author={Wu, Peng and Liu, Jing and Shi, Yujia and Sun, Yingying and Shao, Feng and Wu, Zhaoyang and Jiang, Zonghao},
  booktitle={European Conference on Computer Vision},
  pages={322--339},
  year={2020},
  organization={Springer}
}
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CUDA Out of Memory | Reduce `batch_size` in `option.py` or use CPU mode |
| Model Not Loading | Verify checkpoint exists in `ckpt/wsanodet_mix2.pkl` |
| Missing Features | Run `make_list.py` in the list folder |
| Port Already in Use | Change `PORT` in `.env` or run on different port |

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Original paper authors and contributors
- PyTorch community
- Contributors and users who reported issues

## 📞 Support

- Report issues on GitHub
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions
- Visit the [project website](https://roc-ng.github.io/XD-Violence/)

---

**Last Updated**: 2024 | Made with ❤️ for violence detection research
