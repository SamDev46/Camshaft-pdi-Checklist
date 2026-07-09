import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#005587", // Cummins Blue
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#424242",
      contrastText: "#ffffff"
    },
    background: {
      default: "#ffffff",
      paper: "#f8f9fa"
    },
    text: {
      primary: "#212121",
      secondary: "#616161"
    },
    error: {
      main: "#d32f2f"
    },
    success: {
      main: "#2e7d32"
    }
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "8px 24px",
          borderRadius: "8px"
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e0e0e0"
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "12px",
          padding: "16px"
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          padding: "24px"
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #e0e0e0"
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#f8f9fa"
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
        size: "medium"
      }
    }
  }
});
