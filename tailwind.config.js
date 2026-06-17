/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        terra: '#E8734A',
        forest: '#2C4A3E',
        yellow: '#F5C842',
        cream: '#FDFAF6',
        cream2: '#F2EDE6',
        'app-text': '#1A1A2E',
        gray: '#8A8A9A',
        success: '#4CAF7D',
        error: '#E85D4A',
      },
      fontFamily: {
        'nunito-black': ['Nunito_900Black'],
        'nunito-extrabold': ['Nunito_800ExtraBold'],
        'inter-regular': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
