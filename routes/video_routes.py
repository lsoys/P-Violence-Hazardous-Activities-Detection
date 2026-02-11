import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from detector import ViolenceDetector
import logging
import time

video_bp = Blueprint('video', __name__)
logger = logging.getLogger(__name__)

# Allowed extensions
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@video_bp.route('/api/upload-video', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"success": False, "error": "No video file provided"}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Ensure static/uploads directory exists
        upload_folder = os.path.join(current_app.static_folder, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        logger.info(f"Video uploaded: {filepath}")
        
        # Process video
        try:
            detector = ViolenceDetector()
            logger.info("Starting video analysis...")
            
            # Run processing
            results = detector.process_video(filepath)
            
            # Enhance results with file info
            results['filename'] = filename
            results['filepath'] = f"/static/uploads/{filename}"
            results['success'] = True
            
            logger.info("Video analysis completed")
            return jsonify(results)
            
        except Exception as e:
            logger.error(f"Error processing video: {e}")
            return jsonify({"success": False, "error": str(e)}), 500
            
    return jsonify({"success": False, "error": "Invalid file type"}), 400
