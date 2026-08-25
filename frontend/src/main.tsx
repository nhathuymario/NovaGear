import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "sonner";
import GlobalLoading from "./components/ui/GlobalLoading";
import ConfirmDialog from "./components/ui/ConfirmDialog";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster position="top-right" richColors />
            <GlobalLoading />
            <ConfirmDialog />
        </BrowserRouter>
    </React.StrictMode>
);