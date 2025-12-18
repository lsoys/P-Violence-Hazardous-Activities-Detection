# 🚀 XDVioDet - Quick Start Guide

## Installation

```bash
cd "d:\LSOYS APP AND GAMES\GITHUB -- dummy\XDVioDet"
pip install -r requirements.txt
```

## Starting the Server

```bash
python app.py
```

Server will start at: **http://localhost:5000**

## Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- ⚠️ Change password after first login!

## Main URLs

| URL | Description | Access Level |
|-----|-------------|-------------|
| `/` | Home page | Public |
| `/auth/login` | Login page | Public |
| `/auth/signup` | Registration | Public |
| `/live-detection` | Live camera detection | Login Required |
| `/admin/dashboard` | Admin panel | Admin Only |

## User Roles

### Regular User Can:
- Sign up and login
- Upload videos for detection
- Use live camera detection
- View their own detection history

### Admin Can:
- All user features +
- Manage users (view, edit, delete)
- View all detection sessions
- Manage alerts
- View system analytics
- Access admin dashboard

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/logout` - User logout

### Admin APIs
- `GET /admin/api/stats` - System statistics
- `GET /admin/api/users` - List all users
- `GET /admin/api/users/{id}` - Get user details
- `PUT /admin/api/users/{id}` - Update user
- `DELETE /admin/api/users/{id}` - Delete user
- `GET /admin/api/sessions` - List sessions
- `GET /admin/api/alerts` - List alerts
- `POST /admin/api/alerts/{id}/acknowledge` - Acknowledge alert
- `GET /admin/api/analytics/timeline` - Analytics data

## Database Collections

1. **users** - User accounts and profiles
2. **detection_sessions** - Video/camera detection records
3. **alerts** - System alerts and notifications

## Features

### Detection Capabilities
- Violence/Fighting detection
- Fire/Flames detection
- Weapon detection (guns, knives)
- Aggressive behavior detection
- Motion anomaly detection

### Admin Dashboard Features
- Real-time statistics cards
- User management table
- Detection sessions table
- Alerts management table
- Activity timeline chart
- Alert distribution chart
- Auto-refresh every 30 seconds
- Pagination for all tables
- Advanced filtering

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- Protected routes
- CSRF protection
- Input validation
- XSS protection

## Troubleshooting

### MongoDB Connection Issues
Check `.env` file has correct `MONGODB_URI`:
```env
MONGODB_URI=mongodb+srv://voilance:voilance@cluster0.ogau74p.mongodb.net/
```

### Cannot Access Admin Dashboard
Make sure you're logged in with admin account:
- Username: `admin`
- Password: `admin123`

### Camera Not Working
1. Check if you're logged in
2. Allow browser to access camera
3. Check camera permissions on system

### Port Already in Use
Change port in app.py:
```python
app.run(port=5001)  # Change from 5000
```

## Development Notes

- Debug mode: Disabled for production
- Session lifetime: 7 days
- Max file size: 500 MB
- Auto-creates admin on first run
- MongoDB indexes created automatically

## File Structure

```
XDVioDet/
├── models/          # Database models
├── auth/            # Authentication logic
├── routes/          # API routes
├── templates/       # HTML templates
│   ├── auth/       # Login/signup pages
│   └── admin/      # Admin dashboard
├── static/
│   └── js/         # JavaScript files
├── app.py          # Main application
├── detector.py     # YOLOv8 detector
├── requirements.txt
└── .env            # Configuration
```

## Need Help?

1. Check `AUTH_IMPLEMENTATION_COMPLETE.md` for detailed docs
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify MongoDB connection

---

**System Status**: ✅ Fully Operational
**Version**: 2.0 with Authentication
**Last Updated**: December 18, 2024
