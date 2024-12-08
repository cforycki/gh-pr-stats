import react from '@vitejs/plugin-react';
import {defineConfig} from "vite";

export default defineConfig({
    server: {
        port: 8080
    },
    build: {
        plugins: [react()]
    },
    esbuild: {
        jsx: "automatic"
    },
    appType: 'spa',
    base: '/',
})