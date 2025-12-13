import React from 'react'
import { violenceLabels } from '../utils/api'

export default function DetectionResults({ results }) {
  if (!results) return null

  const confidence = (results.confidence * 100).toFixed(1)
  const labels = results.labels || {}

  return (
    <div className="space-y-6">
      {/* Overall Confidence */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Violence Confidence</h3>
          <span className={`text-3xl font-bold ${parseFloat(confidence) > 50 ? 'text-red-500' : 'text-green-500'}`}>
            {confidence}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${parseFloat(confidence) > 50 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-gray-300">
          {parseFloat(confidence) > 70 ? '⚠️ High violence risk detected' : parseFloat(confidence) > 40 ? '⚡ Moderate violence indicators' : '✅ Low risk environment'}
        </p>
      </div>

      {/* Classification Badge */}
      <div className="flex gap-4">
        <div className={`flex-1 rounded-lg p-4 border-2 ${results.is_violence ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
          <p className="text-xs text-gray-400 mb-1">Classification</p>
          <p className={`text-xl font-bold ${results.is_violence ? 'text-red-400' : 'text-green-400'}`}>
            {results.is_violence ? '🚨 VIOLENCE DETECTED' : '✅ SAFE'}
          </p>
        </div>

        {results.processing_time && (
          <div className="flex-1 rounded-lg p-4 bg-blue-900/20 border-2 border-blue-500">
            <p className="text-xs text-gray-400 mb-1">Processing Time</p>
            <p className="text-xl font-bold text-blue-400">{results.processing_time.toFixed(2)}s</p>
          </div>
        )}

        {results.total_frames && (
          <div className="flex-1 rounded-lg p-4 bg-purple-900/20 border-2 border-purple-500">
            <p className="text-xs text-gray-400 mb-1">Frames Analyzed</p>
            <p className="text-xl font-bold text-purple-400">{results.extracted_frames || results.total_frames}</p>
          </div>
        )}
      </div>

      {/* Violence Categories */}
      {Object.keys(labels).length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Detected Threat Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(labels).map(([label, score]) => {
              const labelConfig = violenceLabels[label] || { color: '#808080', icon: '?' }
              const percentage = (score * 100).toFixed(0)
              
              return (
                <div
                  key={label}
                  className="rounded-lg p-3 border-2 transition-all hover:scale-105"
                  style={{
                    backgroundColor: labelConfig.color + '20',
                    borderColor: labelConfig.color
                  }}
                >
                  <p className="text-2xl mb-1">{labelConfig.icon}</p>
                  <p className="text-xs font-semibold text-gray-200 truncate capitalize">
                    {label.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm font-bold mt-1" style={{ color: labelConfig.color }}>
                    {percentage}%
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: labelConfig.color,
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Frame Preview */}
      {results.frames && results.frames.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Video Frames Preview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {results.frames.slice(0, 12).map((frame, idx) => (
              <div key={idx} className="relative group rounded overflow-hidden">
                <img
                  src={`data:image/jpeg;base64,${frame}`}
                  alt={`Frame ${idx + 1}`}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Frame {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {results.filename && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">File Information</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Filename</p>
              <p className="text-gray-200 font-mono text-xs truncate">{results.filename}</p>
            </div>
            <div>
              <p className="text-gray-500">Timestamp</p>
              <p className="text-gray-200 text-xs">{new Date(results.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
