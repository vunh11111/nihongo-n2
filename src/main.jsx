import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

// __ROUTER__ được đặt trong vite.config.js ("browser" khi deploy, "memory" cho bản xem thử 1 file)
const Router = __ROUTER__ === "memory" ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
