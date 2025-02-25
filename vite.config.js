import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [
        vue(),
    ],
    build: {
        cssCodeSplit: false, // inline CSS into JS chunk
    },
    resolve: {
        alias: {
            "@": path.resolve( __dirname, "./src" ),
        },
    },
});
