"""Authentication utilities and decorators."""
from functools import wraps
from flask import session, redirect, url_for, flash, request, jsonify
from bson import ObjectId


def login_required(f):
    """Decorator to require login for routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'error': 'Authentication required'}), 401
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """Decorator to require admin role for routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'error': 'Authentication required'}), 401
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login', next=request.url))
        
        if session.get('user_role') != 'admin':
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'error': 'Admin access required'}), 403
            flash('Admin access required.', 'danger')
            return redirect(url_for('index'))
        
        return f(*args, **kwargs)
    return decorated_function


def get_current_user(user_model):
    """Get current logged-in user."""
    if 'user_id' not in session:
        return None
    
    try:
        user_id = session['user_id']
        return user_model.get_user_by_id(user_id)
    except:
        return None


def is_authenticated():
    """Check if user is authenticated."""
    return 'user_id' in session


def is_admin():
    """Check if current user is admin."""
    return session.get('user_role') == 'admin'


def login_user(user):
    """Log in a user by setting session variables."""
    session['user_id'] = str(user['_id'])
    session['username'] = user['username']
    session['user_role'] = user['role']
    session.permanent = True


def logout_user():
    """Log out the current user."""
    session.clear()
