import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

export default defineConfig({
  root: './',
  base: '/Black-hole/',
  publicDir: 'public',
  server: {
    host: true,
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    rollupOptions: {
      input: {
        index: resolve(projectRoot, 'index.html'),
        home: resolve(projectRoot, 'home.html'),
        astronomy: resolve(projectRoot, 'src/pages/astronomy.html'),
        physicsEducation: resolve(projectRoot, 'src/pages/physics-education.html'),
        advancedViz: resolve(projectRoot, 'src/pages/advanced-viz.html'),
        interactiveTools: resolve(projectRoot, 'src/pages/interactive-tools.html'),
        immersive: resolve(projectRoot, 'src/pages/immersive.html'),
        dataIntegration: resolve(projectRoot, 'src/pages/data-integration.html'),
        socialCommunity: resolve(projectRoot, 'src/pages/social-community.html'),
        settings: resolve(projectRoot, 'src/pages/settings.html'),
        physicsCalculator: resolve(projectRoot, 'src/pages/physics-calculator.html'),
        spaceMonitoring: resolve(projectRoot, 'src/pages/space-monitoring.html')
      }
    }
  }
});
