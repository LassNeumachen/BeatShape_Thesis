import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./index.css";
import App from "./App";
import theme from "./theme";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
);
