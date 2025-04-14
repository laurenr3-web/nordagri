import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'agri-dark': '#0f3520',
				'agri-dark-hover': '#13402a',
				'agri-primary': '#2d9d64',
				'agri-secondary': '#76ae8e',
				'agri-light': '#a6c9b5',
				'alert-red': '#E53935',
				'alert-orange': '#FF9800',
				'bg-light': '#F5F7FA',
				'card-white': '#FFFFFF',
				agri: {
					'50': '#f0f9f4',
					'100': '#ddf2e4',
					'200': '#bfe5cb',
					'300': '#93d0a8',
					'400': '#65b481',
					'500': '#429964',
					'600': '#317c4f',
					'700': '#286442',
					'800': '#235037',
					'900': '#1d432f',
					'950': '#0b251a',
				},
				harvest: {
					'50': '#fefaec',
					'100': '#fcf4ce',
					'200': '#f9e68f',
					'300': '#f6d551',
					'400': '#f4c326',
					'500': '#e7a912',
					'600': '#cd840e',
					'700': '#a35f0f',
					'800': '#874b15',
					'900': '#723e17',
					'950': '#422008',
				},
				soil: {
					'50': '#faf6f1',
					'100': '#f5ebe0',
					'200': '#e9d3ba',
					'300': '#deba93',
					'400': '#cc9460',
					'500': '#c17f46',
					'600': '#b16a3b',
					'700': '#935333',
					'800': '#76432d',
					'900': '#613827',
					'950': '#341c14',
				}
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)',
				xl: 'var(--radius-xl)',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
				'neo': '5px 5px 10px rgba(163, 177, 198, 0.15), -5px -5px 10px rgba(255, 255, 255, 0.6)',
				'subtle': '0 2px 10px rgba(0, 0, 0, 0.05)',
				'elevated': '0 10px 30px rgba(0, 0, 0, 0.08)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-in-left': {
					'0%': {
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'count-up': {
					'0%': { 'content': '"0"' },
					'20%': { 'content': '"1"' },
					'40%': { 'content': '"2"' },
					'60%': { 'content': '"3"' },
					'80%': { 'content': '"4"' },
					'100%': { 'content': '"5"' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'fade-out': 'fade-out 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'slide-in-left': 'slide-in-left 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'count-up': 'count-up 2s linear forwards',
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
				'width': 'width',
				'size': 'height, width',
			},
			transitionDuration: {
				'fast': 'var(--animation-fast)',
				'normal': 'var(--animation-normal)',
				'slow': 'var(--animation-slow)',
			},
			transitionTimingFunction: {
				'bounce-in': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
				'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			},
			scale: {
				'102': '1.02',
				'103': '1.03',
				'105': '1.05',
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(135deg, #2d9d64 0%, #76ae8e 100%)',
				'gradient-subtle': 'linear-gradient(to bottom, #ffffff, #f9fafb)',
				'gradient-sidebar': 'linear-gradient(180deg, #0f3520 0%, #0a2a19 100%)',
			}
		}
	},
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
