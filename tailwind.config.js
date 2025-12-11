/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './templates/**/*.html',
        './core/**/*.py'
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                preh: {
                    green: '#cfdb00',
                    petrol: '#004c63',
                    'petrol-dark': '#003342', // Darker shade for hover states
                    'light-blue': '#00b5e2',
                    gray: '#8f8f8f',
                    'light-gray': '#f5f5f5',
                    'dark-surface': '#1a2c35', // Dark mode surface
                    'dark-border': '#2a4c5a'   // Dark mode borders
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-in': 'slideIn 0.3s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            }
        },
    },
    plugins: [],
}
