import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // o seed vive fora da raiz do app: é o mesmo arquivo que o validador testa (D-019)
  server: { fs: { allow: [".."] } },
  build: {
    target: "es2022", // top-level await nas páginas
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        paciente: resolve(__dirname, "paciente.html"),
        profissional: resolve(__dirname, "profissional.html"),
      },
    },
  },
});
