import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 2002,
    proxy: {
      "/api": {
        target: "http://localhost:2806",
      },
    },
  },
  plugins: [react()],
});
