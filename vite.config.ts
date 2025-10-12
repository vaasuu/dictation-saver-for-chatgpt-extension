import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: 'src/background.ts',
        content: 'src/content.ts',
        popup: 'popup.html',
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
