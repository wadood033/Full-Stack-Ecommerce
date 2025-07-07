/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // adjust this path to your project structure
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-poppins)',
  				'sans-serif'
  			]
  		},
  		spacing: {
  			'13': '3.25rem',
  			'14': '3.5rem',
  			'15': '3.75rem',
  			'17': '4.25rem',
  			'18': '4.5rem',
  			'19': '4.75rem',
	   21: '5.25rem', // 84px
        22: '5.5rem',  // 88px
        23: '5.75rem', // 92px
        24: '6rem',   
        25: '6.25rem',
        26: '6.5rem',
        27: '6.75rem',
        28: '7rem',
        29: '7.25rem',
        30: '7.5rem',
		 40: '10rem',    // 160px
        41: '10.25rem', // 164px
        42: '10.5rem',  // 168px
        43: '10.75rem', // 172px
        44: '11rem',    // 176px
        45: '11.25rem', // 180px
        46: '11.5rem',  // 184px
        47: '11.75rem', // 188px
        48: '12rem',    // 192px
        49: '12.25rem', // 196px
        50: '12.5rem',  // 200px
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
