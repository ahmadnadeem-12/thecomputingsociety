
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Lazy load all pages for code splitting
const Home = lazy(() => import("../pages/Home"));
const Cabinet = lazy(() => import("../pages/Cabinet"));
const Faculty = lazy(() => import("../pages/Faculty"));
const Events = lazy(() => import("../pages/Events"));
const EventDetails = lazy(() => import("../pages/EventDetails"));
const Announcements = lazy(() => import("../pages/Announcements"));
const Programs = lazy(() => import("../pages/Programs"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Tickets = lazy(() => import("../pages/Tickets"));
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AdminTickets = lazy(() => import("../pages/admin/AdminTickets"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const CertificatePreview = lazy(() => import("../pages/CertificatePreview"));
const Profile = lazy(() => import("../pages/Profile"));
const VerifyEmailNotice = lazy(() => import("../pages/VerifyEmailNotice"));
const VerifySuccess = lazy(() => import("../pages/VerifySuccess"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Loading fallback component
function PageLoader() {
  return <LoadingSpinner size="lg" text="Loading..." fullPage={false} />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/cabinet" element={<Cabinet />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/profile" element={
          <ProtectedRoute requireVerified={false}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/certificate-preview" element={<CertificatePreview />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-success" element={<VerifySuccess />} />
        <Route path="/verify-email" element={<VerifyEmailNotice />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true} redirectTo="/admin/login">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute requireAdmin={true} redirectTo="/admin/login">
              <AdminTickets />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
