
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { CountUp } from "../components/ui/CountUp";
import { getHomeContent } from "../services/homeService";
import { Skeleton, SkeletonText, SkeletonTitle, SkeletonCard, SkeletonButton, SkeletonPill } from "../components/ui/Skeleton";
import SEOHead from "../components/common/SEOHead";
import HeroSpotlight from "../components/ui/HeroSpotlight";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/pages/home.css";

// Simplified animations for better performance
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export default function Home() {
  const navigate = useNavigate();
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

  const { heroTitle, heroBadge, heroDescription, stats, notices, features, quickLinks: rawQuickLinks } = content;
  const { isAuthed, isAdmin, logout } = useAuth();

  // Dynamic quick links based on auth
  const quickLinks = (rawQuickLinks || []).filter(link => {
    // Hide Admin for regular users if they are logged in
    if (link.label?.toLowerCase().includes("admin") && isAuthed && !isAdmin) return false;
    return true;
  }).map(link => {
    // Change Admin to Logout for regular users (if desired by logic) or just add Logout
    return link;
  });

  // If authed, we might want to add Logout to quick links too if user wants
  // The user said: "un ke jagha par logout ka ajaye button"
  const finalQuickLinks = [...quickLinks];
  const adminIdx = finalQuickLinks.findIndex(l => l.label?.toLowerCase().includes("admin"));

  if (isAuthed) {
    if (!isAdmin && adminIdx !== -1) {
      // Replace Admin with Logout for simple user
      finalQuickLinks[adminIdx] = { id: "logout", label: "Logout", path: "#", isLogout: true };
    } else if (isAdmin) {
      // Keep Admin, but maybe add Logout below? User said "admin ka b wahin raha or us k nicha he logout"
      // But for Quick Access (usually a grid/list), adding at the end is safer.
      finalQuickLinks.push({ id: "logout", label: "Logout", path: "#", isLogout: true });
    }
  }

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
          <div className="heroContentContainer" style={{ position: "relative", zIndex: 1 }}>
            {/* Desktop Top Badge */}
            <div className="desktopOnly heroSubtitleDesktop">
              OFFICIAL SOCIETY • DEPT. OF COMPUTER SCIENCE • UAF
            </div>

            {/* Desktop Title - 3 Lines (Refined Weight 600) */}
            <div className="heroTitle desktopOnly" style={{
              fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
              lineHeight: "0.95",
              marginBottom: "1.5rem",
              fontWeight: "700",
              letterSpacing: "-0.02em"
            }}>
              <div style={{ color: "var(--accent-red)" }}>THE</div>
              <div style={{ color: "var(--accent-pink)" }}>COMPUTING</div>
              <div style={{ color: "#00d9ff", filter: "drop-shadow(0 0 15px rgba(0, 217, 255, 0.3))" }}>SOCIETY</div>
            </div>

            <div className="heroDescription desktopOnly" style={{
              maxWidth: "600px",
              textAlign: "left",
              fontSize: "1.3rem",
              lineHeight: "1.8",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "2rem",
              fontWeight: "500"
            }}>
              The official hub for Computer Science excellence at UAF.
              We bridge the gap between academic learning and industry
              demands through cutting-edge workshops, hackathons,
              and a vibrant network of tech professionals.
            </div>

            {/* Mobile Majestic Version */}
            <div className="heroBadge mobileOnly majesticBadgeMobile">
              OFFICIAL SOCIETY • DEPT. OF COMPUTER SCIENCE • UAF
            </div>
            <div className="heroTitle mobileOnly majesticTitleMobile">
              <span className="theText">The</span>
              <span className="mainText">Computing Society</span>
            </div>
            <div className="heroDescription mobileOnly majesticDescMobile">
              A community of innovators, problem solvers,<br />
              and future tech leaders.
            </div>

            <div className="heroButtons desktopOnly" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.25rem", width: "100%", alignItems: "center" }}>
              <Link to="/events" className="btnExplore" style={{ height: "2.5rem", padding: "0 0.75rem", fontSize: "0.65rem", whiteSpace: "nowrap" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                EXPLORE EVENTS
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "3px" }}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>

              <Link to="/tickets" className="btnSecondary btnTickets" style={{ height: "2.5rem", padding: "0 0.7rem", fontSize: "0.62rem", whiteSpace: "nowrap" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
                </svg>
                GET TICKETS
              </Link>
              <Link to="/programs" className="btnSecondary btnPrograms" style={{ height: "2.5rem", padding: "0 0.7rem", fontSize: "0.62rem", whiteSpace: "nowrap" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
                VIEW PROGRAMS
              </Link>
            </div>

            <div className="heroButtons mobileOnly" style={{ display: "flex", flexDirection: "column", gap: "0.8rem", width: "100%", marginTop: "2rem" }}>
              <Link to="/events" style={{ width: '100%', textDecoration: "none" }}>
                <button className="btnExplore" style={{ width: "100%" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  EXPLORE EVENTS
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </Link>
              <div className="sideBySide" style={{ display: "flex", gap: "0.7rem", width: "100%" }}>
                <Link to="/tickets" style={{ flex: 1, textDecoration: "none" }}>
                  <button className="btnSecondary" style={{ width: "100%", fontSize: "0.7rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
                    </svg>
                    TICKETS
                  </button>
                </Link>
                <Link to="/programs" style={{ flex: 1, textDecoration: "none" }}>
                  <button className="btnSecondary" style={{ width: "100%", fontSize: "0.7rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                    PROGRAMS
                  </button>
                </Link>
              </div>
            </div>

            <div className="statsGrid desktopOnly">
              {(stats || []).map((s, i) => {
                const getIcon = (label) => {
                  const l = label.toLowerCase();
                  if (l.includes("event")) return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  );
                  if (l.includes("active") || l.includes("member")) return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                  );
                  if (l.includes("faculty") || l.includes("mentor")) return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 10L12 5L2 10L12 15L22 10Z" />
                      <path d="M6 12V17C6 17 8 20 12 20C16 20 18 17 18 17V12" />
                    </svg>
                  );
                  return "🔥";
                };
                const getIconColor = (label) => {
                  const l = label.toLowerCase();
                  if (l.includes("event")) return "#ff3366";
                  if (l.includes("active") || l.includes("member")) return "#00ebff";
                  return "#c234a5";
                };
                const color = getIconColor(s.label);
                return (
                  <div key={i} className="statItem">
                    <div className="statIcon" style={{ color: color }}>
                      {getIcon(s.label)}
                    </div>
                    <div className="statNumber" style={{ color: color }}>
                      <CountUp value={s.number} />+
                    </div>
                    <div className="statLabel">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* New Event Spotlight Card */}
          <div className="desktopOnly">
            <HeroSpotlight />
          </div>
        </div>

        {/* Mobile Stats Grid - Matching Desktop Aesthetic */}
        <div className="mobileOnly" style={{ padding: "0 1rem" }}>
          <div className="statsGrid" style={{ width: "100%", maxWidth: "100%" }}>
            {(stats || []).map((s, i) => {
              const getIcon = (label) => {
                const l = label.toLowerCase();
                if (l.includes("event")) return (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                );
                if (l.includes("active") || l.includes("member")) return (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  </svg>
                );
                if (l.includes("faculty") || l.includes("mentor")) return (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 10L12 5L2 10L12 15L22 10Z" />
                    <path d="M6 12V17C6 17 8 20 12 20C16 20 18 17 18 17V12" />
                  </svg>
                );
                return "🔥";
              };
              const getIconColor = (label) => {
                const l = label.toLowerCase();
                if (l.includes("event")) return "#ff3366";
                if (l.includes("active") || l.includes("member")) return "#00ebff";
                return "#c234a5";
              };
              const color = getIconColor(s.label);
              return (
                <div key={i} className="statItem" style={{ flex: 1, minWidth: "80px" }}>
                  <div className="statIcon" style={{ color: color, marginBottom: "0.5rem" }}>
                    {getIcon(s.label)}
                  </div>
                  <div className="statNumber" style={{ color: color, fontSize: "1.4rem" }}><CountUp value={s.number} />+</div>
                  <div className="statLabel" style={{ fontSize: "0.65rem", opacity: 0.6 }}>{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* Hero Spotlight for Mobile */}
          <div style={{ marginTop: "2rem" }}>
            <HeroSpotlight />
          </div>
        </div>

        <div className="hr" />

        {/* Notice Cards - Desktop Version */}
        <div className="noticeGrid desktopOnly">
          {(notices || []).map((n, index) => {
            const getPath = () => {
              const title = n.title?.toLowerCase() || "";
              if (title.includes("announcement")) return "/announcements";
              if (title.includes("event")) return "/events";
              if (title.includes("ticket")) return "/tickets";
              return n.link || "/";
            };

            const getIcon = (title) => {
              const t = title.toLowerCase();
              if (t.includes("announcement")) return "📢";
              if (t.includes("event")) return "🎤";
              if (t.includes("ticket")) return "🎟️";
              return n.icon || "🔔";
            };

            const getDotColor = (idx) => {
              if (idx === 0) return "#ff3366";
              if (idx === 1) return "#00ebff";
              return "#00f5d4";
            };

            const getTimeAgo = (timestamp) => {
              if (!timestamp) return "2h ago"; // fallback
              const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
              if (seconds < 60) return "just now";
              const minutes = Math.floor(seconds / 60);
              if (minutes < 60) return `${minutes}m ago`;
              const hours = Math.floor(minutes / 60);
              if (hours < 24) return `${hours}h ago`;
              const days = Math.floor(hours / 24);
              return `${days}d ago`;
            };

            return (
              <Link key={n.id || index} to={getPath()} style={{ textDecoration: "none" }}>
                <div className="noticeCard" style={{ borderColor: `${getDotColor(index)}44` }}>
                  <div className="noticeInner">
                    <div className="noticeHeader">
                      <div className="noticeIcon" style={{ background: n.gradient, color: "#fff", border: `1px solid ${getDotColor(index)}` }}>
                        {getIcon(n.title)}
                      </div>
                      <div className="noticeText">
                        <div className="noticeTitle">{n.title}</div>
                        <div className="noticeMeta">{n.meta}</div>
                      </div>
                      <div className="noticeTime">
                        <div className="timeDot" style={{ background: getDotColor(index), boxShadow: `0 0 10px ${getDotColor(index)}` }} />
                        {getTimeAgo(n.timestamp)}
                      </div>
                    </div>
                    <div className="noticeActions">
                      <span className="btn btnNoticeOpen">View</span>
                      <span className="btn btnNoticeDetails">Details</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Notice Cards - Mobile Majestic Version */}
        <div className="mobileNoticeList mobileOnly">
          {(notices || []).map((n, index) => {
            const getPath = () => {
              const title = n.title?.toLowerCase() || "";
              if (title.includes("announcement")) return "/announcements";
              if (title.includes("event")) return "/events";
              if (title.includes("ticket")) return "/tickets";
              return n.link || "/";
            };

            const getMobileIcon = (title) => {
              const t = title.toLowerCase();
              if (t.includes("announcement")) return "📢";
              if (t.includes("event")) return "🎤";
              if (t.includes("ticket")) return "🎟️";
              return n.icon || "🔔";
            };

            const getActionIcon = (title) => {
              const t = title.toLowerCase();
              if (t.includes("announcement")) return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              );
              if (t.includes("event")) return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              );
              return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="9" width="20" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" />
                </svg>
              );
            };

            // Dynamic time-ago from real activity
            const getTimeAgo = (timestamp) => {
              if (!timestamp) return "2h ago"; // fallback
              const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
              if (seconds < 60) return "just now";
              const minutes = Math.floor(seconds / 60);
              if (minutes < 60) return `${minutes}m ago`;
              const hours = Math.floor(minutes / 60);
              if (hours < 24) return `${hours}h ago`;
              const days = Math.floor(hours / 24);
              return `${days}d ago`;
            };

            const getDotColor = (idx) => {
              if (idx === 0) return "#ff3366";
              if (idx === 1) return "#00ebff";
              return "#00f5d4";
            };

            return (
              <div key={n.id || index} className="mobileNoticeCard">
                <div className="mobileNoticeHeader">
                  <div className="mobileNoticeIconBox" style={{ background: n.gradient }}>
                    {getMobileIcon(n.title)}
                  </div>
                  <div className="mobileNoticeTime">
                    <div className="timeDot" style={{ background: getDotColor(index) }} />
                    {getTimeAgo(n.timestamp)}
                  </div>
                </div>

                <div className="mobileNoticeTitle">{n.title}</div>
                <div className="mobileNoticeMeta">{n.meta}</div>

                <div className="mobileNoticeActions">
                  <Link to={getPath()} className="mobileBtnOpen" style={{ background: n.gradient }}>
                    {getActionIcon(n.title)} VIEW
                  </Link>
                  <Link to={getPath()} className="mobileBtnDetails">
                    DETAILS
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>


        <div className="hr" />

        {/* Features - Desktop Version */}
        <div className="desktopOnly">
          <div className="sectionHeader" style={{ marginBottom: "1.5rem" }}>
            <div>
              <div className="sectionTitle" style={{ fontSize: "1.8rem", fontWeight: "800" }}>What We Offer</div>
              <div className="sectionSubtitle" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.6)", marginTop: "0.25rem" }}>Programs designed to elevate your skills</div>
            </div>
          </div>

          <div className="offeringsGrid">
            {(features || []).map((f, idx) => {
              const getFeatureIconAndColor = (title) => {
                const t = title.toLowerCase();
                if (t.includes("workshop")) return { icon: "🚀", grad: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)" };
                if (t.includes("competition")) return { icon: "🏆", grad: "linear-gradient(135deg, #667eea, #764ba2)" };
                if (t.includes("hackathon")) return { icon: "💡", grad: "linear-gradient(135deg, #a18cd1, #fbc2eb)" };
                if (t.includes("bootcamp")) return { icon: "🎯", grad: "linear-gradient(135deg, #21d4fd, #b721ff)" };
                return { icon: "✨", grad: "linear-gradient(135deg, #8BC6EC, #9599E2)" };
              };
              const style = getFeatureIconAndColor(f.title);

              return (
                <div key={f.id || idx} className="offeringCard">
                  <div className="offeringIconBox" style={{ background: style.grad }}>
                    {style.icon}
                  </div>
                  <div className="offeringContent">
                    <div className="offeringTitle">{f.title}</div>
                    <div className="offeringDesc">{f.desc}</div>
                  </div>
                  <div className="offeringArrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What We Offer - Mobile Version (Exactly as Image) */}
        <div className="mobileOnly">
          <h2 className="mobileSectionTitle">What We Offer</h2>
          <p className="mobileSectionSubtitle">Programs designed to elevate your skills and accelerate your growth.</p>
          <div className="mobileAccentLine" />

          <div className="mobileOfferList">
            {(features || []).map((f, idx) => {
              const getFeatureIconAndColor = (title) => {
                const t = title.toLowerCase();
                if (t.includes("workshop")) return { icon: "🚀", grad: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)" };
                if (t.includes("competition")) return { icon: "🏆", grad: "linear-gradient(135deg, #667eea, #764ba2)" };
                if (t.includes("hackathon")) return { icon: "💡", grad: "linear-gradient(135deg, #a18cd1, #fbc2eb)" };
                if (t.includes("bootcamp")) return { icon: "🎯", grad: "linear-gradient(135deg, #21d4fd, #b721ff)" };
                return { icon: "✨", grad: "linear-gradient(135deg, #8BC6EC, #9599E2)" };
              };
              const style = getFeatureIconAndColor(f.title);

              return (
                <div key={f.id || idx} className="mobileOfferCard">
                  <div className="mobileIconContainer" style={{ background: style.grad }}>
                    {style.icon}
                  </div>
                  <div className="mobileTextContent">
                    <div className="mobileOfferTitle">{f.title}</div>
                    <div className="mobileOfferDesc">{f.desc}</div>
                  </div>
                  <div className="mobileChevron">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hr desktopOnly" />

        {/* Unified Quick Access & Footer Bar - Desktop */}
        <div className="desktopOnly">
          <div className="quickAccessFooterBar">
            <div className="quickLabel">QUICK ACCESS</div>
            <div className="barDivider"></div>

            <div className="quickLinksContainer">
              {(finalQuickLinks || []).map((q, i) => {
                const icon3D = q.label ? (
                  q.label.toLowerCase().includes("cabinet") ? "🏛️" :
                    q.label.toLowerCase().includes("faculty") ? "🎓" :
                      q.label.toLowerCase().includes("gallery") ? "📸" :
                        q.label.toLowerCase().includes("admin") ? "🔐" : "🔗"
                ) : "🔗";

                if (q.isLogout) {
                  return (
                    <button
                      type="button"
                      key="logout-desktop"
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="quickLinkItem"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ff3366", font: "inherit", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <span className="quickIcon3D">🚪</span>
                      Logout
                    </button>
                  );
                }

                return (
                  <React.Fragment key={q.id || i}>
                    <Link to={q.path} className="quickLinkItem">
                      <span className="quickIcon3D">{icon3D}</span>
                      {q.label}
                    </Link>
                    {i < finalQuickLinks.length - 1 && <div className="barDivider"></div>}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="barFooterContent">
              <div className="barFooterTitle">THE COMPUTING SOCIETY</div>
              <div className="barFooterSub">Built with ❤️ for UAF</div>
              <div className="barFooterMeta">© 2025-26 Cabinet • Dept. of Computer Science</div>
            </div>
          </div>
        </div>

        {/* Quick Access - Mobile Version (Exactly as Image) */}
        <div className="mobileOnly mobileQuickAccess">
          <h3 className="mobileQuickHeader">QUICK ACCESS</h3>
          <div className="mobileQuickList">
            {(finalQuickLinks || []).map((q, i) => {
              const label = q.label?.toLowerCase() || "";

              const getMobileIconSVG = () => {
                if (label.includes("cabinet")) {
                  return (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
                      <defs>
                        <linearGradient id="gradCabinet" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c234a5" />
                          <stop offset="100%" stopColor="#9b59b6" />
                        </linearGradient>
                      </defs>
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="url(#gradCabinet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="url(#gradCabinet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2522 22.1614 16.5523C21.6184 15.8524 20.8581 15.3516 20 15.13" stroke="url(#gradCabinet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="url(#gradCabinet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  );
                }
                if (label.includes("faculty")) {
                  return (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
                      <defs>
                        <linearGradient id="gradFaculty" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff3366" />
                          <stop offset="100%" stopColor="#dc2743" />
                        </linearGradient>
                      </defs>
                      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="url(#gradFaculty)" opacity="0.15" />
                      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="url(#gradFaculty)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                      <path d="M10 10H14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    </svg>
                  );
                }
                if (label.includes("gallery")) {
                  return (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
                      <defs>
                        <linearGradient id="gradGallery" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00ebff" />
                          <stop offset="100%" stopColor="#c234a5" />
                        </linearGradient>
                      </defs>
                      <rect x="3" y="3" width="18" height="18" rx="4" stroke="url(#gradGallery)" strokeWidth="2.5" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="url(#gradGallery)" />
                      <path d="M21 15L16 10L5 21" stroke="url(#gradGallery)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  );
                }
                if (label.includes("admin")) {
                  return (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
                      <defs>
                        <linearGradient id="gradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffd700" />
                          <stop offset="100%" stopColor="#ff3366" />
                        </linearGradient>
                      </defs>
                      <rect x="3" y="11" width="18" height="11" rx="3" stroke="url(#gradAdmin)" strokeWidth="2.5" />
                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="url(#gradAdmin)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="16.5" r="1.5" fill="url(#gradAdmin)" />
                    </svg>
                  );
                }
                return <span>{q.icon || "🔗"}</span>;
              };

              return q.isLogout ? (
                <button
                  type="button"
                  key="logout-mobile"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="logoutBtn"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <span className="mobileQuickIcon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#ff3366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 17L21 12L16 7" stroke="#ff3366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12H9" stroke="#ff3366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="mobileQuickLabel" style={{ color: "#ff3366" }}>Logout</span>
                </button>
              ) : (
                <Link key={q.id || i} to={q.path} className="mobileQuickCard">
                  <span className="mobileQuickIcon">{getMobileIconSVG()}</span>
                  <span className="mobileQuickLabel">{q.label}</span>
                  <span className="mobileQuickChevron">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>


      </motion.div>
    </section>
  );
}
