
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { CountUp } from "../components/ui/CountUp";
import { getHomeContent } from "../services/homeService";
import { Skeleton, SkeletonText, SkeletonTitle, SkeletonCard, SkeletonButton, SkeletonPill } from "../components/ui/Skeleton";
import SEOHead from "../components/common/SEOHead";
import "../assets/styles/pages/home.css";

// Simplified animations for better performance
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export default function Home() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getHomeContent()
      .then(data => {
        if (!cancelled) {
          setContent(data || {});
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const { heroTitle, heroBadge, heroDescription, stats, notices, features, quickLinks } = content;

  if (loading) {
    return (
      <section className="section" style={{ position: "relative" }}>
        <SEOHead title="Loading... | THE COMPUTING SOCIETY" />
        <div className="welcomeBanner">
          <div style={{ position: "relative", zIndex: 1 }}>
            <SkeletonPill style={{ marginBottom: "1rem" }} />
            <div style={{ marginBottom: "1rem" }}>
              <SkeletonTitle style={{ height: "3.5rem", width: "80%" }} />
              <SkeletonTitle style={{ height: "3.5rem", width: "60%" }} />
            </div>
            <div style={{ maxWidth: 650, marginTop: "1rem" }}>
              <SkeletonText lines={3} />
            </div>
            <div className="heroButtons">
              <SkeletonButton />
              <SkeletonButton />
              <SkeletonButton />
            </div>
            <div className="heroStats">
              {[1, 2, 3].map(i => (
                <div key={i} className="statItem">
                  <Skeleton style={{ height: "2.5rem", width: "4rem", marginBottom: "0.5rem" }} />
                  <Skeleton style={{ height: "1rem", width: "5rem" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hr" />
        <div className="noticeGrid">
          {[1, 2, 3].map(i => (
            <div key={i} className="noticeCard">
              <div className="noticeInner">
                <Skeleton style={{ width: "50px", height: "50px", borderRadius: "12px", marginBottom: "1rem" }} />
                <SkeletonTitle style={{ height: "1.5rem", width: "90%" }} />
                <SkeletonText lines={2} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ position: "relative" }}>
      <SEOHead title="THE COMPUTING SOCIETY" description="THE COMPUTING SOCIETY (TCS) - Department of Computer Science, UAF. Join us for events, workshops, and tech excellence." />

      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        {/* Welcome Banner */}
        <div className="welcomeBanner">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="pill pillRed" style={{ display: "inline-block", marginBottom: "1rem" }}>
              {heroBadge}
            </div>

            <div className="welcomeTitle" style={{ fontSize: "3rem", lineHeight: 1.1 }}>
              <span className="wordThe">{heroTitle?.line1}</span>{" "}
              <span className="wordComputing">{heroTitle?.line2}</span>{" "}
              <span className="wordSociety">{heroTitle?.line3}</span>
            </div>

            <div className="welcomeSubtitle" style={{ maxWidth: 650, marginTop: "1rem" }}>
              {heroDescription}
            </div>

            <div className="heroButtons">
              <Link to="/events"><Button>Explore Events</Button></Link>
              <Link to="/tickets"><Button variant="ghost">Get Tickets</Button></Link>
              <Link to="/programs"><Button variant="ghost">View Programs</Button></Link>
            </div>

            {/* Stats with Count Animation */}
            <div className="heroStats">
              {(stats || []).map((s, i) => (
                <div key={i} className="statItem">
                  <div className="statNumber">
                    <CountUp value={s.number} duration={2000} />
                  </div>
                  <div className="statLabel">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hr" />

        {/* Notice Cards - Clickable */}
        <div className="noticeGrid">
          {(notices || []).map((n, index) => {
            // Determine navigation path based on notice type
            const getPath = () => {
              const title = n.title?.toLowerCase() || "";
              if (title.includes("announcement")) return "/announcements";
              if (title.includes("event")) return "/events";
              if (title.includes("ticket")) return "/tickets";
              return n.link || "/";
            };

            return (
              <Link key={n.id || index} to={getPath()} style={{ textDecoration: "none" }}>
                <div className="noticeCard" style={{ cursor: "pointer" }}>
                  <div className="noticeInner">
                    <div className="noticeIcon" style={{ background: n.gradient }}>
                      {n.icon}
                    </div>
                    <div className="noticeTitle">{n.title}</div>
                    <div className="noticeMeta">{n.meta}</div>
                    <div className="noticeActions">
                      <span className="btn btnPrimary" style={{ padding: ".5rem 1rem", fontSize: ".78rem" }}>Open</span>
                      <span className="btn btnGhost" style={{ padding: ".5rem 1rem", fontSize: ".78rem" }}>Details</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hr" />

        {/* Features */}
        <div>
          <div className="sectionHeader" style={{ marginBottom: "1rem" }}>
            <div>
              <div className="sectionTitle" style={{ fontSize: "1.3rem" }}>What We Offer</div>
              <div className="sectionSubtitle">Programs designed to elevate your skills</div>
            </div>
          </div>

          <div className="featureGrid">
            {(features || []).map((f, idx) => (
              <div key={f.id || idx} className="featureCard">
                <div className="featureIcon">{f.icon}</div>
                <div className="featureTitle">{f.title}</div>
                <div className="featureDesc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hr" />

        {/* Quick Links */}
        <div style={{ textAlign: "center" }}>
          <div className="sectionSubtitle" style={{ marginBottom: "1rem" }}>Quick Access</div>
          <div className="quickLinks" style={{ justifyContent: "center" }}>
            {(quickLinks || []).map((q, i) => (
              <Link key={q.id || i} to={q.path} className="quickLink">
                <span>{q.icon}</span> {q.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
