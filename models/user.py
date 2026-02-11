"""User model for authentication and authorization."""
from datetime import datetime
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash


class User:
    """User model with MongoDB integration."""
    
    def __init__(self, db):
        """Initialize User model with database connection."""
        self.collection = db['users']
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Create indexes for faster queries."""
        self.collection.create_index('username', unique=True)
        self.collection.create_index('email', unique=True)
    
    def create_user(self, username, email, password, role='user'):
        """
        Create a new user.
        
        Args:
            username: Unique username
            email: User email address
            password: Plain text password (will be hashed)
            role: User role ('user' or 'admin')
            
        Returns:
            User ID if successful, None if user exists
        """
        # Check if user already exists
        if self.collection.find_one({'$or': [{'username': username}, {'email': email}]}):
            return None
        
        user_data = {
            'username': username,
            'email': email,
            'password_hash': generate_password_hash(password),
            'role': role,
            'created_at': datetime.utcnow(),
            'last_login': None,
            'is_active': True,
            'detection_count': 0,
            'alert_count': 0
        }
        
        result = self.collection.insert_one(user_data)
        return str(result.inserted_id)
    
    def get_user_by_id(self, user_id):
        """Get user by ObjectId or string ID."""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            return self.collection.find_one({'_id': user_id})
        except:
            return None
    
    def get_user_by_username(self, username):
        """Get user by username."""
        return self.collection.find_one({'username': username})
    
    def get_user_by_email(self, email):
        """Get user by email."""
        return self.collection.find_one({'email': email})
    
    def verify_password(self, user, password):
        """Verify user password."""
        if not user:
            return False
        return check_password_hash(user.get('password_hash', ''), password)
    
    def update_last_login(self, user_id):
        """Update user's last login timestamp."""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            self.collection.update_one(
                {'_id': user_id},
                {'$set': {'last_login': datetime.utcnow()}}
            )
        except:
            pass
    
    def get_all_users(self, skip=0, limit=50):
        """Get all users with pagination."""
        users = list(self.collection.find().skip(skip).limit(limit).sort('created_at', -1))
        total = self.collection.count_documents({})
        return users, total
    
    def update_user(self, user_id, update_data):
        """Update user data."""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            # Don't allow password update through this method
            if 'password' in update_data:
                del update_data['password']
            if 'password_hash' in update_data:
                del update_data['password_hash']
            
            result = self.collection.update_one(
                {'_id': user_id},
                {'$set': update_data}
            )
            return result.modified_count > 0
        except:
            return False
    
    def delete_user(self, user_id):
        """Delete a user."""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            result = self.collection.delete_one({'_id': user_id})
            return result.deleted_count > 0
        except:
            return False
    
    def change_password(self, user_id, new_password):
        """Change user password."""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            password_hash = generate_password_hash(new_password)
            result = self.collection.update_one(
                {'_id': user_id},
                {'$set': {'password_hash': password_hash}}
            )
            return result.modified_count > 0
        except:
            return False
    
    def increment_detection_count(self, user_id):
        """Increment user's detection count."""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            self.collection.update_one(
                {'_id': user_id},
                {'$inc': {'detection_count': 1}}
            )
        except:
            pass
    
    def increment_alert_count(self, user_id):
        """Increment user's alert count."""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            self.collection.update_one(
                {'_id': user_id},
                {'$inc': {'alert_count': 1}}
            )
        except:
            pass
    
    def get_user_stats(self, user_id):
        """Get user statistics."""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            user = self.collection.find_one({'_id': user_id})
            if not user:
                return None
            
            return {
                'username': user.get('username'),
                'email': user.get('email'),
                'role': user.get('role'),
                'created_at': user.get('created_at'),
                'last_login': user.get('last_login'),
                'detection_count': user.get('detection_count', 0),
                'alert_count': user.get('alert_count', 0),
                'is_active': user.get('is_active', True)
            }
        except:
            return None
