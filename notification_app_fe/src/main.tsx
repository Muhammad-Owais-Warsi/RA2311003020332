import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./index.css";
import App from "./App.tsx";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#2563eb",
        },
        background: {
            default: "#f5f6f8",
        },
    },
    typography: {
        fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </StrictMode>,
);
