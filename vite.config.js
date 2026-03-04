import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        home: 'home.html',
        blackhole: 'blackhole.html',
        wormhole: 'wormhole.html',
        equations: 'equations.html',
        about: 'about.html'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false
      }
    }
  },
  server: {
    port: 3000,
    open: '/login.html'
  }
});
