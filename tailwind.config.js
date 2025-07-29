/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
	  "./pages/**/*.{js,ts,jsx,tsx}",
	  "./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
	  extend: {
		colors: {
		  tovybg: "#FF0099",
		  orbit: "#FF0099",
		  primary: 'rgb(var(--group-theme) / <alpha-value>)',
		  // Modern color palette
		  gray: {
			50: '#fafafa',
			100: '#f5f5f5',
			200: '#e5e5e5',
			300: '#d4d4d4',
			400: '#a3a3a3',
			500: '#737373',
			600: '#525252',
			700: '#404040',
			800: '#262626',
			900: '#171717',
			950: '#0a0a0a',
		  },
		},
		backgroundImage: theme => ({
		  'infobg-light': "url('/orbitbackground-light.svg')",
		  'infobg-dark': "url('/orbitbackground-dark.svg')",
		  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
		  'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
		}),
		animation: {
		  'fade-in': 'fadeIn 0.5s ease-in-out',
		  'slide-up': 'slideUp 0.3s ease-out',
		  'slide-down': 'slideDown 0.3s ease-out',
		  'scale-in': 'scaleIn 0.2s ease-out',
		  'bounce-gentle': 'bounceGentle 2s infinite',
		},
		keyframes: {
		  fadeIn: {
			'0%': { opacity: '0' },
			'100%': { opacity: '1' },
		  },
		  slideUp: {
			'0%': { transform: 'translateY(10px)', opacity: '0' },
			'100%': { transform: 'translateY(0)', opacity: '1' },
		  },
		  slideDown: {
			'0%': { transform: 'translateY(-10px)', opacity: '0' },
			'100%': { transform: 'translateY(0)', opacity: '1' },
		  },
		  scaleIn: {
			'0%': { transform: 'scale(0.95)', opacity: '0' },
			'100%': { transform: 'scale(1)', opacity: '1' },
		  },
		  bounceGentle: {
			'0%, 100%': { transform: 'translateY(0)' },
			'50%': { transform: 'translateY(-5px)' },
		  },
		},
		boxShadow: {
		  'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
		  'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
		  'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
		  'glow': '0 0 20px rgba(255, 0, 153, 0.3)',
		},
		borderRadius: {
		  'xl': '0.75rem',
		  '2xl': '1rem',
		  '3xl': '1.5rem',
		},
		spacing: {
		  '18': '4.5rem',
		  '88': '22rem',
		  '128': '32rem',
		},
		fontFamily: {
		  sans: ['Inter', 'system-ui', 'sans-serif'],
		},
		backdropBlur: {
		  xs: '2px',
		},
	  },
	},
	plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
  };
  