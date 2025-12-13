"""
YOLOv8 + TensorFlow Violence & Hazard Detection System
High-accuracy detection for fights, fire, weapons, and dangerous activities
"""

import cv2
import numpy as np
import torch
import logging
from pathlib import Path
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import ultralytics for YOLOv8
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    logger.warning("YOLOv8 not available. Install with: pip install ultralytics")

# Try to import tensorflow for activity recognition
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    logger.warning("TensorFlow not available. Install with: pip install tensorflow")


# Dangerous/Violence-related COCO classes that YOLO can detect
DANGEROUS_CLASSES = {
    # Weapons
    'knife': {'danger_level': 0.95, 'category': 'weapon'},
    'scissors': {'danger_level': 0.7, 'category': 'weapon'},
    
    # Fire-related (detected via color/motion analysis)
    'fire': {'danger_level': 0.99, 'category': 'fire'},
    'smoke': {'danger_level': 0.85, 'category': 'fire'},
    
    # Violence indicators
    'person': {'danger_level': 0.1, 'category': 'person'},  # Base, increases with activity
}

# Activity labels for violence classification
VIOLENCE_ACTIVITIES = [
    'Normal',
    'Fighting', 
    'Aggression',
    'Running/Panic',
    'Falling',
    'Weapon_Threat'
]


class ViolenceDetector:
    """
    Multi-modal violence and hazard detection using YOLOv8 and motion analysis
    """
    
    def __init__(self, confidence_threshold=0.5):
        self.confidence_threshold = confidence_threshold
        self.yolo_model = None
        self.previous_frame = None
        self.motion_history = []
        self.alert_cooldown = 0
        self.detection_history = []
        
        # Initialize YOLOv8
        self._init_yolo()
        
        # Fire detection parameters (HSV ranges for fire colors)
        self.fire_lower = np.array([0, 50, 200])
        self.fire_upper = np.array([35, 255, 255])
        
        # Smoke detection parameters (HSV ranges for smoke colors)
        self.smoke_lower = np.array([0, 0, 50])
        self.smoke_upper = np.array([180, 30, 200])
        
        logger.info("ViolenceDetector initialized")
    
    def _init_yolo(self):
        """Initialize YOLOv8 model"""
        if not YOLO_AVAILABLE:
            logger.warning("YOLOv8 not available, using fallback detection")
            return
        
        try:
            # Fix for PyTorch 2.6+ weights_only issue
            import torch
            original_load = torch.load
            def patched_load(*args, **kwargs):
                kwargs['weights_only'] = False
                return original_load(*args, **kwargs)
            torch.load = patched_load
            
            # Use YOLOv8n (nano) for speed
            self.yolo_model = YOLO('yolov8n.pt')
            
            # Restore original
            torch.load = original_load
            logger.info("YOLOv8 model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load YOLOv8: {e}")
            self.yolo_model = None
    
    def detect_fire(self, frame):
        """Detect fire using color analysis"""
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Fire color mask
        mask = cv2.inRange(hsv, self.fire_lower, self.fire_upper)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        fire_regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 500:  # Minimum area threshold
                x, y, w, h = cv2.boundingRect(contour)
                confidence = min(area / 10000, 0.99)  # Scale confidence by area
                fire_regions.append({
                    'bbox': [x, y, x+w, y+h],
                    'confidence': confidence,
                    'label': 'fire',
                    'category': 'fire'
                })
        
        return fire_regions
    
    def detect_smoke(self, frame):
        """Detect smoke using color analysis"""
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Smoke color mask (gray/black tones)
        smoke_lower = np.array([0, 0, 50])
        smoke_upper = np.array([180, 30, 200])
        mask = cv2.inRange(hsv, smoke_lower, smoke_upper)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        smoke_regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Larger area threshold for smoke
                x, y, w, h = cv2.boundingRect(contour)
                confidence = min(area / 20000, 0.85)  # Scale confidence by area
                smoke_regions.append({
                    'bbox': [x, y, x+w, y+h],
                    'confidence': confidence,
                    'label': 'smoke',
                    'category': 'fire'
                })
        
        return smoke_regions
    
    def detect_motion(self, frame):
        """Detect rapid motion (fighting, running)"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)
        
        motion_score = 0
        motion_regions = []
        
        if self.previous_frame is not None:
            # Frame difference
            diff = cv2.absdiff(self.previous_frame, gray)
            thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)[1]
            thresh = cv2.dilate(thresh, None, iterations=2)
            
            # Find motion contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            total_motion_area = 0
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 1000:
                    total_motion_area += area
                    x, y, w, h = cv2.boundingRect(contour)
                    motion_regions.append({
                        'bbox': [x, y, x+w, y+h],
                        'area': area
                    })
            
            # Calculate motion score
            frame_area = frame.shape[0] * frame.shape[1]
            motion_score = min(total_motion_area / frame_area * 5, 1.0)
        
        self.previous_frame = gray
        self.motion_history.append(motion_score)
        if len(self.motion_history) > 30:
            self.motion_history.pop(0)
        
        return motion_score, motion_regions
    
    def detect_objects(self, frame):
        """Detect objects using YOLOv8"""
        detections = []
        
        if self.yolo_model is None:
            return detections
        
        try:
            # Run YOLOv8 inference
            results = self.yolo_model(frame, verbose=False, conf=self.confidence_threshold)
            
            for result in results:
                boxes = result.boxes
                if boxes is None:
                    continue
                
                for box in boxes:
                    if box is None:
                        continue
                    
                    # Ensure required attributes exist
                    if box.cls is None or box.conf is None or box.xyxy is None:
                        continue
                    
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    xyxy = box.xyxy[0].cpu().numpy()
                    
                    # Get class name
                    if hasattr(self.yolo_model, 'names') and self.yolo_model.names:
                        class_name = self.yolo_model.names.get(cls_id, f'class_{cls_id}')
                    else:
                        class_name = f'class_{cls_id}'
                    
                    # Check if it's a dangerous object
                    danger_info = DANGEROUS_CLASSES.get(class_name, None)
                    
                    detections.append({
                        'bbox': [int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])],
                        'confidence': conf,
                        'label': class_name,
                        'class_id': cls_id,
                        'danger_info': danger_info
                    })
        
        except Exception as e:
            logger.error(f"YOLOv8 detection error: {e}")
        
        return detections
    
    def analyze_violence_indicators(self, frame, detections, motion_score, motion_regions):
        """Analyze all indicators to determine violence/hazard level"""
        try:
            violence_score = 0.0
            hazard_score = 0.0
            alerts = []
        
        # Check if frame is valid
        if frame is None:
            return {
                'violence_score': 0.0,
                'hazard_score': 0.0,
                'overall_danger': 0.0,
                'people_count': 0,
                'motion_score': 0.0,
                'alerts': [],
                'detections': []
            }
        
        # Ensure detections is a list
        if detections is None:
            detections = []
        
        # Filter out None detections to prevent errors
        detections = [d for d in detections if d is not None]
        
        # Count people
        people_count = sum(1 for d in detections if isinstance(d, dict) and d.get('label') == 'person')
        
        # Check for weapons
        weapons = [d for d in detections if isinstance(d, dict) and d.get('danger_info', {}).get('category') == 'weapon']
        if weapons:
            violence_score = max(violence_score, 0.9)
            for w in weapons:
                alerts.append({
                    'type': 'WEAPON_DETECTED',
                    'severity': 'critical',
                    'message': f"Weapon detected: {w.get('label', 'unknown')} ({w.get('confidence', 0):.0%})",
                    'bbox': w.get('bbox')
                })
        
        # Check for fire
        fire_detections = self.detect_fire(frame)
        if fire_detections:
                hazard_score = max(hazard_score, max(f.get('confidence', 0) for f in fire_detections if isinstance(f, dict)))
                for f in fire_detections:
                    if isinstance(f, dict):
                        alerts.append({
                            'type': 'FIRE_DETECTED',
                            'severity': 'critical',
                            'message': f"Fire/flames detected ({f.get('confidence', 0):.0%})",
                            'bbox': f.get('bbox')
                        })
            
            # Check for smoke
            smoke_detections = self.detect_smoke(frame)
            if smoke_detections:
                hazard_score = max(hazard_score, max(s.get('confidence', 0) for s in smoke_detections if isinstance(s, dict)))
                for s in smoke_detections:
                    if isinstance(s, dict):
                        alerts.append({
                            'type': 'SMOKE_DETECTED',
                            'severity': 'medium',
                            'message': f"Smoke detected ({s.get('confidence', 0):.0%})",
                            'bbox': s.get('bbox')
                        })
        
        # Analyze motion for fighting
        avg_motion = np.mean(self.motion_history) if self.motion_history else 0
        
        # High motion with multiple people = potential fight
        if people_count >= 2 and avg_motion > 0.3:
            fight_score = min(avg_motion * people_count * 0.5, 0.95)
            violence_score = max(violence_score, fight_score)
            
            if fight_score > 0.5:
                alerts.append({
                    'type': 'FIGHT_DETECTED',
                    'severity': 'high' if fight_score > 0.7 else 'medium',
                    'message': f"Possible fight/altercation detected ({fight_score:.0%})",
                    'bbox': None
                })
        
        # Sudden high motion = aggression/panic
        if len(self.motion_history) >= 5:
            recent_motion = np.mean(self.motion_history[-5:])
            older_motion = np.mean(self.motion_history[:-5]) if len(self.motion_history) > 5 else 0
            
            if recent_motion > older_motion * 2 and recent_motion > 0.4:
                aggression_score = min(recent_motion, 0.85)
                violence_score = max(violence_score, aggression_score)
                
                alerts.append({
                    'type': 'AGGRESSION_DETECTED',
                    'severity': 'medium',
                    'message': f"Sudden aggressive movement detected ({aggression_score:.0%})",
                    'bbox': None
                })
        
        # Combine scores
        overall_danger = max(violence_score, hazard_score)
        
        return {
            'violence_score': violence_score,
            'hazard_score': hazard_score,
            'overall_danger': overall_danger,
            'people_count': people_count,
            'motion_score': motion_score,
            'alerts': alerts,
            'detections': detections + fire_detections + smoke_detections
        }
        
        except Exception as e:
            logger.error(f"Error in analyze_violence_indicators: {e}")
            return {
                'violence_score': 0.0,
                'hazard_score': 0.0,
                'overall_danger': 0.0,
                'people_count': 0,
                'motion_score': 0.0,
                'alerts': [],
                'detections': []
            }
    
    def process_frame(self, frame):
        """Process a single frame for violence/hazard detection"""
        try:
            # Resize for faster processing
            process_frame = cv2.resize(frame, (640, 480))
            
            # Detect objects with YOLO
            detections = self.detect_objects(process_frame)
            
            # Detect motion
            motion_score, motion_regions = self.detect_motion(process_frame)
            
            # Analyze violence indicators
            analysis = self.analyze_violence_indicators(
                process_frame, detections, motion_score, motion_regions
            )
            
            # Scale bounding boxes back to original size
            scale_x = frame.shape[1] / 640
            scale_y = frame.shape[0] / 480
            
            for det in analysis['detections']:
                if det and det.get('bbox'):
                    det['bbox'] = [
                        int(det['bbox'][0] * scale_x),
                        int(det['bbox'][1] * scale_y),
                        int(det['bbox'][2] * scale_x),
                        int(det['bbox'][3] * scale_y)
                    ]
            
            for alert in analysis['alerts']:
                if alert and alert.get('bbox'):
                    alert['bbox'] = [
                        int(alert['bbox'][0] * scale_x),
                        int(alert['bbox'][1] * scale_y),
                        int(alert['bbox'][2] * scale_x),
                        int(alert['bbox'][3] * scale_y)
                    ]
            
            return analysis
        
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return {
                'violence_score': 0.0,
                'hazard_score': 0.0,
                'overall_danger': 0.0,
                'people_count': 0,
                'motion_score': 0.0,
                'alerts': [],
                'detections': []
            }
    
    def process_video(self, video_path, callback=None):
        """Process entire video and return frame-by-frame analysis"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        results = {
            'fps': fps,
            'total_frames': total_frames,
            'frame_analyses': [],
            'alerts': [],
            'max_violence_score': 0,
            'max_hazard_score': 0,
            'violence_detected': False,
            'hazard_detected': False
        }
        
        frame_idx = 0
        sample_rate = max(1, int(fps / 10))  # Process ~10 frames per second
        
        # Reset state
        self.previous_frame = None
        self.motion_history = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % sample_rate == 0:
                analysis = self.process_frame(frame)
                analysis['frame_idx'] = frame_idx
                analysis['timestamp'] = frame_idx / fps
                
                results['frame_analyses'].append(analysis)
                results['alerts'].extend(analysis['alerts'])
                
                results['max_violence_score'] = max(
                    results['max_violence_score'], 
                    analysis['violence_score']
                )
                results['max_hazard_score'] = max(
                    results['max_hazard_score'], 
                    analysis['hazard_score']
                )
                
                if callback:
                    callback(frame_idx, total_frames, analysis)
            
            frame_idx += 1
        
        cap.release()
        
        # Determine if violence/hazard was detected
        results['violence_detected'] = results['max_violence_score'] > 0.5
        results['hazard_detected'] = results['max_hazard_score'] > 0.5
        
        return results
    
    def draw_detections(self, frame, analysis):
        """Draw detection boxes and alerts on frame"""
        annotated = frame.copy()
        
        # Draw detection boxes
        for det in analysis.get('detections', []):
            bbox = det.get('bbox')
            if not bbox:
                continue
            
            label = det.get('label', 'unknown')
            conf = det.get('confidence', 0)
            
            # Color based on danger level
            if label in ['fire', 'smoke']:
                color = (0, 0, 255)  # Red for fire
            elif det.get('danger_info', {}).get('category') == 'weapon':
                color = (0, 0, 255)  # Red for weapons
            elif label == 'person':
                color = (0, 255, 0)  # Green for people
            else:
                color = (255, 255, 0)  # Cyan for others
            
            cv2.rectangle(annotated, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
            cv2.putText(annotated, f"{label} {conf:.0%}", 
                       (bbox[0], bbox[1] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Draw alerts
        y_offset = 30
        for alert in analysis.get('alerts', []):
            severity = alert.get('severity', 'low')
            color = (0, 0, 255) if severity == 'critical' else (0, 165, 255) if severity == 'high' else (0, 255, 255)
            
            cv2.putText(annotated, f"⚠ {alert['message']}", 
                       (10, y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            y_offset += 25
        
        # Draw overall status
        danger = analysis.get('overall_danger', 0)
        status_color = (0, 0, 255) if danger > 0.7 else (0, 165, 255) if danger > 0.4 else (0, 255, 0)
        status_text = f"Danger Level: {danger:.0%}"
        
        cv2.rectangle(annotated, (frame.shape[1] - 200, 10), (frame.shape[1] - 10, 40), status_color, -1)
        cv2.putText(annotated, status_text, 
                   (frame.shape[1] - 190, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        return annotated


# Global detector instance
_detector = None

def get_detector():
    """Get or create global detector instance"""
    global _detector
    if _detector is None:
        _detector = ViolenceDetector()
    return _detector


if __name__ == "__main__":
    # Test the detector
    detector = ViolenceDetector()
    
    # Test with webcam
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        analysis = detector.process_frame(frame)
        annotated = detector.draw_detections(frame, analysis)
        
        cv2.imshow("Violence Detection", annotated)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
