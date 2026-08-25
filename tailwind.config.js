/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b2d5a',     // Primary Navy Blue from Edupay logo/theme
          light: '#f0f4f8',    // Very light blue-gray background for dashboard
          accent: '#1c3d73',   // Accent Slate Blue
          border: '#e2ebf4',   // Page divider / border lines
          textDark: '#1e293b', // Primary text color
          textLight: '#64748b',// Secondary text color
          cardPurple: '#fcecfb', // Purple card for student dashboard
          cardGreen: '#ecfcf3',  // Green card for student dashboard
          cardOrange: '#fdf3ec', // Orange card for student dashboard
          cardBlue: '#ecfafc',   // Blue card for student dashboard
          cardPurpleBorder: '#f0bbf3',
          cardGreenBorder: '#bbf3d2',
          cardOrangeBorder: '#f3d6bb',
          cardBlueBorder: '#bbf0f3',
        }
      }
    },
  },
  plugins: [],
}
