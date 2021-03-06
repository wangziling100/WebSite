module.exports = {
  purge: ['./components/**/*.js', './pages/**/*.js'],
  variants: {
    borderColor: ['responsive', 'hover', 'focus'],
  },
  theme: {
    extend: {
      colors: {
        'accent-1': '#FAFAFA',
        'accent-2': '#EAEAEA',
        'accent-7': '#333',
        success: '#0070f3',
        cyan: '#79FFE1',
      },
      spacing: {
        28: '7rem',
      },
      letterSpacing: {
        tighter: '-.04em',
      },
      lineHeight: {
        tight: 1.2,
      },
      fontSize: {
        '5xl': '2.5rem',
        '6xl': '2.75rem',
        '7xl': '4.5rem',
        '8xl': '6.25rem',
      },
      boxShadow: {
        small: '0 5px 10px rgba(0, 0, 0, 0.12)',
        medium: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      transitionDelay: {
        '2000': '2000ms',
        '3000': '3000ms',
        '4000': '4000ms',
      },
      height:{
        '2/5': '40%',
        '3/5': '60%',
        '2/7': '28.57%',
      },
    },
  },
}
