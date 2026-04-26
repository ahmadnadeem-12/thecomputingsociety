
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import { ThemeProvider } from "./context/ThemeContext";

import { ModalProvider } from "./context/ModalContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ModalProvider>
        <AuthProvider>
          <EventProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <App />
            </BrowserRouter>
          </EventProvider>
        </AuthProvider>
      </ModalProvider>
    </ThemeProvider>
  </React.StrictMode>
);
