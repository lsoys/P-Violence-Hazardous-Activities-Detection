from flask import Blueprint, Response, jsonify, request
import cv2
import time
import threading
from detector import ViolenceDetector
import logging
import numpy as np

import os
from datetime import datetime

camera_bp = Blueprint('camera', __name__)
logger = logging.getLogger(__name__)

# Constants for evidence storage
UPLOAD_FOLDER = 'uploads/violence_events'
CONFIDENCE_THRESHOLD = 0.6  # Threshold to trigger evidence saving

class CameraManager:
    def __init__(self):
        self.camera = None
        self.detector = None
        self.is_running = False
        self.latest_frame = None
        self.latest_analysis = None
        self.lock = threading.Lock()
        self.thread = None
        self.last_save_time = 0
        self.save_cooldown = 10 # Seconds between saves
        
        # Ensure upload folder exists
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    def start_camera(self):
        with self.lock:
            if self.is_running:
                return True
            
            # Lazy initialization of detector
            if self.detector is None:
                try:
                    self.detector = ViolenceDetector()
                except Exception as e:
                    logger.error(f"Failed to initialize detector: {e}")
                    return False
            
            try:
                self.camera = cv2.VideoCapture(0)
                if not self.camera.isOpened():
                    logger.error("Failed to open camera 0")
                    # Try index 1 just in case
                    self.camera = cv2.VideoCapture(1)
                    if not self.camera.isOpened():
                        return False
            except Exception as e:
                logger.error(f"Error opening camera: {e}")
                return False
                
            self.is_running = True
            self.thread = threading.Thread(target=self._capture_loop)
            self.thread.daemon = True
            self.thread.start()
            return True

    def stop_camera(self):
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=2.0)
            self.thread = None
        
        with self.lock:
            if self.camera:
                self.camera.release()
                self.camera = None
        return True

    def _capture_loop(self):
        logger.info("Camera capture loop started")
        while self.is_running and self.camera:
            ret, frame = self.camera.read()
            if not ret:
                logger.warning("Failed to read frame")
                time.sleep(0.1)
                continue
                
            try:
                # Run detection
                if self.detector:
                    analysis = self.detector.process_frame(frame)
                    
                    # Check for evidence storage trigger
                    overall_danger = analysis.get('overall_danger', 0)
                    if overall_danger >= CONFIDENCE_THRESHOLD:
                        current_time = time.time()
                        if current_time - self.last_save_time > self.save_cooldown:
                            self._save_evidence(frame, analysis)
                            self.last_save_time = current_time
                    
                    # Draw detections
                    annotated_frame = frame.copy()
                    self.detector.draw_detections(annotated_frame, analysis)
                else:
                    analysis = {}
                    annotated_frame = frame
                
                with self.lock:
                    self.latest_frame = annotated_frame
                    self.latest_analysis = analysis
            except Exception as e:
                logger.error(f"Error in capture loop: {e}")
            
            time.sleep(0.03) # ~30 FPS
        logger.info("Camera capture loop ended")

    def _save_evidence(self, frame, analysis):
        """Save evidence frame and metadata"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"event_{timestamp}.jpg"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            # Save the frame
            cv2.imwrite(filepath, frame)
            
            # Save metadata as well
            meta_filename = f"event_{timestamp}.json"
            meta_filepath = os.path.join(UPLOAD_FOLDER, meta_filename)
            import json
            with open(meta_filepath, 'w') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'danger_level': analysis.get('overall_danger', 0),
                    'alerts': analysis.get('alerts', []),
                    'image_file': filename
                }, f)
                
            logger.info(f"Evidence saved: {filename}")
        except Exception as e:
            logger.error(f"Failed to save evidence: {e}")

    def get_frame(self):
        with self.lock:
            if self.latest_frame is None:
                # Return a black frame if no frame available
                empty_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                ret, jpeg = cv2.imencode('.jpg', empty_frame)
                return jpeg.tobytes()
                
            ret, jpeg = cv2.imencode('.jpg', self.latest_frame)
            return jpeg.tobytes()

    def get_analysis(self):
        with self.lock:
            return self.latest_analysis

# Global instance
camera_manager = CameraManager()

@camera_bp.route('/api/camera/start', methods=['POST'])
def start_camera():
    try:
        success = camera_manager.start_camera()
        if success:
            return jsonify({"success": True, "message": "Camera started"})
        else:
            return jsonify({"success": False, "error": "Could not open camera"}), 500
    except Exception as e:
        logger.error(f"Start camera exception: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@camera_bp.route('/api/camera/stop', methods=['POST'])
def stop_camera():
    try:
        camera_manager.stop_camera()
        return jsonify({"success": True, "message": "Camera stopped"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@camera_bp.route('/api/camera/stream')
def video_feed():
    def generate():
        while True:
            frame = camera_manager.get_frame()
            if frame:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            else:
                time.sleep(0.1)
                
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@camera_bp.route('/api/camera/analysis')
def get_analysis():
    analysis = camera_manager.get_analysis()
    if analysis:
        # Convert numpy types to native python types for JSON serialization
        # (Although detector.py seems to handle this, good to be safe if we need to deep clean)
        return jsonify({"success": True, "analysis": analysis})
    else:
        # If camera is just starting, return empty analysis instead of 404
        return jsonify({
            "success": True, 
            "analysis": {
                'violence_score': 0.0,
                'hazard_score': 0.0,
                'overall_danger': 0.0,
                'danger_level': 0.0,
                'people_count': 0,
                'alerts': []
            }
        })
