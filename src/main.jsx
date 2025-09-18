import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// --- PWA: registrar service worker ---
import { registerSW } from 'virtual:pwa-register'

registerSW({
  immediate: true, // actualiza en cuanto haya nueva versión
})
