#!/usr/bin/env python3
"""
Quick integration test for XDVioDet Video Detection System
Verifies all components are properly configured
"""

import os
import sys
import importlib.util

def check_file(filepath, description):
    """Check if a file exists"""
    if os.path.isfile(filepath):
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description} - NOT FOUND: {filepath}")
        return False

def check_directory(dirpath, description):
    """Check if a directory exists"""
    if os.path.isdir(dirpath):
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description} - NOT FOUND: {dirpath}")
        return False

def check_module(module_name):
    """Check if a Python module can be imported"""
    try:
        __import__(module_name)
        print(f"✅ Module '{module_name}' is installed")
        return True
    except ImportError:
        print(f"❌ Module '{module_name}' is NOT installed")
        return False

def main():
    print("=" * 60)
    print("XDVioDet - Video Detection System - Integration Test")
    print("=" * 60)
    print()
    
    all_passed = True
    
    # Check Python version
    print("📝 Checking Python version...")
    if sys.version_info >= (3, 8):
        print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} (required: 3.8+)")
    else:
        print(f"❌ Python {sys.version_info.major}.{sys.version_info.minor} (required: 3.8+)")
        all_passed = False
    print()
    
    # Check project files
    print("📂 Checking project files...")
    all_passed &= check_file("app.py", "Main Flask application")
    all_passed &= check_file("model.py", "PyTorch model")
    all_passed &= check_file("requirements.txt", "Dependencies file")
    all_passed &= check_file("templates/index.html", "Web interface template")
    all_passed &= check_file("static/js/video.js", "Video upload JavaScript")
    all_passed &= check_file("VIDEO_DETECTION_GUIDE.md", "User guide")
    print()
    
    # Check directories
    print("📁 Checking directories...")
    all_passed &= check_directory("static", "Static files directory")
    all_passed &= check_directory("static/js", "JavaScript directory")
    all_passed &= check_directory("static/css", "CSS directory")
    all_passed &= check_directory("templates", "Templates directory")
    print()
    
    # Check Python modules
    print("📦 Checking Python modules...")
    modules = [
        'flask',
        'flask_cors',
        'torch',
        'numpy',
        'cv2',
    ]
    
    for module in modules:
        all_passed &= check_module(module)
    print()
    
    # Check Flask app
    print("🔧 Checking Flask application...")
    try:
        from app import app, model, device
        print(f"✅ Flask app imports successfully")
        print(f"✅ Model initialized: {model is not None}")
        print(f"✅ Device detected: {device}")
    except Exception as e:
        print(f"❌ Flask app import failed: {e}")
        all_passed = False
    print()
    
    # Check GPU
    print("🎮 Checking GPU availability...")
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ CUDA available")
            print(f"   GPU: {torch.cuda.get_device_name(0)}")
            print(f"   Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
        else:
            print(f"⚠️  CUDA not available (will use CPU - slower)")
    except Exception as e:
        print(f"❌ GPU check failed: {e}")
    print()
    
    # Summary
    print("=" * 60)
    if all_passed:
        print("✅ All checks passed! System is ready to run.")
        print()
        print("To start the application:")
        print("  1. Activate virtual environment: source venv/bin/activate (or venv\\Scripts\\activate on Windows)")
        print("  2. Run: python app.py")
        print("  3. Open: http://localhost:5000")
    else:
        print("❌ Some checks failed. Please review the errors above.")
        print()
        print("Troubleshooting:")
        print("  1. Make sure all dependencies are installed: pip install -r requirements.txt")
        print("  2. Verify Python 3.8+ is being used: python --version")
        print("  3. Check that all files are in the correct directories")
    print("=" * 60)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
