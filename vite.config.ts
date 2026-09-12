import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@expo\/vector-icons(\/.*)?$/,
        replacement: path.resolve(__dirname, 'src/components/ExpoVectorIconsWeb.tsx'),
      },
      {
        find: /^react-native-vector-icons(\/.*)?$/,
        replacement: path.resolve(__dirname, 'src/components/ExpoVectorIconsWeb.tsx'),
      },
      {
        find: /^react-native\/Libraries\/Utilities\/codegenNativeComponent$/,
        replacement: path.resolve(__dirname, 'src/components/emptyModule.ts'),
      },
      {
        find: /^react-native$/,
        replacement: 'react-native-web',
      },
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
      ],
    },
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
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
