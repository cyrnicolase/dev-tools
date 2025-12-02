/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 背景色
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'input': 'var(--bg-input)',
        'input-disabled': 'var(--bg-input-disabled)',
        'hover': 'var(--hover-bg)',
        'active-bg': 'var(--active-bg)',
        'error-bg': 'var(--error-bg)',
        'button-secondary': 'var(--button-secondary-bg)',
        // 文本颜色
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-input': 'var(--text-input)',
        'active-text': 'var(--active-text)',
        'link': 'var(--link)',
        'error-text': 'var(--error-text)',
        'button-secondary-text': 'var(--button-secondary-text)',
        // 边框颜色
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-input': 'var(--border-input)',
      },
    },
  },
  plugins: [],
}

