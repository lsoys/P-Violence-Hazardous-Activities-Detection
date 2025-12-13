import React, { useState, useEffect } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    maxFileSize: 500,
    maxRecordingTime: 60,
    autoExport: false,
    darkMode: true,
    showNotifications: true,
    apiEndpoint: 'https://p-violence-hazardous-activities-detection.onrender.com',
    confidenceThreshold: 50
  })

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
  }, [])

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setSaved(false)
  }

  const handleSave = () => {
    try {
      // Validate API endpoint
      if (!settings.apiEndpoint.startsWith('http')) {
        setError('API endpoint must start with http:// or https://')
        return
      }

      if (settings.maxFileSize < 10) {
        setError('Maximum file size must be at least 10 MB')
        return
      }

      if (settings.maxRecordingTime < 10) {
        setError('Maximum recording time must be at least 10 seconds')
        return
      }

      localStorage.setItem('appSettings', JSON.stringify(settings))
      setSaved(true)
      setError('')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to save settings')
    }
  }

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      const defaults = {
        maxFileSize: 500,
        maxRecordingTime: 60,
        autoExport: false,
        darkMode: true,
        showNotifications: true,
        apiEndpoint: 'https://p-violence-hazardous-activities-detection.onrender.com',
        confidenceThreshold: 50
      }
      setSettings(defaults)
      localStorage.setItem('appSettings', JSON.stringify(defaults))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('Clear all detection history? This cannot be undone.')) {
      localStorage.removeItem('detectionHistory')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Messages */}
      {saved && (
        <div className="p-4 bg-green-900/30 border-2 border-green-600 rounded-lg">
          <p className="text-green-300 font-semibold">Settings saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/30 border-2 border-red-600 rounded-lg">
          <p className="text-red-300 font-semibold">{error}</p>
        </div>
      )}

      {/* Video Settings */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-gray-700">Video Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Maximum File Size (MB)
            </label>
            <input
              type="number"
              min="10"
              max="2000"
              value={settings.maxFileSize}
              onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum video file size allowed for upload</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Maximum Recording Time (seconds)
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={settings.maxRecordingTime}
              onChange={(e) => handleChange('maxRecordingTime', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum duration for camera recording</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Confidence Threshold (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.confidenceThreshold}
              onChange={(e) => handleChange('confidenceThreshold', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum confidence score for violence detection (0-100%)</p>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-gray-700">API Settings</h2>
        
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            API Endpoint
          </label>
          <input
            type="text"
            value={settings.apiEndpoint}
            onChange={(e) => handleChange('apiEndpoint', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Base URL for the detection API server</p>
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-gray-700">Application Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">Dark Mode</p>
              <p className="text-sm text-gray-400">Always enabled for this version</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center pl-1">
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">Notifications</p>
              <p className="text-sm text-gray-400">Show browser notifications for results</p>
            </div>
            <button
              onClick={() => handleChange('showNotifications', !settings.showNotifications)}
              className={`w-12 h-6 rounded-full flex items-center transition ${
                settings.showNotifications ? 'bg-blue-600 pl-1' : 'bg-gray-600 pl-7'
              }`}
            >
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">Auto Export</p>
              <p className="text-sm text-gray-400">Automatically export results as CSV</p>
            </div>
            <button
              onClick={() => handleChange('autoExport', !settings.autoExport)}
              className={`w-12 h-6 rounded-full flex items-center transition ${
                settings.autoExport ? 'bg-blue-600 pl-1' : 'bg-gray-600 pl-7'
              }`}
            >
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-gray-700">Data Management</h2>
        
        <div className="space-y-3">
          <button
            onClick={handleClearHistory}
            className="w-full px-4 py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-300 rounded-lg font-medium transition"
          >
            Clear Detection History
          </button>
          <button
            onClick={() => {
              const data = localStorage.getItem('appSettings')
              const dataStr = data ? JSON.stringify(JSON.parse(data), null, 2) : 'No settings found'
              const blob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `xdviodet-backup-${Date.now()}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="w-full px-4 py-3 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700 text-blue-300 rounded-lg font-medium transition"
          >
            Export Settings Backup
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">System Information</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Browser</p>
            <p className="text-gray-200 font-mono">{navigator.userAgent.split(' ').pop()}</p>
          </div>
          <div>
            <p className="text-gray-500">Local Storage</p>
            <p className="text-gray-200">{(navigator.storage?.estimate ? 'Available' : 'Limited')}</p>
          </div>
          <div>
            <p className="text-gray-500">Camera Support</p>
            <p className="text-gray-200">{navigator.mediaDevices ? 'Supported' : 'Not Available'}</p>
          </div>
          <div>
            <p className="text-gray-500">App Version</p>
            <p className="text-gray-200">1.0.0</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 pt-6 pb-6">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
        >
          Save Settings
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
