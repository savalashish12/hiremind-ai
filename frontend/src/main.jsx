import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";

import AuthProvider from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <AuthProvider>
      <NotificationProvider>
        <Toaster
          position="top-right"
        />

        <App />
      </NotificationProvider>
    </AuthProvider>

  </React.StrictMode>
);