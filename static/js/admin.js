// Admin Dashboard JavaScript
let currentPage = {
    users: 1,
    sessions: 1,
    alerts: 1
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    loadUsers();
    setupTabNavigation();
    setupFilters();
    setupAutoRefresh();
    checkCriticalAlerts();  // Check for critical alerts immediately
});

// Tab navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Hide all content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected content
    const contentId = tabName + 'Tab';
    document.getElementById(contentId).classList.remove('hidden');
    
    // Load data for the tab
    if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'sessions') {
        loadSessions();
    } else if (tabName === 'alerts') {
        loadAlerts();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/admin/api/stats');
        const data = await response.json();
        
        const statsHTML = `
            <!-- Users Card -->
            <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm font-medium">Total Users</p>
                        <h3 class="text-3xl font-bold mt-2">${data.users.total}</h3>
                        <p class="text-blue-100 text-sm mt-2">
                            ${data.users.active} active • ${data.users.admins} admins
                        </p>
                    </div>
                    <div class="text-5xl opacity-20">👥</div>
                </div>
            </div>
            
            <!-- Sessions Card -->
            <div class="stat-card bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-purple-100 text-sm font-medium">Total Sessions</p>
                        <h3 class="text-3xl font-bold mt-2">${data.sessions.total_sessions}</h3>
                        <p class="text-purple-100 text-sm mt-2">
                            ${data.sessions.active_sessions} active
                        </p>
                    </div>
                    <div class="text-5xl opacity-20">📹</div>
                </div>
            </div>
            
            <!-- Detections Card -->
            <div class="stat-card bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-red-100 text-sm font-medium">Violence Detected</p>
                        <h3 class="text-3xl font-bold mt-2">${data.sessions.violence_frames}</h3>
                        <p class="text-red-100 text-sm mt-2">
                            ${data.sessions.weapon_count} weapons • ${data.sessions.fight_count} fights
                        </p>
                    </div>
                    <div class="text-5xl opacity-20">⚠️</div>
                </div>
            </div>
            
            <!-- Alerts Card -->
            <div class="stat-card bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-orange-100 text-sm font-medium">Total Alerts</p>
                        <h3 class="text-3xl font-bold mt-2">${data.alerts.total_alerts}</h3>
                        <p class="text-orange-100 text-sm mt-2">
                            ${data.alerts.unacknowledged} unacknowledged
                        </p>
                    </div>
                    <div class="text-5xl opacity-20">🔔</div>
                </div>
            </div>
        `;
        
        document.getElementById('statsContainer').innerHTML = statsHTML;
    } catch (error) {
        console.error('Error loading statistics:', error);
        document.getElementById('statsContainer').innerHTML = '<div class="col-span-4 text-center text-red-600">Failed to load statistics</div>';
    }
}

// Load users
async function loadUsers(page = 1) {
    try {
        const response = await fetch(`/admin/api/users?page=${page}&limit=10`);
        const data = await response.json();
        
        if (data.users.length === 0) {
            document.getElementById('usersTable').innerHTML = '<p class="text-center text-gray-600 py-8">No users found</p>';
            return;
        }
        
        const tableHTML = `
            <table class="min-w-full bg-white border rounded-lg">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Username</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Detections</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Alerts</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${data.users.map(user => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">${user.username}</div>
                                <div class="text-sm text-gray-500">Joined ${new Date(user.created_at).toLocaleDateString()}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">${user.email}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                                    ${user.role}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">${user.detection_count || 0}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">${user.alert_count || 0}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    ${user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <button onclick="viewUser('${user._id}')" class="text-blue-600 hover:text-blue-800 mr-2">View</button>
                                <button onclick="toggleUserStatus('${user._id}', ${!user.is_active})" class="text-yellow-600 hover:text-yellow-800 mr-2">
                                    ${user.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                ${user.role !== 'admin' ? `<button onclick="deleteUser('${user._id}')" class="text-red-600 hover:text-red-800">Delete</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('usersTable').innerHTML = tableHTML;
        renderPagination('users', data.page, data.pages);
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTable').innerHTML = '<p class="text-center text-red-600 py-8">Failed to load users</p>';
    }
}

// Load sessions
async function loadSessions(page = 1) {
    const sessionType = document.getElementById('sessionTypeFilter').value;
    const url = `/admin/api/sessions?page=${page}&limit=10${sessionType ? '&type=' + sessionType : ''}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.sessions.length === 0) {
            document.getElementById('sessionsTable').innerHTML = '<p class="text-center text-gray-600 py-8">No sessions found</p>';
            return;
        }
        
        const tableHTML = `
            <table class="min-w-full bg-white border rounded-lg">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Timestamp</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Frames</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Violence</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Danger</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${data.sessions.map(session => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${session.session_type === 'video_upload' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                                    ${session.session_type}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">${session.user_id}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">${new Date(session.timestamp).toLocaleString()}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">${session.total_frames || 0}</td>
                            <td class="px-6 py-4 text-sm">
                                <span class="${session.violence_frames > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}">
                                    ${session.violence_frames || 0}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full 
                                    ${session.max_danger_level >= 4 ? 'bg-red-100 text-red-800' : 
                                      session.max_danger_level >= 3 ? 'bg-orange-100 text-orange-800' : 
                                      session.max_danger_level >= 2 ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800'}">
                                    Level ${session.max_danger_level || 0}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${session.status}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <button onclick="viewSession('${session._id}')" class="text-blue-600 hover:text-blue-800 mr-2">View</button>
                                <button onclick="deleteSession('${session._id}')" class="text-red-600 hover:text-red-800">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('sessionsTable').innerHTML = tableHTML;
        renderPagination('sessions', data.page, data.pages);
    } catch (error) {
        console.error('Error loading sessions:', error);
        document.getElementById('sessionsTable').innerHTML = '<p class="text-center text-red-600 py-8">Failed to load sessions</p>';
    }
}

// Load alerts
async function loadAlerts(page = 1) {
    const severity = document.getElementById('alertSeverityFilter').value;
    const type = document.getElementById('alertTypeFilter').value;
    const url = `/admin/api/alerts?page=${page}&limit=20${severity ? '&severity=' + severity : ''}${type ? '&type=' + type : ''}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.alerts.length === 0) {
            document.getElementById('alertsTable').innerHTML = '<p class="text-center text-gray-600 py-8">No alerts found</p>';
            return;
        }
        
        const tableHTML = `
            <table class="min-w-full bg-white border rounded-lg">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Severity</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Message</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Confidence</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Timestamp</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${data.alerts.map(alert => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    ${alert.alert_type}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full 
                                    ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                                      alert.severity === 'high' ? 'bg-orange-100 text-orange-800' : 
                                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-blue-100 text-blue-800'}">
                                    ${alert.severity}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">${alert.message}</td>
                            <td class="px-6 py-4 text-sm text-gray-600">${(alert.confidence * 100).toFixed(1)}%</td>
                            <td class="px-6 py-4 text-sm text-gray-600">${new Date(alert.timestamp).toLocaleString()}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${alert.is_acknowledged ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                    ${alert.is_acknowledged ? 'Acknowledged' : 'Pending'}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                ${!alert.is_acknowledged ? `<button onclick="acknowledgeAlert('${alert._id}')" class="text-green-600 hover:text-green-800 mr-2">Acknowledge</button>` : ''}
                                <button onclick="deleteAlert('${alert._id}')" class="text-red-600 hover:text-red-800">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('alertsTable').innerHTML = tableHTML;
        renderPagination('alerts', data.page, data.pages);
    } catch (error) {
        console.error('Error loading alerts:', error);
        document.getElementById('alertsTable').innerHTML = '<p class="text-center text-red-600 py-8">Failed to load alerts</p>';
    }
}

// Load analytics
let activityChart, alertsChartObj;

async function loadAnalytics() {
    try {
        const response = await fetch('/admin/api/analytics/timeline?days=7');
        const data = await response.json();
        
        const dates = Object.keys(data).reverse();
        const sessionsData = dates.map(date => data[date].sessions);
        const alertsData = dates.map(date => data[date].alerts);
        const violenceData = dates.map(date => data[date].violence);
        
        // Activity Chart
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        if (activityChart) activityChart.destroy();
        activityChart = new Chart(activityCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Sessions',
                    data: sessionsData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Alerts',
                    data: alertsData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Get alert statistics
        const statsResponse = await fetch('/admin/api/stats');
        const stats = await response.json();
        
        // Alerts Distribution Chart
        const alertsCtx = document.getElementById('alertsChart').getContext('2d');
        if (alertsChartObj) alertsChartObj.destroy();
        alertsChartObj = new Chart(alertsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Violence', 'Fire', 'Smoke', 'Weapon', 'Fight'],
                datasets: [{
                    data: [
                        stats.alerts?.by_type?.violence || 0,
                        stats.alerts?.by_type?.fire || 0,
                        stats.alerts?.by_type?.smoke || 0,
                        stats.alerts?.by_type?.weapon || 0,
                        stats.alerts?.by_type?.fight || 0
                    ],
                    backgroundColor: [
                        '#ef4444',
                        '#f59e0b',
                        '#6b7280',
                        '#8b5cf6',
                        '#ec4899'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Pagination
function renderPagination(type, currentPage, totalPages) {
    const container = document.getElementById(`${type}Pagination`);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="flex space-x-2">';
    
    // Previous button
    paginationHTML += `<button onclick="changePage('${type}', ${currentPage - 1})" 
        class="px-4 py-2 border rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}" 
        ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button onclick="changePage('${type}', ${i})" 
                class="px-4 py-2 border rounded-lg ${i === currentPage ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span class="px-2 py-2">...</span>';
        }
    }
    
    // Next button
    paginationHTML += `<button onclick="changePage('${type}', ${currentPage + 1})" 
        class="px-4 py-2 border rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}" 
        ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
}

function changePage(type, page) {
    currentPage[type] = page;
    if (type === 'users') loadUsers(page);
    else if (type === 'sessions') loadSessions(page);
    else if (type === 'alerts') loadAlerts(page);
}

// Setup filters
function setupFilters() {
    document.getElementById('sessionTypeFilter').addEventListener('change', () => loadSessions(1));
    document.getElementById('alertSeverityFilter').addEventListener('change', () => loadAlerts(1));
    document.getElementById('alertTypeFilter').addEventListener('change', () => loadAlerts(1));
}

// User actions
async function viewUser(userId) {
    try {
        const response = await fetch(`/admin/api/users/${userId}`);
        const data = await response.json();
        alert(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error viewing user:', error);
        alert('Failed to load user details');
    }
}

async function toggleUserStatus(userId, isActive) {
    if (!confirm(`Are you sure you want to ${isActive ? 'activate' : 'deactivate'} this user?`)) return;
    
    try {
        const response = await fetch(`/admin/api/users/${userId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({is_active: isActive})
        });
        
        if (response.ok) {
            alert('User status updated successfully');
            loadUsers(currentPage.users);
        } else {
            alert('Failed to update user status');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user status');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`/admin/api/users/${userId}`, {method: 'DELETE'});
        if (response.ok) {
            alert('User deleted successfully');
            loadUsers(currentPage.users);
        } else {
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
    }
}

// Session actions
async function viewSession(sessionId) {
    try {
        const response = await fetch(`/admin/api/sessions/${sessionId}`);
        const data = await response.json();
        alert(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error viewing session:', error);
        alert('Failed to load session details');
    }
}

async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
        const response = await fetch(`/admin/api/sessions/${sessionId}`, {method: 'DELETE'});
        if (response.ok) {
            alert('Session deleted successfully');
            loadSessions(currentPage.sessions);
        } else {
            alert('Failed to delete session');
        }
    } catch (error) {
        console.error('Error deleting session:', error);
        alert('Failed to delete session');
    }
}

// Alert actions
async function acknowledgeAlert(alertId) {
    try {
        const response = await fetch(`/admin/api/alerts/${alertId}/acknowledge`, {method: 'POST'});
        if (response.ok) {
            alert('Alert acknowledged');
            loadAlerts(currentPage.alerts);
        } else {
            alert('Failed to acknowledge alert');
        }
    } catch (error) {
        console.error('Error acknowledging alert:', error);
        alert('Failed to acknowledge alert');
    }
}

async function deleteAlert(alertId) {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    
    try {
        const response = await fetch(`/admin/api/alerts/${alertId}`, {method: 'DELETE'});
        if (response.ok) {
            alert('Alert deleted successfully');
            loadAlerts(currentPage.alerts);
        } else {
            alert('Failed to delete alert');
        }
    } catch (error) {
        console.error('Error deleting alert:', error);
        alert('Failed to delete alert');
    }
}

// Check for critical alerts
async function checkCriticalAlerts() {
    try {
        const response = await fetch('/admin/api/alerts/critical/live');
        const data = await response.json();
        
        const banner = document.getElementById('criticalAlertsBanner');
        const message = document.getElementById('criticalAlertsMessage');
        
        if (data.count > 0) {
            // Show banner with alert count
            banner.classList.remove('hidden');
            message.textContent = `${data.critical_count} critical and ${data.high_count} high severity alerts require attention!`;
            
            // Play alert sound if critical alerts exist
            if (data.critical_count > 0) {
                playAlertSound();
            }
        } else {
            banner.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error checking critical alerts:', error);
    }
}

// View critical alerts
function viewCriticalAlerts() {
    // Switch to alerts tab and filter by critical
    switchTab('alerts');
    document.getElementById('alertSeverityFilter').value = 'critical';
    loadAlerts(1);
}

// Play alert sound
let lastAlertTime = 0;
function playAlertSound() {
    // Only play sound once per minute to avoid spam
    const now = Date.now();
    if (now - lastAlertTime < 60000) return;
    lastAlertTime = now;
    
    // Create audio context for alert beep
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.log('Audio playback not supported');
    }
}

// Auto-refresh
function setupAutoRefresh() {
    // Refresh statistics every 30 seconds
    setInterval(loadStatistics, 30000);
    
    // Check for critical alerts every 10 seconds
    setInterval(checkCriticalAlerts, 10000);
    
    // Refresh current tab data every 60 seconds
    setInterval(() => {
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        if (activeTab === 'users') loadUsers(currentPage.users);
        else if (activeTab === 'sessions') loadSessions(currentPage.sessions);
        else if (activeTab === 'alerts') loadAlerts(currentPage.alerts);
    }, 60000);
}
