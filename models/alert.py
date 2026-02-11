"""Alert model for storing detection alerts."""
from datetime import datetime
from bson import ObjectId


class Alert:
    """Model for storing detection alerts."""
    
    def __init__(self, db):
        """Initialize Alert model with database connection."""
        self.collection = db['alerts']
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Create indexes for faster queries."""
        self.collection.create_index('session_id')
        self.collection.create_index('user_id')
        self.collection.create_index('timestamp')
        self.collection.create_index('severity')
        self.collection.create_index('alert_type')
    
    def create_alert(self, session_id, user_id, alert_type, severity, message, confidence=0.0, metadata=None):
        """
        Create a new alert.
        
        Args:
            session_id: ID of the detection session
            user_id: ID of the user
            alert_type: Type of alert ('violence', 'fire', 'smoke', 'weapon', 'fight')
            severity: Alert severity ('low', 'medium', 'high', 'critical')
            message: Alert message
            confidence: Detection confidence score
            metadata: Additional metadata (coordinates, frame info, etc.)
            
        Returns:
            Alert ID
        """
        alert_data = {
            'session_id': str(session_id),
            'user_id': str(user_id),
            'alert_type': alert_type,
            'severity': severity,
            'message': message,
            'confidence': confidence,
            'metadata': metadata or {},
            'timestamp': datetime.utcnow(),
            'is_acknowledged': False,
            'acknowledged_at': None,
            'acknowledged_by': None
        }
        
        result = self.collection.insert_one(alert_data)
        return str(result.inserted_id)
    
    def get_alert(self, alert_id):
        """Get alert by ID."""
        try:
            if isinstance(alert_id, str):
                alert_id = ObjectId(alert_id)
            return self.collection.find_one({'_id': alert_id})
        except:
            return None
    
    def get_session_alerts(self, session_id, skip=0, limit=50):
        """Get all alerts for a session."""
        alerts = list(
            self.collection.find({'session_id': str(session_id)})
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({'session_id': str(session_id)})
        return alerts, total
    
    def get_user_alerts(self, user_id, skip=0, limit=50):
        """Get all alerts for a user."""
        alerts = list(
            self.collection.find({'user_id': str(user_id)})
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({'user_id': str(user_id)})
        return alerts, total
    
    def get_all_alerts(self, skip=0, limit=100):
        """Get all alerts with pagination (admin)."""
        alerts = list(
            self.collection.find()
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({})
        return alerts, total
    
    def get_alerts_by_severity(self, severity, skip=0, limit=50):
        """Get alerts by severity level."""
        alerts = list(
            self.collection.find({'severity': severity})
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({'severity': severity})
        return alerts, total
    
    def get_alerts_by_type(self, alert_type, skip=0, limit=50):
        """Get alerts by type."""
        alerts = list(
            self.collection.find({'alert_type': alert_type})
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({'alert_type': alert_type})
        return alerts, total
    
    def get_unacknowledged_alerts(self, skip=0, limit=50):
        """Get unacknowledged alerts."""
        alerts = list(
            self.collection.find({'is_acknowledged': False})
            .skip(skip)
            .limit(limit)
            .sort('timestamp', -1)
        )
        total = self.collection.count_documents({'is_acknowledged': False})
        return alerts, total
    
    def acknowledge_alert(self, alert_id, acknowledged_by):
        """Acknowledge an alert."""
        try:
            if isinstance(alert_id, str):
                alert_id = ObjectId(alert_id)
            
            result = self.collection.update_one(
                {'_id': alert_id},
                {
                    '$set': {
                        'is_acknowledged': True,
                        'acknowledged_at': datetime.utcnow(),
                        'acknowledged_by': str(acknowledged_by)
                    }
                }
            )
            return result.modified_count > 0
        except:
            return False
    
    def delete_alert(self, alert_id):
        """Delete an alert."""
        try:
            if isinstance(alert_id, str):
                alert_id = ObjectId(alert_id)
            result = self.collection.delete_one({'_id': alert_id})
            return result.deleted_count > 0
        except:
            return False
    
    def get_recent_alerts(self, hours=24, limit=100):
        """Get recent alerts within specified hours."""
        from datetime import timedelta
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        alerts = list(
            self.collection.find({'timestamp': {'$gte': cutoff_time}})
            .limit(limit)
            .sort('timestamp', -1)
        )
        return alerts
    
    def get_statistics(self):
        """Get alert statistics for dashboard."""
        total_alerts = self.collection.count_documents({})
        unacknowledged = self.collection.count_documents({'is_acknowledged': False})
        
        # Count by severity
        critical = self.collection.count_documents({'severity': 'critical'})
        high = self.collection.count_documents({'severity': 'high'})
        medium = self.collection.count_documents({'severity': 'medium'})
        low = self.collection.count_documents({'severity': 'low'})
        
        # Count by type
        violence = self.collection.count_documents({'alert_type': 'violence'})
        fire = self.collection.count_documents({'alert_type': 'fire'})
        smoke = self.collection.count_documents({'alert_type': 'smoke'})
        weapon = self.collection.count_documents({'alert_type': 'weapon'})
        fight = self.collection.count_documents({'alert_type': 'fight'})
        
        return {
            'total_alerts': total_alerts,
            'unacknowledged': unacknowledged,
            'by_severity': {
                'critical': critical,
                'high': high,
                'medium': medium,
                'low': low
            },
            'by_type': {
                'violence': violence,
                'fire': fire,
                'smoke': smoke,
                'weapon': weapon,
                'fight': fight
            }
        }
