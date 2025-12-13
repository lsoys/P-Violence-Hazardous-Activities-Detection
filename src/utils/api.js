const API_BASE_URL = 'http://127.0.0.1:5000'

export const violenceLabels = {
  alcohol: { color: '#FF6B6B', icon: '🍺' },
  gesture: { color: '#FFA726', icon: '🤚' },
  blood: { color: '#EF5350', icon: '🩸' },
  cigarette: { color: '#AB47BC', icon: '🚬' },
  gun: { color: '#EC407A', icon: '🔫' },
  knife: { color: '#EF5350', icon: '🔪' },
  smoke: { color: '#9575CD', icon: '💨' },
  mob_violence: { color: '#D32F2F', icon: '👥' },
  fight: { color: '#C62828', icon: '👊' },
  explosion: { color: '#FF5722', icon: '💣' },
  shooting: { color: '#E64A19', icon: '🔫' },
  stabbing: { color: '#D84315', icon: '🗡️' },
  threatening_gesture: { color: '#FFA726', icon: '⚠️' },
  car_crash: { color: '#FFB74D', icon: '🚗' },
  physical_assault: { color: '#FF7043', icon: '👊' }
}

export const uploadVideo = async (file) => {
  const formData = new FormData()
  formData.append('video', file)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload-video`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // If can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }
    return await response.json()
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export const getStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Status check error:', error)
    throw error
  }
}

export const getModelInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/model-info`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Model info error:', error)
    throw error
  }
}

export const convertBlobToVideo = (blob) => {
  return new Promise((resolve) => {
    const file = new File([blob], 'camera-video.webm', { type: 'video/webm' })
    resolve(file)
  })
}
