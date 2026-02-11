"""Mock models for running without MongoDB connection."""
from datetime import datetime, timedelta
import uuid

class MockUser:
    """Mock User model."""
    
    def __init__(self, db=None):
        self.users = {
            '1': {
                '_id': '1',
                'username': 'admin',
                'email': 'admin@example.com',
                'password_hash': 'mock_hash',
                'role': 'admin',
                'created_at': datetime.utcnow(),
                'last_login': datetime.utcnow(),
                'is_active': True,
                'detection_count': 15,
                'alert_count': 5
            },
            '2': {
                '_id': '2',
                'username': 'user',
                'email': 'user@example.com',
                'password_hash': 'mock_hash',
                'role': 'user',
                'created_at': datetime.utcnow(),
                'last_login': datetime.utcnow(),
                'is_active': True,
                'detection_count': 3,
                'alert_count': 0
            }
        }
    
    def get_all_users(self, skip=0, limit=50):
        users_list = list(self.users.values())
        return users_list, len(users_list)
    
    def get_user_by_id(self, user_id):
        return self.users.get(str(user_id))
    
    def get_user_by_username(self, username):
        for user in self.users.values():
            if user['username'] == username:
                return user
        return None
    
    def get_user_by_email(self, email):
        for user in self.users.values():
            if user['email'] == email:
                return user
        return None
    
    def verify_password(self, user, password):
        return True  # Always allow login in mock mode
    
    def create_user(self, username, email, password, role='user'):
        user_id = str(len(self.users) + 1)
        self.users[user_id] = {
            '_id': user_id,
            'username': username,
            'email': email,
            'password_hash': 'mock_hash',
            'role': role,
            'created_at': datetime.utcnow(),
            'last_login': None,
            'is_active': True,
            'detection_count': 0,
            'alert_count': 0
        }
        return user_id
        
    def update_last_login(self, user_id):
        pass

    def update_user(self, user_id, update_data):
        if str(user_id) in self.users:
            self.users[str(user_id)].update(update_data)
            return True
        return False

    def delete_user(self, user_id):
        if str(user_id) in self.users:
            del self.users[str(user_id)]
            return True
        return False


class MockSession:
    """Mock DetectionSession model."""
    
    def __init__(self, db=None):
        self.sessions = {
            '1': {
                '_id': '1',
                'user_id': '1',
                'session_type': 'live_camera',
                'timestamp': datetime.utcnow() - timedelta(hours=2),
                'status': 'completed',
                'total_frames': 1500,
                'violence_frames': 50,
                'fire_frames': 0,
                'smoke_frames': 0,
                'weapon_count': 1,
                'fight_count': 1,
                'max_danger_level': 0.85,
                'alerts_detail': []
            }
        }
    
    def get_statistics(self):
        return {
            'total_sessions': len(self.sessions),
            'active_sessions': 0,
            'completed_sessions': len(self.sessions),
            'total_frames': 1500,
            'violence_frames': 50,
            'fire_frames': 0,
            'weapon_count': 1,
            'fight_count': 1
        }
        
    def get_all_sessions(self, skip=0, limit=50):
        return list(self.sessions.values()), len(self.sessions)
        
    def get_user_sessions(self, user_id, skip=0, limit=20):
        user_sessions = [s for s in self.sessions.values() if s['user_id'] == str(user_id)]
        return user_sessions, len(user_sessions)
        
    def get_session(self, session_id):
        return self.sessions.get(str(session_id))
        
    def create_session(self, user_id, session_type, video_filename=None):
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            '_id': session_id,
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
            'detections': []
        }
        return session_id
        
    def update_session(self, session_id, update_data):
        if str(session_id) in self.sessions:
            self.sessions[str(session_id)].update(update_data)
            return True
        return False
        
    def add_detection(self, session_id, detection_data):
        return True
        
    def end_session(self, session_id, final_stats):
        if str(session_id) in self.sessions:
            self.sessions[str(session_id)].update(final_stats)
            self.sessions[str(session_id)]['status'] = 'completed'
            return True
        return False

    def delete_session(self, session_id):
        if str(session_id) in self.sessions:
            del self.sessions[str(session_id)]
            return True
        return False
        
    def get_sessions_by_type(self, session_type, skip=0, limit=50):
        type_sessions = [s for s in self.sessions.values() if s['session_type'] == session_type]
        return type_sessions, len(type_sessions)


class MockAlert:
    """Mock Alert model."""
    
    def __init__(self, db=None):
        self.alerts = {
            '1': {
                '_id': '1',
                'session_id': '1',
                'user_id': '1',
                'alert_type': 'violence',
                'severity': 'high',
                'message': 'Violence detected',
                'confidence': 0.85,
                'timestamp': datetime.utcnow() - timedelta(hours=2),
                'is_acknowledged': False
            }
        }
        
    def get_statistics(self):
        return {
            'total_alerts': len(self.alerts),
            'unacknowledged': 1,
            'by_severity': {'critical': 0, 'high': 1, 'medium': 0, 'low': 0},
            'by_type': {'violence': 1, 'fire': 0, 'smoke': 0, 'weapon': 0, 'fight': 0}
        }
        
    def get_recent_alerts(self, hours=24, limit=100):
        return list(self.alerts.values())
        
    def get_all_alerts(self, skip=0, limit=100):
        return list(self.alerts.values()), len(self.alerts)
        
    def get_user_alerts(self, user_id, skip=0, limit=50):
        user_alerts = [a for a in self.alerts.values() if a['user_id'] == str(user_id)]
        return user_alerts, len(user_alerts)
        
    def get_session_alerts(self, session_id, skip=0, limit=50):
        session_alerts = [a for a in self.alerts.values() if a['session_id'] == str(session_id)]
        return session_alerts, len(session_alerts)
        
    def create_alert(self, session_id, user_id, alert_type, severity, message, confidence=0.0, metadata=None):
        alert_id = str(uuid.uuid4())
        self.alerts[alert_id] = {
            '_id': alert_id,
            'session_id': str(session_id),
            'user_id': str(user_id),
            'alert_type': alert_type,
            'severity': severity,
            'message': message,
            'confidence': confidence,
            'metadata': metadata or {},
            'timestamp': datetime.utcnow(),
            'is_acknowledged': False
        }
        return alert_id
        
    def get_unacknowledged_alerts(self, skip=0, limit=50):
        unack = [a for a in self.alerts.values() if not a['is_acknowledged']]
        return unack, len(unack)
        
    def get_alerts_by_severity(self, severity, skip=0, limit=50):
        alerts = [a for a in self.alerts.values() if a['severity'] == severity]
        return alerts, len(alerts)
        
    def get_alerts_by_type(self, alert_type, skip=0, limit=50):
        alerts = [a for a in self.alerts.values() if a['alert_type'] == alert_type]
        return alerts, len(alerts)
        
    def acknowledge_alert(self, alert_id, admin_id):
        if str(alert_id) in self.alerts:
            self.alerts[str(alert_id)]['is_acknowledged'] = True
            return True
        return False
        
    def delete_alert(self, alert_id):
        if str(alert_id) in self.alerts:
            del self.alerts[str(alert_id)]
            return True
        return False
