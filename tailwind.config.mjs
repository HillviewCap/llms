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
        // Secondary colors - teals and cyans for accents
        secondary: {
          50: '#f0fcfc',
          100: '#d0f7f8',
          200: '#a4eef1',
          300: '#67e0e6',
          400: '#2ccad5',
          500: '#14adb9',
          600: '#108a9c',
          700: '#136f80',
          800: '#155b69',
          900: '#164b59',
          950: '#07323c',
        },
        // Accent colors - purples for highlights
        accent: {
          50: '#f5f3ff',
          100: '#ede8ff',
          200: '#dcd5fe',
          300: '#c3b5fd',
          400: '#a48afb',
          500: '#8a5cf5',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Neutral colors - slate grays with blue undertones
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
    },
  },
  plugins: [],
}