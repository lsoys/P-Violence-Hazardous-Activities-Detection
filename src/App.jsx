import React, { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import VideoUpload from './components/VideoUpload'
import CameraCapture from './components/CameraCapture'
import DetectionResults from './components/DetectionResults'
import History from './components/History'
import About from './pages/About'
import Settings from './pages/Settings'
import Help from './pages/Help'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleResultsReceived = (newResults) => {
    setResults(newResults)
    setError(null)
  }

  const handleLoading = (loading) => {
    setIsLoading(loading)
  }

  const handleError = (errorMsg) => {
    setError(errorMsg)
    setIsLoading(false)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'upload':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            {error && (
              <div className="p-4 bg-red-900/30 border-2 border-red-600 rounded-lg">
                <p className="text-red-300 font-semibold">Error</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            {results && (
              <div className="p-4 bg-green-900/30 border-2 border-green-600 rounded-lg">
                <p className="text-green-300 font-semibold">Processing complete</p>
                <p className="text-green-200 text-sm">Scroll down to view results</p>
              </div>
            )}
            <VideoUpload
              onResultsReceived={handleResultsReceived}
              onLoading={handleLoading}
              onError={handleError}
            />
            {results && <DetectionResults results={results} />}
          </div>
        )
      case 'camera':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            {error && (
              <div className="p-4 bg-red-900/30 border-2 border-red-600 rounded-lg">
                <p className="text-red-300 font-semibold">Error</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            <CameraCapture
              onResultsReceived={handleResultsReceived}
              onLoading={handleLoading}
              onError={handleError}
            />
            {results && <DetectionResults results={results} />}
          </div>
        )
      case 'history':
        return <History results={results} />
      case 'about':
        return <About />
      case 'settings':
        return <Settings />
      case 'help':
        return <Help />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-700">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            </div>
            <p className="text-white font-semibold">Processing Video</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while the AI analyzes your video</p>
          </div>
        </div>
      )}

      {renderPage()}
    </Layout>
  )
}
