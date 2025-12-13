import React, { useState, useEffect } from 'react'
import { violenceLabels } from '../utils/api'

export default function History({ results }) {
  const [history, setHistory] = useState([])
  const [sortBy, setSortBy] = useState('date')
  const [filterBy, setFilterBy] = useState('all')

  // Load history from localStorage on mount and when results change
  useEffect(() => {
    const stored = localStorage.getItem('detectionHistory')
    if (stored) {
      setHistory(JSON.parse(stored))
    }
  }, [])

  // Add new result to history
  useEffect(() => {
    if (results) {
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...results
      }
      const updated = [historyItem, ...history]
      setHistory(updated)
      localStorage.setItem('detectionHistory', JSON.stringify(updated))
    }
  }, [results])

  // Filter history
  let filtered = history
  if (filterBy === 'violence') {
    filtered = history.filter(h => h.is_violence)
  } else if (filterBy === 'safe') {
    filtered = history.filter(h => !h.is_violence)
  }

  // Sort history
  if (sortBy === 'date-asc') {
    filtered = [...filtered].reverse()
  } else if (sortBy === 'confidence') {
    filtered = [...filtered].sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  }

  const clearHistory = () => {
    if (window.confirm('Clear all detection history?')) {
      setHistory([])
      localStorage.removeItem('detectionHistory')
    }
  }

  const exportHistory = () => {
    const csv = [
      ['Timestamp', 'Filename', 'Violence Detected', 'Confidence', 'Top Labels'].join(','),
      ...history.map(h => [
        new Date(h.timestamp).toLocaleString(),
        h.filename || 'Camera',
        h.is_violence ? 'Yes' : 'No',
        (h.confidence * 100).toFixed(1) + '%',
        Object.entries(h.labels || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([label]) => label.replace(/_/g, ' '))
          .join('; ')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `violence-detection-history-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Results ({history.length})</option>
          <option value="violence">Violence Only ({history.filter(h => h.is_violence).length})</option>
          <option value="safe">Safe Only ({history.filter(h => !h.is_violence).length})</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="date">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="confidence">Highest Confidence</option>
        </select>

        <button
          onClick={exportHistory}
          disabled={history.length === 0}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded font-medium transition"
        >
          📥 Export CSV
        </button>

        <button
          onClick={clearHistory}
          disabled={history.length === 0}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded font-medium transition"
        >
          🗑️ Clear
        </button>
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-lg">📭 No detection history yet</p>
          <p className="text-gray-500 text-sm">Upload a video or use your camera to start</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filtered.map((item) => {
            const confidence = (item.confidence * 100).toFixed(1)
            const topLabel = Object.entries(item.labels || {})
              .sort((a, b) => b[1] - a[1])[0]

            return (
              <div
                key={item.id}
                className={`rounded-lg p-4 border-2 transition ${
                  item.is_violence
                    ? 'bg-red-900/20 border-red-600'
                    : 'bg-green-900/20 border-green-600'
                }`}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {item.is_violence ? '🚨' : '✅'}
                    </div>
                    <div>
                      <p className={`font-bold ${item.is_violence ? 'text-red-400' : 'text-green-400'}`}>
                        {item.is_violence ? 'Violence' : 'Safe'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="text-sm">
                    <p className="text-gray-300 font-mono truncate max-w-xs">
                      {item.filename ? item.filename.substring(0, 30) : '📹 Camera'}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: item.is_violence ? '#FF6B6B' : '#51CF66' }}>
                      {confidence}%
                    </p>
                  </div>

                  {/* Top Label */}
                  {topLabel && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{violenceLabels[topLabel[0]]?.icon || '?'}</span>
                      <div>
                        <p className="text-xs text-gray-400">Top threat</p>
                        <p className="text-sm font-semibold text-gray-200 capitalize">
                          {topLabel[0].replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Label Bar */}
                {Object.keys(item.labels || {}).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-2">Threats detected:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.labels || {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([label, score]) => {
                          const config = violenceLabels[label]
                          return (
                            <span
                              key={label}
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{
                                backgroundColor: config.color + '40',
                                color: config.color
                              }}
                            >
                              {config.icon} {(score * 100).toFixed(0)}%
                            </span>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {history.length > 0 && (
        <div className="text-xs text-gray-400 text-center">
          Total: {history.length} detections | Showing: {filtered.length}
        </div>
      )}
    </div>
  )
}
