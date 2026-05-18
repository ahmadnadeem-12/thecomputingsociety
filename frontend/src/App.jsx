
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Loader from "./components/common/Loader";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";
import EventSpotlight from "./components/ui/EventSpotlight";

export default function App() {
  const [booting, setBooting] = useState(true);
  const location = useLocation();

  const isAuthPage = location.pathname.includes("/login") || 
                     location.pathname.includes("/register") || 
                     location.pathname.includes("/forgot-password") || 
                     location.pathname.includes("/reset-password");

  // Preloader time = 2 seconds
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Scroll to top on every page transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (booting) return <Loader />;

  return (
    <ErrorBoundary>
      <div className={`layout ${isAuthPage ? "auth-responsive" : ""}`}>
        <Navbar />
        <main className="main" role="main">
          {/* Animated route transitions */}
          <div className="routeWrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <AppRoutes />
              </motion.div>
            </AnimatePresence>
          </div>
          {location.pathname !== "/" && <Footer />}
        </main>
        {location.pathname === "/" && <EventSpotlight />}
      </div>
    </ErrorBoundary>
  );
}
