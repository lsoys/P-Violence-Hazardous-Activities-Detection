#!/bin/bash
# Setup script for XDVioDet Video Detection System

echo "========================================"
echo "XDVioDet - Video Violence Detection"
echo "Setup Script"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

echo ""

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo ""

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p frames
mkdir -p results

echo "✓ Directories created"
echo ""

# Check GPU availability
echo "🎮 Checking GPU availability..."
python3 << EOF
import torch
if torch.cuda.is_available():
    print(f"✓ CUDA available: {torch.cuda.get_device_name(0)}")
    print(f"  GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
else:
    print("⚠ CUDA not available - will use CPU (slower)")
EOF

echo ""
echo "========================================"
echo "✓ Setup Complete!"
echo "========================================"
echo ""
echo "To run the application:"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""
echo "Then open: http://localhost:5000"
echo ""
