"""Admin routes for user management and analytics."""
<<<<<<< HEAD
import os
from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for, send_from_directory
=======
from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
>>>>>>> uploaded
from auth.decorators import admin_required
from bson import ObjectId
from datetime import datetime, timedelta

<<<<<<< HEAD
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# Constants for evidence storage
UPLOAD_FOLDER = 'uploads/violence_events'
=======

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

>>>>>>> uploaded

def init_admin_routes(app, user_model, session_model, alert_model):
    """Initialize admin routes with models."""
    
    @admin_bp.route('/dashboard')
    @admin_required
    def dashboard():
        """Admin dashboard main page."""
        return render_template('admin/dashboard.html')
    
<<<<<<< HEAD
    @admin_bp.route('/detections')
    @admin_required
    def detections():
        """List saved detections/evidence."""
        detections_list = []
        if os.path.exists(UPLOAD_FOLDER):
            # Only look for image files as primary evidence
            files = [f for f in os.listdir(UPLOAD_FOLDER) if f.startswith('event_') and f.endswith('.jpg')]
            for f in sorted(files, reverse=True):
                timestamp_str = f.replace('event_', '').replace('.jpg', '')
                try:
                    dt = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                    formatted_time = dt.strftime("%Y-%m-%d %H:%M:%S")
                except:
                    formatted_time = "Unknown"
                
                detections_list.append({
                    'filename': f,
                    'timestamp': formatted_time,
                    'raw_timestamp': timestamp_str
                })
        return render_template('admin/detections.html', detections=detections_list)

    @admin_bp.route('/docs')
    @admin_required
    def docs():
        """Documentation page."""
        return render_template('admin/docs.html')

    @admin_bp.route('/evidence/<filename>')
    @admin_required
    def serve_evidence(filename):
        """Serve evidence files."""
        return send_from_directory(UPLOAD_FOLDER, filename)
    
=======
>>>>>>> uploaded
    @admin_bp.route('/api/stats')
    @admin_required
    def get_stats():
        """Get overall statistics for dashboard."""
        # User statistics
        users, total_users = user_model.get_all_users(limit=0)
        active_users = sum(1 for u in users if u.get('is_active', True))
        admin_count = sum(1 for u in users if u.get('role') == 'admin')
        
        # Session statistics
        session_stats = session_model.get_statistics()
        
        # Alert statistics
        alert_stats = alert_model.get_statistics()
        
        # Recent activity (last 24 hours)
        recent_sessions = session_model.get_all_sessions(limit=10)[0]
        recent_alerts = alert_model.get_recent_alerts(hours=24, limit=10)
        
        return jsonify({
            'users': {
                'total': len(users),
                'active': active_users,
                'inactive': len(users) - active_users,
                'admins': admin_count
            },
            'sessions': session_stats,
            'alerts': alert_stats,
            'recent_activity': {
                'sessions': len(recent_sessions),
                'alerts': len(recent_alerts)
            }
        })
    
    @admin_bp.route('/api/users')
    @admin_required
    def get_users():
        """Get all users with pagination."""
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        skip = (page - 1) * limit
        
        users, total = user_model.get_all_users(skip=skip, limit=limit)
        
        # Convert ObjectId to string
        for user in users:
            user['_id'] = str(user['_id'])
            # Remove password hash
            user.pop('password_hash', None)
        
        return jsonify({
            'users': users,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
    
    @admin_bp.route('/api/users/<user_id>', methods=['GET'])
    @admin_required
    def get_user(user_id):
        """Get specific user details."""
        user = user_model.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user['_id'] = str(user['_id'])
        user.pop('password_hash', None)
        
        # Get user's sessions
        sessions, session_total = session_model.get_user_sessions(user_id, limit=10)
        for session in sessions:
            session['_id'] = str(session['_id'])
        
        # Get user's alerts
        alerts, alert_total = alert_model.get_user_alerts(user_id, limit=10)
        for alert in alerts:
            alert['_id'] = str(alert['_id'])
        
        return jsonify({
            'user': user,
            'sessions': {
                'data': sessions,
                'total': session_total
            },
            'alerts': {
                'data': alerts,
                'total': alert_total
            }
        })
    
    @admin_bp.route('/api/users/<user_id>', methods=['PUT'])
    @admin_required
    def update_user(user_id):
        """Update user information."""
        data = request.get_json()
        
        allowed_fields = ['email', 'role', 'is_active']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        success = user_model.update_user(user_id, update_data)
        
        if success:
            return jsonify({'message': 'User updated successfully'})
        else:
            return jsonify({'error': 'Failed to update user'}), 500
    
    @admin_bp.route('/api/users/<user_id>', methods=['DELETE'])
    @admin_required
    def delete_user(user_id):
        """Delete a user."""
        success = user_model.delete_user(user_id)
        
        if success:
            return jsonify({'message': 'User deleted successfully'})
        else:
            return jsonify({'error': 'Failed to delete user'}), 500
    
    @admin_bp.route('/api/sessions')
    @admin_required
    def get_sessions():
        """Get all detection sessions with pagination."""
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        skip = (page - 1) * limit
        
        session_type = request.args.get('type')
        
        if session_type:
            sessions, total = session_model.get_sessions_by_type(session_type, skip=skip, limit=limit)
        else:
            sessions, total = session_model.get_all_sessions(skip=skip, limit=limit)
        
        # Convert ObjectId to string
        for session in sessions:
            session['_id'] = str(session['_id'])
        
        return jsonify({
            'sessions': sessions,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
    
    @admin_bp.route('/api/sessions/<session_id>')
    @admin_required
    def get_session(session_id):
        """Get specific session details."""
        session = session_model.get_session(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        session['_id'] = str(session['_id'])
        
        # Get session alerts
        alerts, _ = alert_model.get_session_alerts(session_id)
        for alert in alerts:
            alert['_id'] = str(alert['_id'])
        
        session['alerts_detail'] = alerts
        
        return jsonify(session)
    
    @admin_bp.route('/api/sessions/<session_id>', methods=['DELETE'])
    @admin_required
    def delete_session(session_id):
        """Delete a session."""
        success = session_model.delete_session(session_id)
        
        if success:
            return jsonify({'message': 'Session deleted successfully'})
        else:
            return jsonify({'error': 'Failed to delete session'}), 500
    
    @admin_bp.route('/api/alerts')
    @admin_required
    def get_alerts():
        """Get all alerts with pagination."""
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        skip = (page - 1) * limit
        
        severity = request.args.get('severity')
        alert_type = request.args.get('type')
        unacknowledged = request.args.get('unacknowledged') == 'true'
        
        if unacknowledged:
            alerts, total = alert_model.get_unacknowledged_alerts(skip=skip, limit=limit)
        elif severity:
            alerts, total = alert_model.get_alerts_by_severity(severity, skip=skip, limit=limit)
        elif alert_type:
            alerts, total = alert_model.get_alerts_by_type(alert_type, skip=skip, limit=limit)
        else:
            alerts, total = alert_model.get_all_alerts(skip=skip, limit=limit)
        
        # Convert ObjectId to string
        for alert in alerts:
            alert['_id'] = str(alert['_id'])
        
        return jsonify({
            'alerts': alerts,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
    
    @admin_bp.route('/api/alerts/<alert_id>/acknowledge', methods=['POST'])
    @admin_required
    def acknowledge_alert(alert_id):
        """Acknowledge an alert."""
        from flask import session
        admin_id = session.get('user_id')
        
        success = alert_model.acknowledge_alert(alert_id, admin_id)
        
        if success:
            return jsonify({'message': 'Alert acknowledged'})
        else:
            return jsonify({'error': 'Failed to acknowledge alert'}), 500
    
    @admin_bp.route('/api/alerts/<alert_id>', methods=['DELETE'])
    @admin_required
    def delete_alert(alert_id):
        """Delete an alert."""
        success = alert_model.delete_alert(alert_id)
        
        if success:
            return jsonify({'message': 'Alert deleted successfully'})
        else:
            return jsonify({'error': 'Failed to delete alert'}), 500
    
    @admin_bp.route('/api/alerts/critical/live')
    @admin_required
    def get_live_critical_alerts():
        """Get live critical alerts for real-time monitoring."""
        # Get unacknowledged critical and high severity alerts
        critical_alerts, _ = alert_model.get_alerts_by_severity('critical', limit=20)
        high_alerts, _ = alert_model.get_alerts_by_severity('high', limit=10)
        
        # Combine and filter unacknowledged
        all_alerts = critical_alerts + high_alerts
        unack_alerts = [a for a in all_alerts if not a.get('is_acknowledged', False)]
        
        # Sort by timestamp (newest first)
        unack_alerts.sort(key=lambda x: x.get('timestamp', datetime.min), reverse=True)
        
        # Convert ObjectId to string
        for alert in unack_alerts[:30]:  # Limit to 30 most recent
            alert['_id'] = str(alert['_id'])
        
        return jsonify({
            'alerts': unack_alerts[:30],
            'count': len(unack_alerts),
            'critical_count': sum(1 for a in unack_alerts if a.get('severity') == 'critical'),
            'high_count': sum(1 for a in unack_alerts if a.get('severity') == 'high')
        })
    
    @admin_bp.route('/api/analytics/timeline')
    @admin_required
    def get_timeline_analytics():
        """Get analytics data for charts (last 7 days)."""
        days = request.args.get('days', 7, type=int)
        
        # This is a simplified version - you can expand with aggregation pipeline
        sessions, _ = session_model.get_all_sessions(limit=1000)
        alerts, _ = alert_model.get_all_alerts(limit=1000)
        
        # Group by date
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        daily_data = {}
        for i in range(days):
            date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
            daily_data[date] = {
                'sessions': 0,
                'alerts': 0,
                'violence': 0,
                'fire': 0
            }
        
        for session in sessions:
            if session['timestamp'] >= cutoff:
                date = session['timestamp'].strftime('%Y-%m-%d')
                if date in daily_data:
                    daily_data[date]['sessions'] += 1
                    daily_data[date]['violence'] += session.get('violence_frames', 0)
                    daily_data[date]['fire'] += session.get('fire_frames', 0)
        
        for alert in alerts:
            if alert['timestamp'] >= cutoff:
                date = alert['timestamp'].strftime('%Y-%m-%d')
                if date in daily_data:
                    daily_data[date]['alerts'] += 1
        
        return jsonify(daily_data)
    
    # Register blueprint
    app.register_blueprint(admin_bp)
