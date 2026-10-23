import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

// Allow React JSX syntax in .js files as requested.
const jsxInJs = {
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!/\/src\/.*\.js$/.test(id)) return null;
    return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
  }
};

export default defineConfig({
  plugins: [jsxInJs, react()],
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
  server: { port: 5173 }
});
