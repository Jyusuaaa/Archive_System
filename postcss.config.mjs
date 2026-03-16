/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
};

export default {
  plugins: {
    // This plugin is what makes @apply and @theme work
    '@tailwindcss/postcss': {},
  },
};
