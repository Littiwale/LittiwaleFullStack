import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        customerHome: resolve(__dirname, 'customer/index.html'),
        customerMenu: resolve(__dirname, 'customer/menu.html'),
        customerTrack: resolve(__dirname, 'customer/track.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        rider: resolve(__dirname, 'rider/index.html'),
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  /**
   * Dev-server URL rewrites.
   * Maps clean paths → actual HTML files so navigation links
   * like window.location.href = '/admin' work correctly in dev.
   */
  plugins: [
    tailwindcss(),
    {
      name: 'html-path-rewrites',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            const rewrites = {
              '/login':    '/login.html',
              '/admin':    '/admin/index.html',
              '/rider':    '/rider/index.html',
              '/customer': '/customer/index.html',
              '/menu':     '/customer/menu.html',
              '/track':    '/customer/track.html',
            };

            const pathname = req.url.split('?')[0];
            const isHtmlNavigation = req.headers.accept?.includes('text/html');
            const isInternalViteRequest = req.url.includes('html-proxy') || req.url.startsWith('/@vite');

            if (req.method === 'GET' && isHtmlNavigation && !isInternalViteRequest && rewrites[pathname]) {
              req.url = rewrites[pathname] + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
            }
            next();
          });
        };
      },
    },
  ],
});
