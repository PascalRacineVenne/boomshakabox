import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setTheme } from "@cutoff/audio-ui-react";
import "@cutoff/audio-ui-react/style.css";
import "./index.css";
import App from "./App.tsx";

setTheme({ color: "var(--accent)", roundness: 0.3 });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
