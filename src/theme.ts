import { createTheme } from "@mui/material/styles";

export const appColors = {
  black: "#1e1e1e",
  pausedBall: "#6d6a64",
  lightBlack: "rgba(30,30,30,0.55)",
  grey: "#cccac5",
  yellow: "#eccb67",
  green: "#A3a64b",
  red: "#e8612f",
  lightRed: "rgba(232,97,47,0.15)",
  blue: "#244f8f",
  lightBlue: "#5284aa",
  lightPurple: "#af9fb7",
  purple: "#9782ae",
  darkpurple: "#312046",
  orange: "#F2921d",
  background: "#F2EBDCFF",
  background2: "#e9e3d6",
  createDialogColor: "#A3a64b",
  glowColor: "#FFFFFF",
  white: "#F4EFE9",
};

export const theme = createTheme({
  palette: {
    common: {
      black: appColors.black,
    },
    text: {
      primary: appColors.black,
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',

    h1: {
      //Logo
      fontFamily: '"Staatliches", sans-serif',
      fontSize: "65px",
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: '"Staatliches", sans-serif',
      fontSize: "32px",
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: 0,
    },
    h3: {
      fontFamily: '"Staatliches", sans-serif',
      fontSize: "24px",
      fontWeight: 400,
      lineHeight: 1.05,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: '"Staatliches", sans-serif',
      fontSize: "20px",
      fontWeight: 400,
      lineHeight: 1.1,
      letterSpacing: 0,
    },
    h5: {
      fontFamily: '"Staatliches", sans-serif',
      fontSize: "18px",
      fontWeight: 400,
      lineHeight: 1.1,
      letterSpacing: 0,
    },
    h6: {
      fontFamily: '"Staatliches", sans-serif',
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: 1.1,
      letterSpacing: 0,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: 1.45,
      letterSpacing: 0,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "12px",
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    button: {
      fontFamily: '"Staatliches", sans-serif',
      fontSize: "18px",
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: 0,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: `${appColors.black} transparent`,
        },
        "*::-webkit-scrollbar": {
          width: 8,
          height: 8,
        },
        "*::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: appColors.black,
          borderRadius: 0,
        },
        "*::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#333",
        },
        "*::-webkit-scrollbar-corner": {
          backgroundColor: "transparent",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: "none",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Staatliches", sans-serif',
          fontSize: "18px",
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: 0,
          textTransform: "none",
          borderRadius: 0,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Staatliches", sans-serif',
          fontSize: "32px",
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: 0,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        valueLabelLabel: {
          fontFamily: '"Inter", sans-serif',
          fontSize: "12px",
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: 0,
        },
        markLabel: {
          fontFamily: '"Inter", sans-serif',
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: 0,
        },
      },
    },
  },
});

export default theme;
