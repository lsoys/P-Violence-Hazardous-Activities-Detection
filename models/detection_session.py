"""Detection session model for storing analysis results."""
from datetime import datetime
from bson import ObjectId


class DetectionSession:
    """Model for storing video detection sessions."""
    
    def __init__(self, db):
        """Initialize DetectionSession model with database connection."""
        self.collection = db['detection_sessions']
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Create indexes for faster queries."""
        self.collection.create_index('user_id')
        self.collection.create_index('timestamp')
        self.collection.create_index('session_type')
    
    def create_session(self, user_id, session_type, video_filename=None):
        """
        Create a new detection session.
        
        Args:
            user_id: ID of the user who initiated the session
            session_type: Type of session ('video_upload' or 'live_camera')
            video_filename: Original filename (for video uploads)
            
        Returns:
            Session ID
        """
        session_data = {
            'user_id': str(user_id),
            'session_type': session_type,
            'video_filename': video_filename,
            'timestamp': datetime.utcnow(),
            'status': 'active',
            'total_frames': 0,
            'violence_frames': 0,
            'fire_frames': 0,
            'smoke_frames': 0,
            'weapon_count': 0,
            'fight_count': 0,
            'max_danger_level': 0,
            'avg_violence_score': 0.0,
            'avg_hazard_score': 0.0,
            'alerts': [],
            'detections': [],
            'ended_at': None
        }
        
        result = self.collection.insert_one(session_data)
        return str(result.inserted_id)
    
    def update_session(self, session_id, update_data):
        """Update session with new analysis results."""
        try:
            if isinstance(session_id, str):
                session_id = ObjectId(session_id)
            
            result = self.collection.update_one(
                {'_id': session_id},
                {'$set': update_data}
            )
            return result.modified_count > 0
        except:
            return False
    
    def add_detection(self, session_id, detection_data):
        """Add a detection result to session."""
        try:
            if isinstance(session_id, str):
                session_id = ObjectId(session_id)
            
            result = self.collection.update_one(
                {'_id': session_id},
                {
                    '$push': {'detections': detection_data},
                    '$inc': {'total_frames': 1}
                }
            )
            return result.modified_count > 0
        except:
            return False
    
    def end_session(self, session_id, final_stats):
        """End a session and store final statistics."""
        try:
            if isinstance(session_id, str):
                session_id = ObjectId(session_id)
            
            final_stats['status'] = 'completed'
            final_stats['ended_at'] = datetime.utcnow()
            
            result = self.collection.update_one(
                {'_id': session_id},
                {'$set': final_stats}
            )
            return result.modified_count > 0
        except:
            return False
    
    def get_session(self, session_id):
        """Get session by ID."""
        try:
            if isinstance(session_id, str):
                session_id = ObjectId(session_id)
            return self.collection.find_one({'_id': session_id})
        except:
            return None
    
    def get_user_sessions(self, user_id, skip=0, limit=20):
        """Get all sessions for a user with pagination."""
        sessions = list(
            self.collection.find({'user_id': str(user_id)})
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({'user_id': str(user_id)})
        return sessions, total
    
    def get_all_sessions(self, skip=0, limit=50):
        """Get all sessions with pagination (admin)."""
        sessions = list(
            self.collection.find()
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({})
        return sessions, total
    
    def get_active_sessions(self):
        """Get all active sessions."""
        return list(self.collection.find({'status': 'active'}).sort('timestamp', -1))
    
    def get_sessions_by_type(self, session_type, skip=0, limit=50):
        """Get sessions by type."""
        sessions = list(
            self.collection.find({'session_type': session_type})
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({'session_type': session_type})
        return sessions, total
    
    def get_sessions_with_violence(self, skip=0, limit=50):
        """Get sessions that detected violence."""
        sessions = list(
            self.collection.find({'violence_frames': {'$gt': 0}})
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({'violence_frames': {'$gt': 0}})
        return sessions, total
    
    def delete_session(self, session_id):
        """Delete a session."""
        try:
            if isinstance(session_id, str):
                session_id = ObjectId(session_id)
            result = self.collection.delete_one({'_id': session_id})
            return result.deleted_count > 0
        except:
            return False
    
    def get_statistics(self):
        """Get overall statistics for admin dashboard."""
        total_sessions = self.collection.count_documents({})
        active_sessions = self.collection.count_documents({'status': 'active'})
        completed_sessions = self.collection.count_documents({'status': 'completed'})
        
        # Aggregate statistics
        pipeline = [
            {
                '$group': {
                    '_id': None,
                    'total_frames': {'$sum': '$total_frames'},
                    'violence_frames': {'$sum': '$violence_frames'},
                    'fire_frames': {'$sum': '$fire_frames'},
                    'weapon_count': {'$sum': '$weapon_count'},
                    'fight_count': {'$sum': '$fight_count'}
                }
            }
        ]
        
        agg_result = list(self.collection.aggregate(pipeline))
        agg_data = agg_result[0] if agg_result else {}
        
        return {
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
            'completed_sessions': completed_sessions,
            'total_frames': agg_data.get('total_frames', 0),
            'violence_frames': agg_data.get('violence_frames', 0),
            'fire_frames': agg_data.get('fire_frames', 0),
            'weapon_count': agg_data.get('weapon_count', 0),
            'fight_count': agg_data.get('fight_count', 0)
        }
