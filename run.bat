@echo off
REM XDVioDet Flask Application Startup Script for Windows

echo.
echo ============================================
echo   XDVioDet - Multimodal Violence Detection
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/4] Python found: 
python --version

REM Check if venv exists, if not create it
if not exist "venv" (
    echo.
    echo [2/4] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Error: Failed to create virtual environment
        pause
        exit /b 1
    )
) else (
    echo [2/4] Virtual environment already exists
)

REM Activate virtual environment
echo [3/4] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo [4/4] Installing dependencies...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo Warning: Some packages may have failed to install
)

echo.
echo ============================================
echo   Starting XDVioDet Flask Server
echo ============================================
echo.
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

REM Run the Flask app
python app.py

pause
