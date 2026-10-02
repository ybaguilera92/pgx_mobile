import { ngNativeWeb } from '@ng-native/web/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [ngNativeWeb()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api/v1': {
        target: 'https://pgxstandalone30163.pgxsoftware.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
