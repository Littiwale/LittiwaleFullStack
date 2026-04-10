import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'login.html'),
        customerHome: resolve(__dirname, 'customer/index.html'),
        customerMenu: resolve(__dirname, 'customer/menu.html'),
        customerTrack: resolve(__dirname, 'customer/track.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        rider: resolve(__dirname, 'rider/index.html'),
      },
    },
  },
});
