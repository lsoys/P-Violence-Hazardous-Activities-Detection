import React, { useState, useEffect } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDetections: 0,
    violenceDetected: 0,
    safeDetections: 0,
    averageConfidence: 0
  })

  useEffect(() => {
    // Load stats from history
    const history = localStorage.getItem('detectionHistory')
    if (history) {
      const detections = JSON.parse(history)
      const violent = detections.filter(d => d.is_violence).length
      const safe = detections.filter(d => !d.is_violence).length
      const avgConfidence = detections.length > 0 
        ? (detections.reduce((sum, d) => sum + (d.confidence || 0), 0) / detections.length * 100).toFixed(1)
        : 0

      setStats({
        totalDetections: detections.length,
        violenceDetected: violent,
        safeDetections: safe,
        averageConfidence: avgConfidence
      })
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-8 border border-gray-700">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to XDVioDet</h1>
        <p className="text-lg text-gray-300">
          AI-Powered Violence and Hazardous Activity Detection System
        </p>
        <p className="text-sm text-gray-400 mt-3">
          Analyze videos for 15 different threat categories with real-time AI processing
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg p-6 border border-blue-700">
          <p className="text-gray-400 text-sm mb-2">Total Detections</p>
          <p className="text-4xl font-bold text-blue-400">{stats.totalDetections}</p>
          <p className="text-xs text-gray-500 mt-3">All time records</p>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-lg p-6 border border-red-700">
          <p className="text-gray-400 text-sm mb-2">Violence Detected</p>
          <p className="text-4xl font-bold text-red-400">{stats.violenceDetected}</p>
          <p className="text-xs text-gray-500 mt-3">High risk events</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-6 border border-green-700">
          <p className="text-gray-400 text-sm mb-2">Safe Detections</p>
          <p className="text-4xl font-bold text-green-400">{stats.safeDetections}</p>
          <p className="text-xs text-gray-500 mt-3">Low risk events</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg p-6 border border-purple-700">
          <p className="text-gray-400 text-sm mb-2">Avg Confidence</p>
          <p className="text-4xl font-bold text-purple-400">{stats.averageConfidence}%</p>
          <p className="text-xs text-gray-500 mt-3">Detection accuracy</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.hash = '#upload'}
            className="group bg-gradient-to-br from-blue-900/30 to-blue-800/30 hover:from-blue-900/50 hover:to-blue-800/50 rounded-lg p-6 border border-blue-700 transition text-left"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition">⬆</div>
            <h3 className="font-bold text-white mb-1">Upload Video</h3>
            <p className="text-sm text-gray-400">Analyze video files from your computer</p>
          </button>

          <button
            onClick={() => window.location.hash = '#camera'}
            className="group bg-gradient-to-br from-red-900/30 to-red-800/30 hover:from-red-900/50 hover:to-red-800/50 rounded-lg p-6 border border-red-700 transition text-left"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition">⚫</div>
            <h3 className="font-bold text-white mb-1">Live Camera</h3>
            <p className="text-sm text-gray-400">Record with your camera and detect</p>
          </button>

          <button
            onClick={() => window.location.hash = '#history'}
            className="group bg-gradient-to-br from-purple-900/30 to-purple-800/30 hover:from-purple-900/50 hover:to-purple-800/50 rounded-lg p-6 border border-purple-700 transition text-left"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition">◼</div>
            <h3 className="font-bold text-white mb-1">View History</h3>
            <p className="text-sm text-gray-400">See all past detections and results</p>
          </button>
        </div>
      </div>

      {/* Features Overview */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="flex gap-4">
              <div className="text-3xl">▶</div>
              <div>
                <h3 className="font-bold text-white mb-1">Dual Input Methods</h3>
                <p className="text-sm text-gray-400">Upload video files or record live with your camera</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="flex gap-4">
              <div className="text-3xl">■</div>
              <div>
                <h3 className="font-bold text-white mb-1">15 Threat Categories</h3>
                <p className="text-sm text-gray-400">Detects violence, weapons, and hazardous activities</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="flex gap-4">
              <div className="text-3xl">⊕</div>
              <div>
                <h3 className="font-bold text-white mb-1">Advanced Analytics</h3>
                <p className="text-sm text-gray-400">Detailed confidence scores and frame previews</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="flex gap-4">
              <div className="text-3xl">△</div>
              <div>
                <h3 className="font-bold text-white mb-1">Privacy First</h3>
                <p className="text-sm text-gray-400">No permanent storage, secure processing only</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="flex gap-4">
              <div className="text-3xl">◇</div>
              <div>
                <h3 className="font-bold text-white mb-1">History Tracking</h3>
                <p className="text-sm text-gray-400">Store and export detection results as CSV</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="flex gap-4">
              <div className="text-3xl">◆</div>
              <div>
                <h3 className="font-bold text-white mb-1">Real-Time Processing</h3>
                <p className="text-sm text-gray-400">Fast analysis with AI-powered detection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
        <ol className="space-y-3 text-gray-300">
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold flex-shrink-0">1.</span>
            <span>Choose upload video or live camera from the sidebar</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold flex-shrink-0">2.</span>
            <span>Select a video file or start recording with your camera</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold flex-shrink-0">3.</span>
            <span>Wait for the system to process and analyze the content</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold flex-shrink-0">4.</span>
            <span>Review detailed results with threat categories and confidence scores</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold flex-shrink-0">5.</span>
            <span>Check history to track all past detections</span>
          </li>
        </ol>
      </div>

      {/* Technology Info */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-blue-400 mb-2">Frontend</p>
            <ul className="space-y-1 text-gray-300">
              <li>• React 18.2.0</li>
              <li>• Vite 5.0.8</li>
              <li>• Tailwind CSS 3.3.6</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-green-400 mb-2">Backend</p>
            <ul className="space-y-1 text-gray-300">
              <li>• PyTorch</li>
              <li>• GCN Model</li>
              <li>• OpenCV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
