
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Loader from "./components/common/Loader";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [booting, setBooting] = useState(true);
  const location = useLocation();

  // Preloader time = 2 seconds
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (booting) return <Loader />;

  return (
    <ErrorBoundary>
      <div className="layout">
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
          <Footer />
        </main>
      </div>
    </ErrorBoundary>
  );
}
