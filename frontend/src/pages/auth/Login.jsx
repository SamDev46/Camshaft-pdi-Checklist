import { useState } from "react";
import { Typography, Alert, Box, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseCard } from "../../components/common/BaseCard";
import { BaseButton } from "../../components/common/BaseButton";
import { BaseInput } from "../../components/common/BaseInput";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const role = await login(employeeId, password);
      if (role === ROLES.OPERATOR) navigate(ROUTES.OPERATOR);
      else if (role === ROLES.MANAGER) navigate(ROUTES.MANAGER);
      else if (role === ROLES.ADMIN) navigate(ROUTES.ADMIN);
      else navigate(ROUTES.HOME);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid Employee ID or Password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseCard sx={{ width: "100%", maxWidth: 450, mx: "auto", mt: 10, p: 2 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        CamTrace Login
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <BaseInput
            label="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            autoFocus
          />
          <BaseInput
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />
          <BaseButton 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </BaseButton>
        </Box>
      </form>
    </BaseCard>
  );
};
