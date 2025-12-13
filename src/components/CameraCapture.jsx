import React, { useRef, useState } from 'react'
import { uploadVideo, convertBlobToVideo } from '../utils/api'

export default function CameraCapture({ onResultsReceived, onLoading, onError }) {
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const timerRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const MAX_RECORDING_TIME = 60

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      })
      
      videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch (error) {
      onError?.(`Camera access denied: ${error.message}`)
    }
  }

  const stopCamera = () => {
    const tracks = videoRef.current?.srcObject?.getTracks()
    tracks?.forEach(track => track.stop())
    setCameraActive(false)
    setIsRecording(false)
    setRecordingTime(0)
  }

  const startRecording = () => {
    const stream = videoRef.current?.srcObject
    if (!stream) return

    const chunks = []
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    })

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const file = await convertBlobToVideo(blob)
      
      onLoading(true)
      try {
        const results = await uploadVideo(file)
        results.filename = `camera-${Date.now()}.webm`
        results.timestamp = new Date().toISOString()
        onResultsReceived(results)
      } catch (error) {
        onError?.(error.message || 'Analysis failed')
      } finally {
        onLoading(false)
      }
      
      setRecordingTime(0)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
    setRecordingTime(0)

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_TIME - 1) {
          stopRecording()
          clearInterval(timerRef.current)
          return MAX_RECORDING_TIME
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const formatTime = (seconds) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-black rounded-lg overflow-hidden relative aspect-video border border-gray-700">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            REC {formatTime(recordingTime)}
          </div>
        )}

        {cameraActive && !isRecording && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded font-semibold">
            CAMERA READY
          </div>
        )}
      </div>

      <div className="space-y-3">
        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition"
          >
            Start Camera
          </button>
        ) : (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 rounded-lg transition"
              >
                Stop & Analyze ({formatTime(recordingTime)})
              </button>
            )}
            
            <button
              onClick={stopCamera}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Close Camera
            </button>
          </>
        )}
      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded p-4">
        <p className="text-sm text-blue-300">
          <strong>Recording Tips:</strong> Keep videos between 5-15 seconds for best accuracy. Maximum: 60 seconds.
        </p>
      </div>
    </div>
  )
}
