import tailwindcssLogical from 'tailwindcss-logical'

import tailwindPlugin from './src/@core/tailwind/plugin'

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  plugins: [tailwindcssLogical, tailwindPlugin],
  theme: {
        extend: {
          colors: {
            primary: '#6E6FE2',
            accent: '#06b6d4',
            bgsoft: '#f7fbff'
          }
        }
      }
}

export default config
