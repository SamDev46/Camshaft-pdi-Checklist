import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export const NavigationShell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isOperator = user?.role === "OPERATOR";
  const isManager = user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";
  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: "pointer" }} onClick={() => {
            if (isOperator) navigate(ROUTES.OPERATOR_DASHBOARD);
            else if (isManager) navigate(ROUTES.MANAGER_DASHBOARD);
            else if (isAdmin) navigate(ROUTES.ADMIN_DASHBOARD);
          }}>
            <img src="/cummins.png" alt="Cummins Logo" style={{ height: 40, marginRight: 16, objectFit: 'contain' }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Camshaft Pre-Dispatch Inspection
            </Typography>
          </Box>
          {isOperator && (
            <Box sx={{ display: "flex", gap: 2, mr: 4 }}>
                <Button color="inherit" variant={location.pathname === ROUTES.OPERATOR_DASHBOARD ? "outlined" : "text"} onClick={() => navigate(ROUTES.OPERATOR_DASHBOARD)}>
                    Dashboard
                </Button>
            </Box>
          )}

          {isManager && (
            <Box sx={{ display: "flex", gap: 2, mr: 4 }}>
                <Button color="inherit" variant={location.pathname === ROUTES.MANAGER_DASHBOARD ? "outlined" : "text"} onClick={() => navigate(ROUTES.MANAGER_DASHBOARD)}>
                    Dashboard
                </Button>
                <Button color="inherit" variant={location.pathname === ROUTES.MANAGER_MONITOR ? "outlined" : "text"} onClick={() => navigate(ROUTES.MANAGER_MONITOR)}>
                    Monitor
                </Button>
                <Button color="inherit" variant={location.pathname === ROUTES.MANAGER_CHECKLIST ? "outlined" : "text"} onClick={() => navigate(ROUTES.MANAGER_CHECKLIST)}>
                    Checklists
                </Button>
            </Box>
          )}

          {isAdmin && (
            <Box sx={{ display: "flex", gap: 2, mr: 4 }}>
                <Button color="inherit" variant={location.pathname === ROUTES.ADMIN_DASHBOARD ? "outlined" : "text"} onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}>
                    Dashboard
                </Button>
                <Button color="inherit" variant={location.pathname === ROUTES.ADMIN_USERS ? "outlined" : "text"} onClick={() => navigate(ROUTES.ADMIN_USERS)}>
                    Users
                </Button>
                <Button color="inherit" variant={location.pathname.startsWith(ROUTES.MANAGER_MONITOR) ? "outlined" : "text"} onClick={() => navigate(ROUTES.MANAGER_MONITOR)}>
                    Monitor
                </Button>
                <Button color="inherit" variant={location.pathname === ROUTES.ADMIN_AUDIT ? "outlined" : "text"} onClick={() => navigate(ROUTES.ADMIN_AUDIT)}>
                    Audit Log
                </Button>
            </Box>
          )}

          {user && (
              <Button color="inherit" onClick={logout} variant="outlined" sx={{ ml: 2 }}>
                Logout
              </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f5" }}>{children}</Box>
    </Box>
  );
};
