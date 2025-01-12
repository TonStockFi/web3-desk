import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    build: {
        // minify: false,
        // terserOptions: {
        //     compress: false,
        //     mangle: false
        // },
        // outDir: '../android/app/src/main/assets', // Specify Android assets folder
        emptyOutDir: true // Clears the output directory before building
    },
    plugins: [react()],
    server: {
        host: '0.0.0.0'
    }
});
