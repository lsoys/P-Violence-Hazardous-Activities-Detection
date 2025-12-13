import React, { useState } from 'react'

export default function Help() {
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  const faqs = [
    {
      question: 'How do I upload a video?',
      answer: 'Go to the "Upload Video" tab and either drag-and-drop a video file into the designated area or click to browse your computer. Supported formats are MP4, MOV, AVI, MKV, and WebM with a maximum file size of 500MB.'
    },
    {
      question: 'Can I use my camera to record videos?',
      answer: 'Yes! Go to the "Live Camera" tab and click "Start Camera". Grant camera permissions when prompted, then click "Start Recording" to begin recording. You can record up to 60 seconds. The video will be automatically uploaded and analyzed.'
    },
    {
      question: 'What does the confidence percentage mean?',
      answer: 'The confidence percentage (0-100%) indicates how likely the AI model believes violence is present in the video. Higher percentages suggest stronger indicators of violent or hazardous content. The system also provides individual confidence scores for each of the 15 threat categories.'
    },
    {
      question: 'How long does processing take?',
      answer: 'Processing typically takes 10-30 seconds depending on the video length and API server load. Short videos (5-15 seconds) usually process faster than longer videos. The system extracts key frames and analyzes them with deep learning models.'
    },
    {
      question: 'What are the 15 detection categories?',
      answer: 'The system detects: Alcohol, Gesture, Blood, Cigarette, Gun, Knife, Smoke, Mob Violence, Fight, Explosion, Shooting, Stabbing, Threatening Gesture, Car Crash, and Physical Assault.'
    },
    {
      question: 'Is my video data stored permanently?',
      answer: 'No. We prioritize privacy. Videos are processed on secure servers and are not stored permanently. Only the detection results are kept in your browser\'s local storage and can be cleared at any time from the Settings page.'
    },
    {
      question: 'Can I export my detection history?',
      answer: 'Yes! The system stores all detections locally. Go to the "History" tab and click "Export CSV" to download your detection history as a spreadsheet file. You can also manually clear history from the Settings page.'
    },
    {
      question: 'What should I do if I get an error?',
      answer: 'Check your internet connection first. If you see an API error, verify the API endpoint in Settings. Make sure your video file is in a supported format and under 500MB. Check the browser console (F12) for detailed error messages.'
    },
    {
      question: 'Why is camera access not working?',
      answer: 'Grant camera permissions in your browser settings. Some browsers require HTTPS connections for camera access. Try a different browser or check if another app is using your camera. Restart your device if issues persist.'
    },
    {
      question: 'Can I change the API endpoint?',
      answer: 'Yes, advanced users can configure the API endpoint in the Settings page. By default, it connects to the hosted XDVioDet API. Only change this if you have your own API server running.'
    },
    {
      question: 'What are the system requirements?',
      answer: 'You need a modern web browser (Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+), internet connection for API calls, and microphone/camera access if using live camera recording.'
    },
    {
      question: 'How do I clear all my data?',
      answer: 'Go to Settings and click "Clear Detection History" to remove all stored detections. You can also export your history as CSV before clearing. Browser local storage can also be cleared from browser settings.'
    }
  ]

  const troubleshooting = [
    {
      issue: 'Port 5173 is already in use',
      solution: 'Kill the process using the port. On Windows: netstat -ano | findstr :5173 then taskkill /PID <PID> /F. On Mac/Linux: lsof -ti:5173 | xargs kill -9'
    },
    {
      issue: 'Dependencies failed to install',
      solution: 'Clear npm cache and reinstall: npm cache clean --force, delete node_modules and package-lock.json, then npm install'
    },
    {
      issue: 'Camera permission denied',
      solution: 'Check browser camera settings, enable HTTPS (required by some browsers), restart your browser, or try a different browser'
    },
    {
      issue: 'Video upload keeps failing',
      solution: 'Check if file is under 500MB, verify the format is supported (MP4/MOV/AVI/MKV/WebM), test with a smaller video file'
    },
    {
      issue: 'API shows as unreachable',
      solution: 'Verify internet connection, check API endpoint URL in Settings, the API server might be down - check uptime status'
    },
    {
      issue: 'Results show unusual confidence scores',
      solution: 'Very short or low-quality videos may produce unexpected results. Try with a clear, longer video (10-30 seconds) for better accuracy'
    }
  ]

  const resources = [
    {
      title: 'Full Documentation',
      desc: 'Complete API and usage documentation',
      link: '#'
    },
    {
      title: 'GitHub Repository',
      desc: 'View source code and contribute',
      link: '#'
    },
    {
      title: 'API Documentation',
      desc: 'Technical details for API integration',
      link: '#'
    },
    {
      title: 'Video Tutorials',
      desc: 'Step-by-step guides and examples',
      link: '#'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Quick Start */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-6">Help & Documentation</h1>
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-3">Quick Start</h2>
          <ol className="space-y-2 text-gray-300 list-decimal list-inside">
            <li>Go to "Upload Video" or "Live Camera" tab</li>
            <li>Select a video file or start recording with your camera</li>
            <li>Wait for the system to process and analyze</li>
            <li>Review detailed results with threat categories and confidence scores</li>
            <li>Check "History" tab to see all past detections</li>
          </ol>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition text-left"
              >
                <p className="font-semibold text-white pr-4">{faq.question}</p>
                <span className={`text-blue-400 text-xl flex-shrink-0 transition ${expandedFAQ === idx ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedFAQ === idx && (
                <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700">
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting</h2>
        <div className="space-y-3">
          {troubleshooting.map((item, idx) => (
            <div key={idx} className="bg-gray-900/50 border border-red-700/30 rounded-lg p-4">
              <h3 className="font-semibold text-red-300 mb-2">Problem: {item.issue}</h3>
              <p className="text-gray-300 text-sm"><strong>Solution:</strong> {item.solution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Format Guide */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Supported Video Formats</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { format: 'MP4', codec: 'H.264/H.265', ext: '.mp4', status: 'Recommended' },
            { format: 'MOV', codec: 'QuickTime', ext: '.mov', status: 'Supported' },
            { format: 'AVI', codec: 'MPEG-4/MJPEG', ext: '.avi', status: 'Supported' },
            { format: 'MKV', codec: 'Matroska', ext: '.mkv', status: 'Supported' },
            { format: 'WebM', codec: 'VP8/VP9', ext: '.webm', status: 'Supported' },
            { format: 'FLV', codec: 'H.264', ext: '.flv', status: 'Not Supported' }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <p className="font-semibold text-white">{item.format}</p>
              <p className="text-sm text-gray-400">Codec: {item.codec}</p>
              <p className="text-sm text-gray-400">Extension: {item.ext}</p>
              <p className={`text-xs font-semibold mt-2 ${
                item.status === 'Recommended' ? 'text-green-400' :
                item.status === 'Supported' ? 'text-blue-400' :
                'text-red-400'
              }`}>{item.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips & Tricks */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Tips & Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <h3 className="font-semibold text-green-300 mb-2">DO</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ Use clear, well-lit videos</li>
              <li>✓ Keep videos between 5-30 seconds</li>
              <li>✓ Use supported formats (MP4 recommended)</li>
              <li>✓ Export history regularly</li>
              <li>✓ Test with sample videos first</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <h3 className="font-semibold text-red-300 mb-2">DON'T</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✗ Upload videos over 500MB</li>
              <li>✗ Use very dark or blurry videos</li>
              <li>✗ Expect 100% accuracy</li>
              <li>✗ Share your API endpoint publicly</li>
              <li>✗ Rely solely on this system for critical decisions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Additional Resources</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.link}
              className="bg-gray-900/50 border border-gray-700 hover:border-blue-600 rounded-lg p-4 transition"
            >
              <h3 className="font-semibold text-blue-400 mb-1">{resource.title}</h3>
              <p className="text-sm text-gray-400">{resource.desc}</p>
              <p className="text-xs text-gray-500 mt-2">→ Click to open</p>
            </a>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-3">Need More Help?</h2>
        <p className="text-gray-300 mb-4">
          If you couldn't find the answer here, you can:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li>• Check the browser console (F12) for error details</li>
          <li>• Visit the GitHub repository for known issues</li>
          <li>• Check API status at the endpoint</li>
          <li>• Review the README.md file for more information</li>
        </ul>
      </div>
    </div>
  )
}
