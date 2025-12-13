import React, { useState } from 'react'

export default function Layout({ children, currentPage, onPageChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: '▤' },
    { id: 'upload', label: 'Upload Video', icon: '⬆' },
    { id: 'camera', label: 'Live Camera', icon: '⚫' },
    { id: 'history', label: 'History', icon: '◼' },
    { id: 'about', label: 'About', icon: 'ℹ' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
    { id: 'help', label: 'Help', icon: '?' }
  ]

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-800 flex items-center gap-3">
            <div className="text-3xl font-bold text-blue-500 flex-shrink-0">▶</div>
            {sidebarOpen && (
              <div>
                <p className="font-bold text-white text-lg">XDVioDet</p>
                <p className="text-xs text-gray-500">Detection System</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id)
                  if (window.innerWidth < 768) setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Sidebar Toggle */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
            >
              <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
              {sidebarOpen && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {navigation.find(n => n.id === currentPage)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">AI-Powered Violence Detection System</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-400">System Status</p>
            <p className="text-green-400 font-semibold">• Online</p>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 px-6 py-4 text-center text-xs text-gray-500">
          <p>XDVioDet © 2024 | Privacy-First Violence Detection | All Rights Reserved</p>
        </footer>
      </div>
    </div>
  )
}
