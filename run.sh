#!/bin/bash

# XDVioDet Flask Application Startup Script for Linux/macOS

echo ""
echo "============================================"
echo "  XDVioDet - Multimodal Violence Detection"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

echo "[1/4] Python found:"
python3 --version

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo ""
    echo "[2/4] Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment"
        exit 1
    fi
else
    echo "[2/4] Virtual environment already exists"
fi

# Activate virtual environment
echo "[3/4] Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "[4/4] Installing dependencies..."
pip install -r requirements.txt -q
if [ $? -ne 0 ]; then
    echo "Warning: Some packages may have failed to install"
fi

echo ""
echo "============================================"
echo "  Starting XDVioDet Flask Server"
echo "============================================"
echo ""
echo "Server will be available at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

# Run the Flask app
python app.py
