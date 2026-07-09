import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { NavigationShell } from "../layouts/NavigationShell";
import { Box, CircularProgress } from "@mui/material";

const Login = lazy(() => import("../pages/auth/Login").then(module => ({ default: module.Login })));
const Unauthorized = lazy(() => import("../pages/auth/Unauthorized").then(module => ({ default: module.Unauthorized })));
const NotFound = lazy(() => import("../pages/NotFound").then(module => ({ default: module.NotFound })));
const OperatorDashboard = lazy(() => import("../pages/operator/OperatorDashboard").then(module => ({ default: module.OperatorDashboard })));
const Inspection = lazy(() => import("../pages/operator/Inspection").then(module => ({ default: module.Inspection })));
const InspectionReview = lazy(() => import("../pages/operator/Review").then(module => ({ default: module.Review })));
const ManagerDashboard = lazy(() => import("../pages/manager/ManagerDashboard").then(module => ({ default: module.ManagerDashboard })));
const InspectionMonitor = lazy(() => import("../pages/manager/InspectionMonitor").then(module => ({ default: module.InspectionMonitor })));
const InspectionDetails = lazy(() => import("../pages/manager/InspectionDetails").then(module => ({ default: module.InspectionDetails })));
const ChecklistManager = lazy(() => import("../pages/manager/ChecklistManager").then(module => ({ default: module.ChecklistManager })));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const UserManager = lazy(() => import("../pages/admin/UserManager").then(module => ({ default: module.UserManager })));
const AuditLog = lazy(() => import("../pages/admin/AuditLog").then(module => ({ default: module.AuditLog })));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{display:"flex", height:"100vh", alignItems:"center", justifyContent:"center"}}><CircularProgress/></Box>;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "OPERATOR" ? ROUTES.OPERATOR_DASHBOARD : user.role === "MANAGER" ? ROUTES.MANAGER_DASHBOARD : ROUTES.ADMIN_DASHBOARD} replace />;
  }
  return <NavigationShell>{children}</NavigationShell>;
};

const LazyLoader = ({ children }) => (
  <Suspense fallback={<Box sx={{display:"flex", height:"100vh", alignItems:"center", justifyContent:"center"}}><CircularProgress/></Box>}>
    {children}
  </Suspense>
);

export const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path={ROUTES.LOGIN} element={<LazyLoader><Login /></LazyLoader>} />
        
        {/* Operator Routes */}
        <Route path={ROUTES.OPERATOR_DASHBOARD} element={<ProtectedRoute allowedRoles={["OPERATOR"]}><LazyLoader><OperatorDashboard /></LazyLoader></ProtectedRoute>} />
        <Route path={ROUTES.OPERATOR_INSPECTION} element={<ProtectedRoute allowedRoles={["OPERATOR"]}><LazyLoader><Inspection /></LazyLoader></ProtectedRoute>} />
        <Route path={ROUTES.OPERATOR_REVIEW} element={<ProtectedRoute allowedRoles={["OPERATOR"]}><LazyLoader><InspectionReview /></LazyLoader></ProtectedRoute>} />

        {/* Manager Routes */}
        <Route path={ROUTES.MANAGER_DASHBOARD} element={<ProtectedRoute allowedRoles={["MANAGER"]}><LazyLoader><ManagerDashboard /></LazyLoader></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_MONITOR} element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><LazyLoader><InspectionMonitor /></LazyLoader></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_INSPECTION_DETAILS} element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><LazyLoader><InspectionDetails /></LazyLoader></ProtectedRoute>} />
        <Route path={ROUTES.MANAGER_CHECKLIST} element={<ProtectedRoute allowedRoles={["MANAGER"]}><LazyLoader><ChecklistManager /></LazyLoader></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute allowedRoles={["ADMIN"]}><LazyLoader><AdminDashboard /></LazyLoader></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute allowedRoles={["ADMIN"]}><LazyLoader><UserManager /></LazyLoader></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN_AUDIT} element={<ProtectedRoute allowedRoles={["ADMIN"]}><LazyLoader><AuditLog /></LazyLoader></ProtectedRoute>} />

        <Route path="/403" element={<LazyLoader><Unauthorized /></LazyLoader>} />
        <Route path="*" element={<LazyLoader><NotFound /></LazyLoader>} />
      </Routes>
    </AuthProvider>
  );
};
