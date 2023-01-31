/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    backgroundColor: (theme) => theme('colors'),
    borderColor: (theme) => theme('colors'),
    extend: {
      colors: {
        reddarker: '#6A0012',
        reddark: '#A00037',
        redcandydark: '#D81B60',
        redcandylight: '#FF5C8D',
        redlight: '#FF90BD',
        redlighter: '#FFC2EF',
        redblack: '#141414'
      }
    }
  },
  plugins: []
}
