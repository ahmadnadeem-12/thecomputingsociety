
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
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AdminTickets = lazy(() => import("../pages/admin/AdminTickets"));
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

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
