import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";

const queryClient = new QueryClient();

const toastOptions = {
  style: {
    background: "#171c22",
    color: "#e8ebee",
    border: "1px solid rgba(255,255,255,0.09)",
    fontSize: "0.875rem",
  },
  success: { iconTheme: { primary: "#17b399", secondary: "#171c22" } },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <App />
            <Toaster position="bottom-right" toastOptions={toastOptions} />
          </AuthProvider>
        </MotionConfig>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
