import { neutral } from 'tailwindcss/colors'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Primary colors - deep blues and purples for AI/tech feel
        primary: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#36a3f6',
          500: '#0c87e8',
          600: '#0068c6',
          700: '#0054a3',
          800: '#064886',
          900: '#0a3c70',
          950: '#072548',
        },
      },
    },
  },
  safelist: [
    // Static pill classes
    'inline-block',
    'text-xs',
    'font-semibold',
    'mr-2',
    'px-2.5',
    'py-0.5',
    'rounded-full',
    // Dynamic color classes from pillColorClasses array in index.astro
    'bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-300',
    'bg-green-100', 'text-green-800', 'dark:bg-green-900', 'dark:text-green-300',
    'bg-indigo-100', 'text-indigo-800', 'dark:bg-indigo-900', 'dark:text-indigo-300',
    'bg-pink-100', 'text-pink-800', 'dark:bg-pink-900', 'dark:text-pink-300',
    'bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900', 'dark:text-yellow-300',
    'bg-purple-100', 'text-purple-800', 'dark:bg-purple-900', 'dark:text-purple-300',
    'bg-red-100', 'text-red-800', 'dark:bg-red-900', 'dark:text-red-300',
    'bg-gray-600', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-300',
  'bg-neutral-900',
  'text-neutral-200',
  ],
  plugins: [],
}