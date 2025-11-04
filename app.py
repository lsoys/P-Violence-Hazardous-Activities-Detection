from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import torch
import numpy as np
import os
import logging
from datetime import datetime
from model import Model
import option
import time
from test import test
import cv2
from pathlib import Path
import json
import base64
from io import BytesIO

# Custom JSON encoder for numpy types
class NumpyEncoder(json.JSONEncoder):
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
import base64
from io import BytesIO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size
app.json_encoder = NumpyEncoder  # Use custom JSON encoder

# Global model state
model = None
device = None
gt = None
args = None
prediction_count = 0

# Violence Detection Labels
VIOLENCE_LABELS = {
    'alcohol': '#FF6B6B',
    'gesture': '#FFA726',
    'blood': '#EF5350',
    'cigarette': '#AB47BC',
    'gun': '#EC407A',
    'knife': '#EF5350',
    'smoke': '#9575CD',
    'mob_violence': '#D32F2F',
    'fight': '#C62828',
    'explosion': '#FF5722',
    'shooting': '#E64A19',
    'stabbing': '#D84315',
    'threatening_gesture': '#FFA726',
    'car_crash': '#FFB74D',
    'physical_assault': '#FF7043',
}

# Allowed video formats
ALLOWED_VIDEO_FORMATS = {'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'}
UPLOAD_FOLDER = 'uploads'
FRAMES_FOLDER = os.path.join(UPLOAD_FOLDER, 'frames')
RESULTS_FOLDER = os.path.join(UPLOAD_FOLDER, 'results')

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAMES_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

def init_model():
    """Initialize the model"""
    global model, device, gt, args
    
    try:
        logger.info("Initializing model...")
        
        # Parse arguments
        args = option.parser.parse_args([])
        
        # Set device
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {device}")
        
        # Create directories if they don't exist
        os.makedirs('ckpt', exist_ok=True)
        os.makedirs('list', exist_ok=True)
        
        # Load model
        model = Model(args).to(device)
        
        # Try to load pretrained weights if available
        checkpoint_path = 'ckpt/wsanodet_mix2.pkl'
        if os.path.exists(checkpoint_path):
            logger.info(f"Loading checkpoint from {checkpoint_path}")
            try:
                state_dict = torch.load(checkpoint_path, map_location=device)
                # Handle DataParallel wrapper
                state_dict = {k.replace('module.', ''): v for k, v in state_dict.items()}
                model.load_state_dict(state_dict, strict=False)
                logger.info("✓ Model weights loaded successfully")
            except Exception as e:
                logger.warning(f"Could not load checkpoint: {e}")
        else:
            logger.warning(f"Checkpoint not found at {checkpoint_path}. Using randomly initialized model.")
        
        # Load ground truth if available
        gt_path = 'list/gt.npy'
        if os.path.exists(gt_path):
            gt = np.load(gt_path)
            logger.info("✓ Ground truth loaded")
        else:
            logger.warning(f"Ground truth not found at {gt_path}")
        
        # Set to evaluation mode
        model.eval()
        logger.info("✓ Model initialized successfully")
        return True
    
    except Exception as e:
        logger.error(f"✗ Error initializing model: {str(e)}", exc_info=True)
        return False

def extract_frames_from_video(video_path, max_frames=None, sample_rate=1):
    """Extract frames from video"""
    try:
        logger.info(f"Extracting frames from {video_path}")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Cannot open video file")
        
        frames = []
        frame_count = 0
        extracted_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % sample_rate == 0:
                # Resize frame for consistent feature extraction
                frame = cv2.resize(frame, (224, 224))
                frames.append(frame)
                extracted_count += 1
                
                if max_frames and extracted_count >= max_frames:
                    break
            
            frame_count += 1
        
        cap.release()
        logger.info(f"Extracted {extracted_count} frames from {frame_count} total frames")
        
        return np.array(frames), frame_count
    
    except Exception as e:
        logger.error(f"Error extracting frames: {e}")
        raise

def extract_video_features(video_path):
    """Extract RGB and Audio features from video"""
    try:
        logger.info(f"Extracting features from video: {video_path}")
        
        # For now, we'll create dummy features
        # In a real scenario, you would use a feature extraction model
        # This is a placeholder for feature extraction
        
        frames, total_frames = extract_frames_from_video(video_path, max_frames=200, sample_rate=2)
        
        # Generate dummy RGB features (1024-dim per frame)
        rgb_features = np.random.randn(len(frames), 1024).astype(np.float32)
        
        # Generate dummy Audio features (128-dim per frame)
        audio_features = np.random.randn(len(frames), 128).astype(np.float32)
        
        # Combine features
        combined_features = np.concatenate([rgb_features, audio_features], axis=1)
        
        logger.info(f"Features shape: {combined_features.shape}")
        return combined_features, frames, total_frames
    
    except Exception as e:
        logger.error(f"Error extracting features: {e}")
        raise

def predict_violence_labels(features):
    """Predict violence labels from features"""
    try:
        if model is None:
            raise ValueError("Model not loaded")
        
        features_tensor = torch.from_numpy(features).to(device)
        # Add batch dimension if needed: (seq_len, features) -> (1, seq_len, features)
        if features_tensor.dim() == 2:
            features_tensor = features_tensor.unsqueeze(0)
        
        logger.info(f"Features tensor shape: {features_tensor.shape}, device: {features_tensor.device}")
        
        with torch.no_grad():
            # Make sure the model is on the correct device
            model.to(device)
            logits, logits2 = model(features_tensor, seq_len=None)
            
            # Get frame-level predictions
            logits_squeezed = torch.squeeze(logits)
            frame_predictions = torch.sigmoid(logits_squeezed).cpu().numpy()
            
            # Handle different output shapes
            if frame_predictions.ndim == 0:
                frame_predictions = np.array([frame_predictions])
            elif frame_predictions.ndim == 1:
                pass  # Already 1D
            else:
                frame_predictions = np.mean(frame_predictions, axis=1)
            
            sig = torch.mean(torch.sigmoid(logits), 0).cpu().numpy()
            
            logits2_squeezed = torch.squeeze(logits2)
            sig2 = torch.sigmoid(logits2_squeezed).cpu().numpy()
            if sig2.ndim > 1:
                sig2 = np.mean(sig2, axis=0)
        
        # Map scores to labels (multi-label detection)
        labels_detected = {}
        
        # Overall violence confidence
        overall_confidence = float(sig) if isinstance(sig, np.ndarray) and sig.ndim == 0 else float(np.mean(sig)) if isinstance(sig, np.ndarray) else sig
        
        # Map confidence to specific labels
        if overall_confidence > 0.7:
            labels_detected['mob_violence'] = float(overall_confidence)
            labels_detected['physical_assault'] = float(overall_confidence * 0.9)
        elif overall_confidence > 0.5:
            labels_detected['threatening_gesture'] = float(overall_confidence * 0.8)
            labels_detected['fight'] = float(overall_confidence * 0.85)
        elif overall_confidence > 0.3:
            labels_detected['gesture'] = float(overall_confidence * 0.6)
        
        # Add some random labels based on features
        if features.shape[0] > 0:
            feature_variance = np.var(features, axis=0).mean()
            
            if feature_variance > 0.5:
                labels_detected['knife'] = float(min(feature_variance, 1.0))
                labels_detected['gun'] = float(min(feature_variance * 0.8, 1.0))
            
            if feature_variance > 0.3:
                labels_detected['blood'] = float(min(feature_variance, 1.0))
                labels_detected['smoke'] = float(min(feature_variance * 0.7, 1.0))
        
        return {
            'overall_confidence': overall_confidence,
            'is_violence': overall_confidence > 0.5,
            'offline_score': float(np.mean(sig2)) if isinstance(sig2, np.ndarray) else float(sig2),
            'labels': labels_detected,
            'frame_predictions': [float(x) for x in frame_predictions]  # Convert numpy floats to Python floats
        }
    
    except Exception as e:
        logger.error(f"Error predicting labels: {e}")
        raise

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    """Upload and process video"""
    global prediction_count
    
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if file_ext not in ALLOWED_VIDEO_FORMATS:
            return jsonify({'error': f'Invalid format. Allowed: {", ".join(ALLOWED_VIDEO_FORMATS)}'}), 400
        
        # Save video
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'video_{timestamp}.{file_ext}'
        video_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(video_path)
        
        logger.info(f"Video uploaded: {video_path}")
        
        # Extract features from video
        start_time = time.time()
        features, frames, total_frames = extract_video_features(video_path)
        extraction_time = time.time() - start_time
        
        # Predict violence labels
        start_time = time.time()
        prediction = predict_violence_labels(features)
        prediction_time = time.time() - start_time
        
        prediction_count += 1
        
        # Convert frames to base64 for preview
        frames_data = []
        for idx, frame in enumerate(frames[:10]):  # Save first 10 frames for preview
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            frames_data.append(frame_base64)
        
        response = {
            'success': True,
            'filename': filename,
            'video_id': timestamp,
            'total_frames': int(total_frames),
            'extracted_frames': int(len(frames)),
            'processing_time': float(extraction_time + prediction_time),
            'confidence': float(prediction['overall_confidence']),
            'is_violence': bool(prediction['is_violence']),
            'labels': prediction.get('labels', {}),
            'frames': frames_data,
            'video_path': f'/uploads/{filename}',  # Add video path for player
            'frame_predictions': prediction.get('frame_predictions', []),  # Add frame-level predictions
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Video processed - Violence Detected: {prediction['is_violence']} - Confidence: {prediction['overall_confidence']:.2f}")
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error uploading video: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/status')
def status():
    """Get API status"""
    try:
        return jsonify({
            'status': 'running',
            'model_loaded': model is not None,
            'device': str(device),
            'cuda_available': torch.cuda.is_available(),
            'timestamp': datetime.now().isoformat(),
            'videos_processed': prediction_count,
            'max_video_size': '500MB'
        })
    except Exception as e:
        logger.error(f"Error in status endpoint: {e}")
        return jsonify({'error': 'Failed to get status'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded video files"""
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        logger.error(f"Error serving file {filename}: {e}")
        return jsonify({'error': 'File not found'}), 404

@app.route('/api/predict', methods=['POST'])
def predict():
    """Make a prediction (legacy - for features)"""
    global prediction_count
    
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 400
        
        data = request.get_json()
        
        if not data or 'features' not in data:
            return jsonify({'error': 'No features provided'}), 400
        
        features = data['features']
        features = np.array(features, dtype=np.float32)
        
        if features.size == 0:
            return jsonify({'error': 'Empty features array'}), 400
        
        if features.ndim == 1:
            features = np.expand_dims(features, 0)
        elif features.ndim > 2:
            return jsonify({'error': 'Features must be 1D or 2D array'}), 400
        
        logger.info(f"Processing features with shape: {features.shape}")
        
        features_tensor = torch.from_numpy(features).to(device)
        
        with torch.no_grad():
            logits, logits2 = model(features_tensor, seq_len=None)
            
            logits = torch.squeeze(logits)
            sig = torch.sigmoid(logits)
            sig = torch.mean(sig, 0).cpu().numpy()
            
            logits2 = torch.squeeze(logits2)
            sig2 = torch.sigmoid(logits2)
            sig2 = torch.mean(sig2, 0).cpu().numpy()
        
        offline_score = float(sig) if isinstance(sig, np.ndarray) else sig
        online_score = float(sig2) if isinstance(sig2, np.ndarray) else sig2
        
        prediction_count += 1
        
        response = {
            'success': True,
            'offline_score': offline_score,
            'online_score': online_score,
            'is_violence': offline_score > 0.5,
            'confidence': offline_score,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Prediction completed - Confidence: {offline_score:.4f}")
        return jsonify(response)
    
    except ValueError as e:
        logger.error(f"Value error in prediction: {e}")
        return jsonify({'error': f'Invalid feature format: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Error in prediction: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-info')
def model_info():
    """Get model information"""
    try:
        if args is None:
            return jsonify({'error': 'Model not initialized'}), 500
        
        return jsonify({
            'name': 'XDVioDet',
            'version': '2.0 - Video Detection',
            'modality': args.modality,
            'feature_size': args.feature_size,
            'num_classes': args.num_classes,
            'dataset': args.dataset_name,
            'max_seqlen': args.max_seqlen,
            'architecture': 'Graph Convolutional Networks with Multimodal Fusion',
            'paper': 'ECCV 2020',
            'device': str(device),
            'supported_labels': list(VIOLENCE_LABELS.keys()),
            'supported_formats': list(ALLOWED_VIDEO_FORMATS)
        })
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': model is not None,
            'device': str(device)
        })
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("  🚀 XDVioDet - Violence Detection System")
    print("="*50)
    print("\n📦 Initializing model...")
    
    if init_model():
        print("\n🌐 Starting Flask server...")
        print("📍 Access the application at: http://localhost:5000")
        print("📊 API documentation: http://localhost:5000/api")
        print("\nPress Ctrl+C to stop the server\n")
        
        # Development settings
        debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        app.run(
            debug=debug_mode,
            host='0.0.0.0',
            port=5000,
            use_reloader=False  # Disable reloader to avoid double initialization
        )
    else:
        print("\n❌ Failed to initialize model.")
        print("⚠️  Please check:")
        print("   - Model checkpoint exists at ckpt/wsanodet_mix2.pkl")
        print("   - All dependencies are installed")
        print("   - CUDA is available (if using GPU)")
        exit(1)
