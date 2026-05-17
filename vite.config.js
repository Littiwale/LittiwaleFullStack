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
        server.middlewares.use((req, res, next) => {
          const rewrites = {
            '/': '/customer/index.html',
            '/index': '/customer/index.html',
            '/menu': '/customer/menu.html',
            '/track': '/customer/track.html',
            '/checkout': '/customer/checkout.html',
            '/login': '/login.html',
            '/admin': '/admin/index.html',
            '/rider': '/rider/index.html',
          };

          const url = new URL(req.url, `http://${req.headers.host}`);
          const pathname = url.pathname;

          if (rewrites[pathname]) {
            console.log(`[Vite Rewrite] ${pathname} -> ${rewrites[pathname]}`);
            req.url = rewrites[pathname] + url.search;
          }
          next();
        });
      },
    },
  ],
});
