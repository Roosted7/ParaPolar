// Tailwind CSS v4 ESM config
// Tailwind CSS v4 ESM config
export default {
  // Tailwind v4: selector strategy to control dark via a `.dark` ancestor
  darkMode: ['selector', '.dark'],
  // Where Tailwind should scan for class names
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
