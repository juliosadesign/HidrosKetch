import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Configuração principal do Vite.
// Nesta Sprint, usamos apenas React e Tailwind.
// Nada de cálculo hidráulico ainda.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});