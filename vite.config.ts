import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
<<<<<<< HEAD
=======
import { componentTagger } from "lovable-tagger";
>>>>>>> 6c63f50 (sign in)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
<<<<<<< HEAD
  ],
=======
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
>>>>>>> 6c63f50 (sign in)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
<<<<<<< HEAD

=======
>>>>>>> 6c63f50 (sign in)
