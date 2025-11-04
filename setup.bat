@echo off
REM Setup script for XDVioDet Video Detection System - Windows

echo ========================================
echo XDVioDet - Video Violence Detection
echo Setup Script for Windows
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo X Python not found. Please install Python 3.8 or higher.
    echo   Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Checking Python installation...
for /f "tokens=*" %%i in ('python --version') do echo * %%i
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo * Virtual environment created
) else (
    echo * Virtual environment already exists
)

echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.

REM Create necessary directories
echo Creating required directories...
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist frames mkdir frames
if not exist results mkdir results

echo * Directories created
echo.

REM Check GPU availability
echo Checking GPU availability...
python -c "import torch; print('* CUDA available:', torch.cuda.is_available()); print('  GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None (will use CPU)')"

echo.
echo ========================================
echo * Setup Complete!
echo ========================================
echo.
echo To run the application:
echo   1. Open Command Prompt in this directory
echo   2. Run: venv\Scripts\activate.bat
echo   3. Run: python app.py
echo.
echo Then open your browser: http://localhost:5000
echo.
pause
