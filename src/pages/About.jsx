import React from 'react'

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-8 border border-gray-700">
        <h1 className="text-4xl font-bold text-white mb-4">About XDVioDet</h1>
        <p className="text-xl text-gray-300 leading-relaxed">
          XDVioDet is an advanced AI-powered violence and hazardous activity detection system designed to monitor and identify threatening situations in real-time using deep learning technology.
        </p>
      </div>

      {/* Key Features */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: 'Real-Time Detection',
              desc: 'Analyze videos instantly with advanced deep learning models'
            },
            {
              title: '15 Categories',
              desc: 'Detects violence, weapons, hazardous activities and more'
            },
            {
              title: 'Privacy-First',
              desc: 'No permanent video storage, secure processing only'
            },
            {
              title: 'Dual Input',
              desc: 'Upload video files or record with your camera'
            },
            {
              title: 'Detailed Analytics',
              desc: 'Frame-by-frame analysis with confidence scores'
            },
            {
              title: 'History Tracking',
              desc: 'Store and export detection history as CSV'
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detection Categories */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Detection Categories (15 Classes)</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { name: 'Alcohol', color: 'bg-red-900/30 border-red-700' },
            { name: 'Gesture', color: 'bg-orange-900/30 border-orange-700' },
            { name: 'Blood', color: 'bg-red-900/30 border-red-700' },
            { name: 'Cigarette', color: 'bg-purple-900/30 border-purple-700' },
            { name: 'Gun', color: 'bg-pink-900/30 border-pink-700' },
            { name: 'Knife', color: 'bg-red-900/30 border-red-700' },
            { name: 'Smoke', color: 'bg-gray-700/50 border-gray-600' },
            { name: 'Mob Violence', color: 'bg-red-900/30 border-red-700' },
            { name: 'Fight', color: 'bg-red-900/30 border-red-700' },
            { name: 'Explosion', color: 'bg-orange-900/30 border-orange-700' },
            { name: 'Shooting', color: 'bg-red-900/30 border-red-700' },
            { name: 'Stabbing', color: 'bg-red-900/30 border-red-700' },
            { name: 'Threatening Gesture', color: 'bg-orange-900/30 border-orange-700' },
            { name: 'Car Crash', color: 'bg-yellow-900/30 border-yellow-700' },
            { name: 'Physical Assault', color: 'bg-red-900/30 border-red-700' }
          ].map((cat, idx) => (
            <div key={idx} className={`rounded-lg p-3 border ${cat.color}`}>
              <p className="text-white font-semibold text-center">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-400 mb-3">Frontend</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• React 18.2.0 - UI Framework</li>
              <li>• Vite 5.0.8 - Build Tool</li>
              <li>• Tailwind CSS 3.3.6 - Styling</li>
              <li>• Axios - HTTP Client</li>
            </ul>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-3">Backend</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• PyTorch - Deep Learning</li>
              <li>• GCN Model - Graph Convolutional</li>
              <li>• OpenCV - Video Processing</li>
              <li>• Python Flask - API Server</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
        <div className="space-y-4">
          {[
            {
              num: '1',
              title: 'Upload or Record',
              desc: 'Choose to upload a video file or record directly using your camera'
            },
            {
              num: '2',
              title: 'Frame Extraction',
              desc: 'The system extracts key frames from the video at optimal intervals'
            },
            {
              num: '3',
              title: 'Deep Analysis',
              desc: 'AI model analyzes each frame for 15 different threat categories'
            },
            {
              num: '4',
              title: 'Confidence Scoring',
              desc: 'Generates confidence scores for each category and overall violence detection'
            },
            {
              num: '5',
              title: 'Results Display',
              desc: 'View detailed results with frame previews and confidence metrics'
            },
            {
              num: '6',
              title: 'History Tracking',
              desc: 'All detections are saved locally and can be exported as CSV'
            }
          ].map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                  {step.num}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Performance Metrics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg p-6 border border-blue-700 text-center">
            <p className="text-3xl font-bold text-blue-400 mb-2">92%</p>
            <p className="text-gray-300 text-sm">Average Accuracy</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-6 border border-green-700 text-center">
            <p className="text-3xl font-bold text-green-400 mb-2">15</p>
            <p className="text-gray-300 text-sm">Threat Categories</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg p-6 border border-purple-700 text-center">
            <p className="text-3xl font-bold text-purple-400 mb-2">10-30s</p>
            <p className="text-gray-300 text-sm">Processing Time</p>
          </div>
        </div>
      </div>

      {/* Team & Credits */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">About This Version</h2>
        <div className="space-y-3 text-gray-300">
          <p>
            This is a professional frontend interface for the XDVioDet violence detection system. The interface provides an intuitive way to interact with the AI model for real-time threat detection and analysis.
          </p>
          <p>
            Built with modern web technologies, it supports both video file uploads and real-time camera capture, making it accessible for various use cases including security monitoring, event surveillance, and hazard detection.
          </p>
          <p className="text-sm text-gray-500">
            Version 1.0.0 | Last Updated: December 2024
          </p>
        </div>
      </div>
    </div>
  )
}
