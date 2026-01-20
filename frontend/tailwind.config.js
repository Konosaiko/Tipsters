/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Raw palette colors from design
        'rich-black': '#001F15',        // Very dark green-tinted black
        'dark-gray': '#023221',         // Dark teal-gray
        'bangladesh': '#03624C',        // Deep teal
        'mountain-meadow': '#2CC295',   // Medium bright teal
        'caribbean': '#00DF81',         // Bright accent green
        'anti-flash': '#F1F7F6',        // Off-white
        'pine': '#06202B',
        'basil': '#0B453A',
        'forest': '#095544',
        'frog': '#178F6D',
        'mint': '#47A95C',
        'stone': '#707D7D',
        'pistachio': '#AACBC4',

        // Semantic color scales for component use
        primary: {
          50: '#E6FFF5',
          100: '#CCFFEB',
          200: '#99FFD6',
          300: '#66FFC2',
          400: '#33FFAD',
          500: '#00DF81',  // Caribbean Green - main brand
          600: '#00B368',
          700: '#00864E',
          800: '#005A34',
          900: '#003D23',
          950: '#001F11',
        },
        neutral: {
          50: '#F1F7F6',   // Anti-flash white
          100: '#E5EFED',
          200: '#AACBC4',  // Pistachio
          300: '#8AB8AF',
          400: '#6AA59A',
          500: '#707D7D',  // Stone
          600: '#5A6565',
          700: '#424B4B',
          800: '#2C3535',
          900: '#023221',  // Dark gray
          950: '#001F15',  // Rich black
        },
        success: {
          50: '#E8F5F0',
          100: '#C8E8DC',
          200: '#91D1B8',
          300: '#5DB894',
          400: '#47A95C',  // Mint
          500: '#178F6D',  // Frog
          600: '#127455',
          700: '#0D593F',
          800: '#095544',  // Forest
          900: '#043020',
        },
      },
    },
  },
  plugins: [],
}
