from flask import Flask, render_template, request, jsonify, send_from_directory, Response, session
from flask_cors import CORS
import numpy as np
import os
import logging
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'xdviodet-secret-key-change-in-production')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# MongoDB connection
try:
    mongo_uri = os.getenv('MONGODB_URI')
    if mongo_uri:
        mongo_client = MongoClient(mongo_uri)
        db = mongo_client['xdviodet']
        logger.info("MongoDB connected successfully")
    else:
        db = None
        logger.warning("MongoDB URI not found in .env file")
except Exception as e:
    db = None
    logger.error(f"MongoDB connection failed: {e}")

# Initialize models
from models.user import User
from models.detection_session import DetectionSession
from models.alert import Alert

# Initialize models with fallback to mocks
if db is not None:
    user_model = User(db)
    session_model = DetectionSession(db)
    alert_model = Alert(db)
else:
    logger.warning("MongoDB connection failed. Using MOCK models for demonstration.")
    from models.mock_models import MockUser, MockSession, MockAlert
    user_model = MockUser()
    session_model = MockSession()
    alert_model = MockAlert()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/live-detection')
def live_detection():
    return render_template('live-detection.html')

# Initialize authentication and admin routes
# Always initialize routes (using real or mock models)
from routes.auth_routes import init_auth_routes
from routes.admin_routes import init_admin_routes

init_auth_routes(app, user_model)
init_admin_routes(app, user_model, session_model, alert_model)
logger.info("Authentication and admin routes initialized")

# Register Camera Routes
from routes.camera_routes import camera_bp
from routes.video_routes import video_bp
from routes.api_routes import api_bp

app.register_blueprint(camera_bp)
app.register_blueprint(video_bp)
app.register_blueprint(api_bp)
logger.info("Camera, Video, and API routes registered")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)