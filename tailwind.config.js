module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        violence: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c'
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      }
    }
  },
  plugins: []
}
