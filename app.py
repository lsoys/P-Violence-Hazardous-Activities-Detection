"""
XDVioDet Pro - Violence & Hazard Detection System
Using YOLOv8 + Motion Analysis for high-accuracy detection
"""

from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import numpy as np
import os
import logging
from datetime import datetime
import time
import cv2
import json
import base64
import threading
import queue

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder for numpy types"""
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, (np.floating, np.float32, np.float64)):
            return float(obj)
        elif isinstance(obj, (np.integer, np.int32, np.int64)):
            return int(obj)
        elif isinstance(obj, np.bool_):
            return bool(obj)
        return super().default(obj)


# Initialize Flask app
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['JSON_SORT_KEYS'] = False
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024
app.json_encoder = NumpyEncoder

# Global state
detector = None
prediction_count = 0
alert_history = []

# Camera streaming state
camera_active = False
camera_thread = None
camera_lock = threading.Lock()
frame_queue = queue.Queue(maxsize=2)
current_analysis = {'alerts': [], 'detections': [], 'danger': 0, 'frame': None}

# Labels
VIOLENCE_LABELS = {
    'fire': '#FF0000',
    'smoke': '#FF6600',
    'knife': '#EF5350',
    'gun': '#D32F2F',
    'fight': '#C62828',
    'violence': '#B71C1C',
    'aggression': '#E64A19',
    'person': '#4CAF50',
    'weapon': '#F44336',
    'danger': '#FF5722',
}

ALLOWED_VIDEO_FORMATS = {'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'}
UPLOAD_FOLDER = 'uploads'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'frames'), exist_ok=True)


def init_detector():
    """Initialize the YOLOv8 violence detector"""
    global detector
    try:
        logger.info("Initializing YOLOv8 Violence Detector...")
        from detector import ViolenceDetector
        detector = ViolenceDetector(confidence_threshold=0.4)
        logger.info("YOLOv8 Detector initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Error initializing detector: {str(e)}", exc_info=True)
        return False


def camera_capture_thread():
    """Background thread for continuous camera capture and analysis"""
    global camera_active, current_analysis
    
    cap = cv2.VideoCapture(0)  # Use default camera
    if not cap.isOpened():
        logger.error("Failed to open camera - device may not be available")
        camera_active = False
        return
    
    # Set camera properties for better performance
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    frame_count = 0
    analysis_interval = 3  # Analyze every 3rd frame for performance
    frames_in_queue = 0
    
    logger.info("Camera capture thread started - waiting for frames")
    
    while camera_active:
        ret, frame = cap.read()
        if not ret:
            logger.warning("Failed to read frame from camera")
            break
        
        frame_count += 1
        
        # Resize frame for faster processing
        frame = cv2.resize(frame, (640, 480))
        
        # Analyze every N frames
        if frame_count % analysis_interval == 0 and detector is not None:
            try:
                analysis = detector.process_frame(frame)
                annotated_frame = detector.draw_detections(frame, analysis)
                
                # Update current analysis
                with camera_lock:
                    current_analysis = {
                        'alerts': analysis.get('alerts', []),
                        'detections': analysis.get('detections', []),
                        'danger': analysis.get('overall_danger', 0),
                        'violence_score': analysis.get('violence_score', 0),
                        'hazard_score': analysis.get('hazard_score', 0),
                        'frame': annotated_frame,
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    # Add alerts to history
                    for alert in analysis.get('alerts', []):
                        alert_history.append({**alert, 'source': 'camera', 'timestamp': datetime.now().isoformat()})
                
                # Put frame in queue for streaming
                try:
                    frame_queue.put_nowait(annotated_frame)
                    frames_in_queue += 1
                except queue.Full:
                    pass  # Drop frame if queue is full
            except Exception as e:
                logger.error(f"Error during frame analysis: {str(e)}")
        else:
            # Still put frame even if not analyzed to maintain stream
            try:
                frame_queue.put_nowait(frame)
                frames_in_queue += 1
            except queue.Full:
                pass
        
        # Log status every 30 frames
        if frame_count % 30 == 0:
            logger.debug(f"Camera: {frame_count} frames captured, {frames_in_queue} in queue")
    
    cap.release()
    logger.info(f"Camera capture thread stopped - captured {frame_count} frames total")



def generate_frames():
    """Generator for MJPEG stream"""
    frame_count = 0
    logger.info("MJPEG stream started")
    
    while camera_active:
        try:
            frame = frame_queue.get(timeout=2)
            if frame is None:
                continue
            
            # Ensure frame is valid
            if not isinstance(frame, np.ndarray):
                logger.warning("Invalid frame type in queue")
                continue
            
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if ret and buffer is not None:
                frame_count += 1
                if frame_count % 30 == 0:
                    logger.debug(f"MJPEG: Streamed {frame_count} frames")
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n'
                       b'Content-Length: ' + str(len(buffer)).encode() + b'\r\n'
                       b'X-Frame-Number: ' + str(frame_count).encode() + b'\r\n\r\n'
                       + buffer.tobytes() + b'\r\n')
            else:
                logger.warning("Failed to encode frame to JPEG")
        except queue.Empty:
            logger.debug("Frame queue empty, waiting...")
            continue
        except Exception as e:
            logger.error(f"Error generating frame: {str(e)}")
            break
    
    logger.info(f"MJPEG stream ended - served {frame_count} frames")



def process_video_with_yolo(video_path):
    """Process video using YOLOv8 detector"""
    global detector
    
    if detector is None:
        raise ValueError("Detector not initialized")
    
    logger.info(f"Processing video with YOLOv8: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Cannot open video file")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    frame_analyses = []
    all_alerts = []
    all_detections = []
    frames_preview = []
    
    max_violence_score = 0
    max_hazard_score = 0
    
    frame_idx = 0
    sample_rate = max(1, int(fps / 8))
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_idx % sample_rate == 0:
            analysis = detector.process_frame(frame)
            analysis['frame_idx'] = frame_idx
            analysis['timestamp'] = frame_idx / fps if fps > 0 else 0
            
            frame_analyses.append(analysis)
            
            for alert in analysis.get('alerts', []):
                alert['frame_idx'] = frame_idx
                alert['timestamp'] = analysis['timestamp']
                all_alerts.append(alert)
            
            for det in analysis.get('detections', []):
                det['frame_idx'] = frame_idx
                all_detections.append(det)
            
            max_violence_score = max(max_violence_score, analysis.get('violence_score', 0))
            max_hazard_score = max(max_hazard_score, analysis.get('hazard_score', 0))
            
            if len(frames_preview) < 10 and (analysis.get('alerts') or analysis.get('overall_danger', 0) > 0.3):
                annotated = detector.draw_detections(frame, analysis)
                preview = cv2.resize(annotated, (320, 240))
                ret_enc, buffer = cv2.imencode('.jpg', preview)
                if ret_enc:
                    frames_preview.append({
                        'data': base64.b64encode(buffer).decode('utf-8'),
                        'frame_idx': frame_idx,
                        'timestamp': analysis['timestamp'],
                        'danger_level': analysis.get('overall_danger', 0)
                    })
        
        frame_idx += 1
    
    cap.release()
    
    frame_predictions = [
        max(a.get('violence_score', 0), a.get('hazard_score', 0)) 
        for a in frame_analyses
    ]
    
    is_violence = max_violence_score > 0.5
    is_hazard = max_hazard_score > 0.5
    overall_confidence = max(max_violence_score, max_hazard_score)
    
    labels_detected = {}
    for det in all_detections:
        label = det.get('label', 'unknown')
        conf = det.get('confidence', 0)
        if label not in labels_detected or conf > labels_detected[label]:
            labels_detected[label] = conf
    
    if max_violence_score > 0.5:
        labels_detected['violence'] = max_violence_score
    if max_hazard_score > 0.5:
        labels_detected['hazard'] = max_hazard_score
    
    return {
        'fps': fps,
        'total_frames': total_frames,
        'analyzed_frames': len(frame_analyses),
        'width': width,
        'height': height,
        'frame_predictions': frame_predictions,
        'max_violence_score': max_violence_score,
        'max_hazard_score': max_hazard_score,
        'overall_confidence': overall_confidence,
        'is_violence': is_violence,
        'is_hazard': is_hazard,
        'alerts': all_alerts,
        'detections': all_detections,
        'labels': labels_detected,
        'frames_preview': frames_preview
    }


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/live-detection')
def live_detection():
    """Live detection page with camera streaming"""
    return render_template('live-detection.html')


@app.route('/api/status')
def get_status():
    """Check server status and detector initialization"""
    status = {
        'status': 'healthy',
        'detector_initialized': detector is not None,
        'prediction_count': prediction_count,
        'alert_history_count': len(alert_history),
        'timestamp': datetime.now().isoformat()
    }
    
    if detector is None:
        status['status'] = 'degraded'
        status['error'] = 'AI detector not initialized'
    
    return jsonify(status)


@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    global prediction_count, alert_history
    
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided in the request'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected - filename is empty'}), 400
        
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if file_ext not in ALLOWED_VIDEO_FORMATS:
            return jsonify({'error': f'Unsupported video format: {file_ext}. Allowed formats: {", ".join(ALLOWED_VIDEO_FORMATS)}'}), 400
        
        # Check if detector is initialized
        if detector is None:
            return jsonify({'error': 'AI detector is not initialized. Please check server logs for details.'}), 500
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'video_{timestamp}.{file_ext}'
        video_path = os.path.join(UPLOAD_FOLDER, filename)
        
        try:
            file.save(video_path)
        except Exception as e:
            return jsonify({'error': f'Failed to save uploaded file: {str(e)}'}), 500
        
        logger.info(f"Video uploaded successfully: {video_path}")
        
        start_time = time.time()
        try:
            results = process_video_with_yolo(video_path)
        except Exception as e:
            logger.error(f"Video processing failed: {str(e)}", exc_info=True)
            return jsonify({'error': f'Video analysis failed: {str(e)}'}), 500
        
        processing_time = time.time() - start_time
        
        prediction_count += 1
        
        for alert in results.get('alerts', []):
            alert['video_id'] = timestamp
            alert['video_filename'] = filename
            alert_history.append(alert)
        
        if len(alert_history) > 100:
            alert_history = alert_history[-100:]
        
        response = {
            'success': True,
            'filename': filename,
            'video_id': timestamp,
            'total_frames': results['total_frames'],
            'analyzed_frames': results['analyzed_frames'],
            'processing_time': processing_time,
            'confidence': results['overall_confidence'],
            'is_violence': results['is_violence'],
            'is_hazard': results['is_hazard'],
            'violence_score': results['max_violence_score'],
            'hazard_score': results['max_hazard_score'],
            'labels': results['labels'],
            'alerts': results['alerts'][:20],
            'alert_count': len(results['alerts']),
            'frames': [f['data'] for f in results['frames_preview']],
            'frames_info': results['frames_preview'],
            'video_path': f'/uploads/{filename}',
            'frame_predictions': results['frame_predictions'],
            'timestamp': datetime.now().isoformat(),
            'detection_summary': {
                'violence_detected': results['is_violence'],
                'hazard_detected': results['is_hazard'],
                'max_violence': results['max_violence_score'],
                'max_hazard': results['max_hazard_score'],
                'total_alerts': len(results['alerts']),
                'labels_found': list(results['labels'].keys())
            }
        }
        
        if results['is_violence'] or results['is_hazard']:
            logger.warning(f"ALERT: Violence/Hazard detected in {filename}")
            logger.warning(f"   Violence Score: {results['max_violence_score']:.2%}")
            logger.warning(f"   Hazard Score: {results['max_hazard_score']:.2%}")
        else:
            logger.info(f"Video processed - No significant threats detected")
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Unexpected error in upload_video: {str(e)}", exc_info=True)
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/api/alerts')
def get_alerts():
    try:
        return jsonify({
            'success': True,
            'alerts': alert_history[-50:],
            'total': len(alert_history)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/clear-alerts', methods=['POST'])
def clear_alerts():
    global alert_history
    alert_history = []
    return jsonify({'success': True, 'message': 'Alerts cleared'})


@app.route('/api/status')
def status():
    try:
        yolo_available = False
        if detector is not None:
            yolo_available = detector.yolo_model is not None
        
        return jsonify({
            'status': 'running',
            'detector_loaded': detector is not None,
            'yolo_available': yolo_available,
            'timestamp': datetime.now().isoformat(),
            'videos_processed': prediction_count,
            'active_alerts': len(alert_history),
            'max_video_size': '500MB',
            'supported_detections': [
                'Violence/Fighting',
                'Fire/Flames',
                'Weapons (knife, etc.)',
                'Aggressive behavior',
                'Motion anomaly'
            ]
        })
    except Exception as e:
        return jsonify({'error': 'Failed to get status'}), 500


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception:
        return jsonify({'error': 'File not found'}), 404


# ============ CAMERA STREAMING ENDPOINTS ============

@app.route('/api/camera/start', methods=['POST'])
def start_camera():
    """Start camera streaming"""
    global camera_active, camera_thread
    
    try:
        if camera_active:
            return jsonify({'success': False, 'error': 'Camera is already running'}), 400
        
        if detector is None:
            return jsonify({'success': False, 'error': 'Detector not initialized'}), 500
        
        camera_active = True
        camera_thread = threading.Thread(target=camera_capture_thread, daemon=True)
        camera_thread.start()
        
        logger.info("Camera stream started")
        return jsonify({
            'success': True,
            'message': 'Camera stream started successfully',
            'stream_url': '/api/camera/stream',
            'analysis_url': '/api/camera/analysis'
        })
    except Exception as e:
        logger.error(f"Error starting camera: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/camera/stop', methods=['POST'])
def stop_camera():
    """Stop camera streaming"""
    global camera_active
    
    try:
        camera_active = False
        # Give thread time to clean up
        import time
        time.sleep(0.5)
        logger.info("Camera stream stopped")
        return jsonify({
            'success': True,
            'message': 'Camera stream stopped'
        })
    except Exception as e:
        logger.error(f"Error stopping camera: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/camera/stream')
def camera_stream():
    """MJPEG stream endpoint"""
    if not camera_active:
        return jsonify({'error': 'Camera not active'}), 400
    
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/api/camera/analysis')
def camera_analysis():
    """Get current camera frame analysis"""
    global current_analysis
    
    try:
        with camera_lock:
            analysis_data = {
                'alerts': current_analysis.get('alerts', []),
                'detections': current_analysis.get('detections', []),
                'danger_level': current_analysis.get('danger', 0),
                'violence_score': current_analysis.get('violence_score', 0),
                'hazard_score': current_analysis.get('hazard_score', 0),
                'timestamp': current_analysis.get('timestamp', '')
            }
        
        return jsonify({
            'success': True,
            'analysis': analysis_data
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/camera/status')
def camera_status():
    """Get camera status"""
    try:
        return jsonify({
            'success': True,
            'camera_active': camera_active,
            'detector_ready': detector is not None,
            'latest_analysis': {
                'danger_level': current_analysis.get('danger', 0),
                'alerts_count': len(current_analysis.get('alerts', [])),
                'timestamp': current_analysis.get('timestamp', '')
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/model-info')
def model_info():
    return jsonify({
        'name': 'XDVioDet Pro',
        'version': '3.0 - YOLOv8',
        'detection_engine': 'YOLOv8 + Motion Analysis',
        'capabilities': [
            'Real-time object detection',
            'Fire/smoke detection',
            'Weapon detection',
            'Violence/fight detection',
            'Motion analysis'
        ],
        'supported_formats': list(ALLOWED_VIDEO_FORMATS),
        'supported_labels': list(VIOLENCE_LABELS.keys())
    })


@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'detector_loaded': detector is not None
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("  XDVioDet Pro - Violence & Hazard Detection System")
    print("  Powered by YOLOv8 + Motion Analysis")
    print("="*60)
    print("\nInitializing YOLOv8 detector...")
    
    if init_detector():
        print("\nDetector ready!")
        print("\nStarting Flask server...")
        print("Access the application at: http://localhost:5000")
        print("\nDetection capabilities:")
        print("   - Violence/Fighting detection")
        print("   - Fire/Flames detection")
        print("   - Weapon detection")
        print("   - Aggressive behavior detection")
        print("   - Motion anomaly detection")
        print("\nPress Ctrl+C to stop the server\n")
        
        app.run(
            debug=False,
            host='0.0.0.0',
            port=5000,
            use_reloader=False
        )
    else:
        print("\nFailed to initialize detector.")
        print("Please install required packages:")
        print("   pip install ultralytics opencv-python")
        exit(1)
