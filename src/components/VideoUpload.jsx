import React, { useRef, useState } from 'react'
import { uploadVideo } from '../utils/api'

export default function VideoUpload({ onResultsReceived, onLoading, onError }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const fileInputRef = useRef(null)

  const SUPPORTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm']
  const MAX_FILE_SIZE = 500 * 1024 * 1024

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const processFile = async (file) => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      onError?.('Invalid file format. Supported: MP4, MOV, AVI, MKV, WebM')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      onError?.('File too large. Maximum size: 500MB')
      return
    }

    setFileName(file.name)
    setFileSize((file.size / (1024 * 1024)).toFixed(2))
    
    onLoading(true)
    try {
      const results = await uploadVideo(file)
      results.filename = file.name
      results.timestamp = new Date().toISOString()
      onResultsReceived(results)
    } catch (error) {
      onError?.(error.message || 'Failed to upload video')
      setFileName('')
      setFileSize('')
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div onClick={() => fileInputRef.current?.click()}>
          <div className="text-5xl font-bold text-gray-400 mb-3">
            {fileName ? '✓' : '↑'}
          </div>
          <p className="text-lg font-semibold text-white">
            {fileName ? 'File Selected' : 'Upload Video'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {fileName ? (
              <>
                <span className="font-mono">{fileName}</span>
                <br />
                <span className="text-gray-500">Size: {fileSize} MB</span>
              </>
            ) : (
              <>
                Drag and drop your video here or click to browse
                <br />
                <span className="text-gray-500 text-xs">MP4, MOV, AVI, MKV, WebM (max 500MB)</span>
              </>
            )}
          </p>
        </div>
      </div>

      {fileName && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Filename</p>
              <p className="text-gray-200 font-mono truncate">{fileName}</p>
            </div>
            <div>
              <p className="text-gray-500">File Size</p>
              <p className="text-gray-200">{fileSize} MB</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFileName('')
              setFileSize('')
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="mt-3 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition"
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3 pt-4">
        <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
          <p className="font-semibold text-blue-400 text-sm">Supported Formats</p>
          <p className="text-gray-300 text-xs mt-1">MP4, MOV, AVI, MKV, WebM</p>
        </div>
        <div className="bg-purple-900/20 border border-purple-700 rounded p-3">
          <p className="font-semibold text-purple-400 text-sm">Max File Size</p>
          <p className="text-gray-300 text-xs mt-1">500 MB per video</p>
        </div>
      </div>
    </div>
  )
}
