import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";
import { setupMocks } from "@/api/mocks";
import { initGA } from "@/utils/analytics";

if (import.meta.env.DEV) {
  setupMocks();
}

initGA();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
