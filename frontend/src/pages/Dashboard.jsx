
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { EventContext } from "../context/EventContext";
import { ThemeContext } from "../context/ThemeContext";
import { listTickets } from "../services/ticketService";
import { listCabinet, createCabinetMember, updateCabinetMember, deleteCabinetMember } from "../services/cabinetService";
import { listFaculty, createFaculty, updateFaculty, deleteFaculty } from "../services/facultyService";
import { getHomeContent, saveHomeContent } from "../services/homeService";
import { listAnnouncements, createAnnouncement, updateAnnouncement } from "../services/announcementService";
import { listPrograms, createProgram, updateProgram } from "../services/programService";
import { listGalleryAlbums, createAlbum, updateAlbum, addImageToAlbum } from "../services/galleryService";
import { Modal } from "../components/ui/Modal";
import { useModal } from "../context/ModalContext";
import { ImageUploader } from "../components/ui/ImageUploader";
import { FileUploader } from "../components/ui/FileUploader";
import SEOHead from "../components/common/SEOHead";
import "../assets/styles/pages/dashboard.css";

import {
  HomeTab,
  CabinetTab,
  FacultyTab,
  EventsTab,
  AnnouncementsTab,
  ProgramsTab,
  DegreesTab,
  GalleryTab,
  TicketsTab,
  ThemeTab,
  UsersTab,
  AuditLogsTab
} from "./admin/tabs";

// Admin tabs configuration
const ADMIN_TABS = [
  { key: "home", label: "🏠 Home", icon: "🏠" },
  { key: "cabinet", label: "👥 Cabinet", icon: "👥" },
  { key: "faculty", label: "👨‍🏫 Faculty", icon: "👨‍🏫" },
  { key: "events", label: "📅 Events", icon: "📅" },
  { key: "announcements", label: "📢 Announcements", icon: "📢" },
  { key: "programs", label: "🎯 Programs", icon: "🎯" },
  { key: "degrees", label: "🎓 Degrees", icon: "🎓" },
  { key: "gallery", label: "📸 Gallery", icon: "📸" },
  { key: "tickets", label: "🎟️ Tickets", icon: "🎟️" },
  { key: "theme", label: "🎨 Theme", icon: "🎨" },
  { key: "users", label: "👥 Users", icon: "👥" },
  { key: "audit", label: "📜 Audit Logs", icon: "📜" },
];

export default function Dashboard() {
  const nav = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const eventsCtx = useContext(EventContext);
  const themeCtx = useContext(ThemeContext);

  const [tab, setTab] = useState("home");
  // Initialize with defaultTheme first, then sync with actual theme
  const [draftTheme, setDraftTheme] = useState(themeCtx?.defaultTheme || themeCtx?.theme || {});
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Scroll to top on admin tab switch
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editing, setEditing] = useState(null);

  // Data refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  // Listen to data changes
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }, []);

  // Sync draftTheme with themeCtx.theme when not editing
  useEffect(() => {
    if (!hasUnsaved) {
      // Use defaultTheme as fallback to ensure all keys are present
      const themeToUse = Object.keys(themeCtx?.theme || {}).length > 0
        ? themeCtx.theme
        : (themeCtx?.defaultTheme || {});
      setDraftTheme(themeToUse);
    }
  }, [themeCtx.theme, themeCtx.defaultTheme, hasUnsaved]);

  // Data - loaded via async useEffect
  const events = eventsCtx.events || [];
  const [tickets, setTickets] = useState([]);
  const [cabinet, setCabinet] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [homeContent, setHomeContent] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    listTickets().then(d => setTickets(d || [])).catch(() => { });
    listCabinet().then(d => setCabinet(d || [])).catch(() => { });
    listFaculty().then(d => setFaculty(d || [])).catch(() => { });
    getHomeContent().then(d => setHomeContent(d || {})).catch(() => { });
    listAnnouncements().then(d => setAnnouncements(d || [])).catch(() => { });
    listPrograms().then(d => setPrograms(d || [])).catch(() => { });
    listGalleryAlbums(true).then(d => setGallery(d || [])).catch(() => { });
  }, [refreshKey]);

  // Auth check - redirect if not logged in
  if (eventsCtx.loading || themeCtx.loading) {
    return null; // Wait for initial context loads
  }

  const { loading: authLoading } = useAuth();
  if (authLoading) return null;

  if (!user) {
    return (
      <section className="section">
        <SEOHead title="Admin Login Required" />
        <div className="sectionTitle">Admin Dashboard</div>
        <div className="sectionSubtitle" style={{ marginTop: ".35rem" }}>Please login first.</div>
        <button className="btn btnPrimary" style={{ marginTop: ".9rem" }} onClick={() => nav("/admin/login")}>
          Admin Login
        </button>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="section">
        <SEOHead title="Access Denied" />
        <div className="sectionTitle">Access Denied</div>
        <div className="sectionSubtitle" style={{ marginTop: ".35rem" }}>This area is for admin only.</div>
        <button className="btn btnGhost" style={{ marginTop: ".9rem" }} onClick={() => nav("/")}>Go Home</button>
      </section>
    );
  }

  // Events
  const openEventCreate = () => {
    setEditing({ title: "", date: new Date().toISOString().split("T")[0], time: "18:00", venue: "", status: "open", featured: false, advertise: false, capacity: 100, seatsRemaining: 100, tags: "", description: "", certificateDescription: "", adPoster: "", registrationDeadline: "" });
    setModalType("event");
    setModalOpen(true);
  };

  const openEventEdit = async (e) => {
    setModalType("event");
    setModalOpen(true);
    try {
      const res = await api.get(`/events/${e._id}`);
      const full = res.data.data;
      setEditing({
        ...full,
        tags: Array.isArray(full.tags) ? full.tags.join(", ") : (full.tags || ""),
        certificateDescription: full.certificateDescription || "",
        isHero: full.isHero || false
      });
    } catch (err) {
      console.error("Fetch Event Details Failed:", err);
      setEditing({
        ...e,
        tags: Array.isArray(e.tags) ? e.tags.join(", ") : (e.tags || ""),
        certificateDescription: e.certificateDescription || ""
      });
    }
  };

  const saveEvent = async () => {
    try {
      if (!editing?.title) {
        showAlert("Validation Error", "Please provide a title.", "warning");
        return;
      }

      // Strip system fields that backend might reject in payload
      const { _id, id: sid, createdAt, updatedAt, __v, ...data } = editing;

      // Process tags string into array
      const finalTags = typeof data.tags === "string"
        ? data.tags.split(",").map(t => t.trim()).filter(t => t)
        : (data.tags || []);

      const payload = { ...data, tags: finalTags };
      const id = _id || sid;

      if (id) {
        await eventsCtx.update(id, payload);
      } else {
        await eventsCtx.create(payload);
      }

      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save event";
      console.error("Save Event Failed:", msg, err);
      showAlert("Operation Failed", msg, "error");
    }
  };

  // Cabinet/Faculty
  const openPersonCreate = (type) => {
    if (type === "cabinet") {
      setEditing({ name: "", role: "", degree: "", agNo: "", interests: [], phone: "", email: "", summary: "", avatar: "", socials: { linkedin: "", instagram: "", facebook: "" } });
    } else {
      setEditing({ name: "", departmentRole: "Professor", education: "", experienceYears: 0, expertise: [], courses: [], universities: [], email: "", phone: "", summary: "", avatar: "", socials: { linkedin: "", website: "" } });
    }
    setModalType(type);
    setModalOpen(true);
  };

  const openPersonEdit = (item, type) => {
    // Convert arrays to strings for editing
    const editingItem = { ...item };
    if (type === "faculty" && Array.isArray(item.expertise)) {
      editingItem.expertise = item.expertise.join(", ");
    }
    setEditing(editingItem);
    setModalType(type);
    setModalOpen(true);
  };

  const savePerson = async () => {
    if (!editing?.name?.trim()) {
      showAlert("Validation Error", "Name is required! Please enter a name.", "warning");
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (modalType === "faculty") {
      if (!editing?.email?.trim()) {
        showAlert("Validation Error", "Email is required! Please enter an email address.", "warning");
        return;
      }
      if (!emailRegex.test(editing.email)) {
        showAlert("Validation Error", "Invalid Email format! Please enter a valid email (e.g. teacher@example.com).", "warning");
        return;
      }
    } else if (modalType === "cabinet") {
      if (editing?.email?.trim() && !emailRegex.test(editing.email)) {
        showAlert("Validation Error", "Invalid Email format! Please enter a valid email (e.g. adan@example.com).", "warning");
        return;
      }
    }
    try {
      const id = editing._id || editing.id;

      // Process expertise string into array if it's faculty
      let payload = { ...editing };
      if (modalType === "faculty" && typeof payload.expertise === "string") {
        payload.expertise = payload.expertise.split(",").map(s => s.trim()).filter(Boolean);
      }

      if (modalType === "cabinet") {
        if (id) {
          await updateCabinetMember(id, payload);
          showAlert("Member updated successfully!", "success");
        } else {
          await createCabinetMember(payload);
          showAlert("Member added successfully!", "success");
        }
      } else {
        if (id) {
          await updateFaculty(id, payload);
          showAlert("Faculty updated successfully!", "success");
        } else {
          await createFaculty(payload);
          showAlert("Faculty added successfully!", "success");
        }
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save member";
      console.error("Save Person Failed:", msg, err);
      showAlert("Operation Failed", msg, "error");
    }
  };

  const deletePerson = async (id, type) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to remove this profile? This action cannot be undone.",
      async () => {
        if (type === "cabinet") await deleteCabinetMember(id);
        else await deleteFaculty(id);
        refresh();
      },
      { type: "error" }
    );
  };

  // Announcements
  const openAnnouncementCreate = () => {
    setEditing({ 
      title: "", 
      body: "", 
      date: new Date().toISOString().split("T")[0], 
      priority: "normal", 
      tags: "", 
      link: "", 
      linkText: "",
      attachment: "",
      attachmentLabel: ""
    });
    setModalType("announcement");
    setModalOpen(true);
  };

  const openAnnouncementEdit = (item) => {
    setEditing({ ...item, tags: (item.tags || []).join(", ") });
    setModalType("announcement");
    setModalOpen(true);
  };

  const saveAnnouncement = async () => {
    if (!editing?.title) return;
    const id = editing._id || editing.id;

    // Process tags string into array
    const finalTags = typeof editing.tags === "string"
      ? editing.tags.split(",").map(t => t.trim()).filter(Boolean)
      : (editing.tags || []);

    const payload = { ...editing, tags: finalTags };

    if (id) await updateAnnouncement(id, payload);
    else await createAnnouncement(payload);
    setModalOpen(false);
    refresh();
  };

  // Programs
  const openProgramCreate = () => {
    setEditing({ title: "", type: "workshop", description: "", icon: "📚", duration: "", participants: 0, capacity: 0, seatsRemaining: 0, status: "upcoming", startDate: "", instructor: "", tags: "" });
    setModalType("program");
    setModalOpen(true);
  };

  const openProgramEdit = (item) => {
    setEditing({ ...item, tags: (item.tags || []).join(", ") });
    setModalType("program");
    setModalOpen(true);
  };

  const saveProgram = async () => {
    try {
      if (!editing?.title) {
        showAlert("Validation Error", "Please provide a title.", "warning");
        return;
      }
      
      const id = editing._id || editing.id;
      
      // Clean up payload
      const { _id, id: sid, createdAt, updatedAt, __v, ...data } = editing;

      // Process tags string into array
      const finalTags = typeof data.tags === "string"
        ? data.tags.split(",").map(t => t.trim()).filter(Boolean)
        : (data.tags || []);

      const payload = { ...data, tags: finalTags };

      if (id) {
        await updateProgram(id, payload);
      } else {
        await createProgram(payload);
      }
      
      setModalOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save program";
      console.error("Save Program Failed:", msg, err);
      showAlert("Operation Failed", msg, "error");
    }
  };

  // Gallery
  const openAlbumCreate = () => {
    setEditing({ title: "", images: [] });
    setModalType("album");
    setModalOpen(true);
  };

  const openAlbumEdit = (item) => {
    setEditing({ ...item });
    setModalType("album");
    setModalOpen(true);
  };

  const saveAlbum = async () => {
    if (!editing?.title) return;
    const id = editing._id || editing.id;
    if (id) await updateAlbum(id, editing);
    else await createAlbum(editing);
    setModalOpen(false);
    refresh();
  };

  // Gallery image upload modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalAlbumId, setImageModalAlbumId] = useState(null);
  const [pendingImage, setPendingImage] = useState("");

  const handleAddImage = (albumId) => {
    setImageModalAlbumId(albumId);
    setPendingImage("");
    setImageModalOpen(true);
  };

  const confirmAddImage = async () => {
    if (pendingImage && imageModalAlbumId) {
      await addImageToAlbum(imageModalAlbumId, pendingImage);
      refresh();
    }
    setImageModalOpen(false);
    setPendingImage("");
  };

  // Home Content
  const [homeEditing, setHomeEditing] = useState(null);

  const openHomeEdit = () => {
    setHomeEditing({ ...homeContent });
    setModalType("home");
    setModalOpen(true);
  };

  const saveHomeChanges = async () => {
    if (homeEditing) {
      await saveHomeContent(homeEditing);
      refresh();
    }
    setModalOpen(false);
  };

  // Get modal title
  const getModalTitle = () => {
    switch (modalType) {
      case "event": return editing?.id ? "Edit Event" : "Add Event";
      case "cabinet": return editing?.id ? "Edit Member" : "Add Member";
      case "faculty": return editing?.id ? "Edit Faculty" : "Add Faculty";
      case "announcement": return editing?.id ? "Edit Announcement" : "Add Announcement";
      case "program": return editing?.id ? "Edit Program" : "Add Program";
      case "album": return editing?.id ? "Edit Album" : "Add Album";
      case "home": return "Edit Home Content";
      default: return "Edit";
    }
  };

  return (
    <section className="section">
      <SEOHead title="Admin Dashboard" description="TCS Admin Dashboard - Manage all content" />

      {/* Header */}
      <div className="sectionHeader">
        <div>
          <div className="sectionTitle">Admin Dashboard</div>
          <div className="sectionSubtitle">Manage all society content and settings</div>
        </div>
        <motion.button
          className="btn btnGhost"
          onClick={() => { logout(); nav("/"); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Logout"
        >
          Logout
        </motion.button>
      </div>

      {/* Tabs */}
      <nav className="adminTabs" role="tablist">
        {ADMIN_TABS.map(t => (
          <motion.button
            key={t.key}
            className={`pill ${tab === t.key ? "pillRed" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setTab(t.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            role="tab"
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
          >
            {t.label}
          </motion.button>
        ))}
      </nav>

      <div className="hr" />

      {/* Tab Content */}
      <div role="tabpanel" id={`panel-${tab}`}>
        {tab === "home" && (
          <HomeTab homeContent={homeContent} openHomeEdit={openHomeEdit} refresh={refresh} />
        )}
        {tab === "cabinet" && (
          <CabinetTab cabinet={cabinet} openPersonCreate={openPersonCreate} openPersonEdit={openPersonEdit} deletePerson={deletePerson} />
        )}
        {tab === "faculty" && (
          <FacultyTab faculty={faculty} openPersonCreate={openPersonCreate} openPersonEdit={openPersonEdit} deletePerson={deletePerson} />
        )}
        {tab === "events" && (
          <EventsTab events={events} eventsCtx={eventsCtx} openEventCreate={openEventCreate} openEventEdit={openEventEdit} />
        )}
        {tab === "announcements" && (
          <AnnouncementsTab announcements={announcements} openAnnouncementCreate={openAnnouncementCreate} openAnnouncementEdit={openAnnouncementEdit} refresh={refresh} />
        )}
        {tab === "programs" && (
          <ProgramsTab programs={programs} openProgramCreate={openProgramCreate} openProgramEdit={openProgramEdit} refresh={refresh} />
        )}
        {tab === "degrees" && (
          <DegreesTab refreshKey={refreshKey} onRefresh={refresh} />
        )}
        {tab === "gallery" && (
          <GalleryTab gallery={gallery} openAlbumCreate={openAlbumCreate} openAlbumEdit={openAlbumEdit} handleAddImage={handleAddImage} refresh={refresh} />
        )}
        {tab === "tickets" && (
          <TicketsTab tickets={tickets} events={events} programs={programs} refresh={refresh} />
        )}
        {tab === "theme" && (
          <ThemeTab draftTheme={draftTheme} setDraftTheme={setDraftTheme} hasUnsaved={hasUnsaved} setHasUnsaved={setHasUnsaved} themeCtx={themeCtx} />
        )}
        {tab === "users" && (
          <UsersTab />
        )}
        {tab === "audit" && (
          <AuditLogsTab />
        )}
      </div>

      {/* ==================== MODALS ==================== */}
      <Modal open={modalOpen} title={getModalTitle()} onClose={() => setModalOpen(false)} maxWidth="720px">
        {/* Event Modal */}
        {modalType === "event" && editing && (
          <div style={{ maxHeight: "75vh", overflowY: "auto", paddingRight: "0.8rem", paddingBottom: "1.5rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div><div className="label">Title</div><input className="input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} aria-label="Event title" /></div>
            <div className="formRow">
              <div><div className="label">Event Date</div><input type="date" className="input" min={new Date().toISOString().split("T")[0]} value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} onClick={(e) => e.target.showPicker && e.target.showPicker()} aria-label="Event date" /></div>
              <div>
                <div className="label">Event Time</div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <select 
                    className="input" 
                    style={{ flex: 1 }}
                    value={editing.time.split(":")[0]} 
                    onChange={e => {
                      const mins = editing.time.split(":")[1] || "00";
                      setEditing({ ...editing, time: `${e.target.value}:${mins}` });
                    }}
                  >
                    {Array.from({ length: 24 }).map((_, i) => {
                      const h = i.toString().padStart(2, "0");
                      const displayH = i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i-12} PM`;
                      return <option key={h} value={h}>{displayH}</option>;
                    })}
                  </select>
                  <select 
                    className="input" 
                    style={{ flex: 1 }}
                    value={editing.time.split(":")[1] || "00"} 
                    onChange={e => {
                      const hours = editing.time.split(":")[0] || "00";
                      setEditing({ ...editing, time: `${hours}:${e.target.value}` });
                    }}
                  >
                    {Array.from({ length: 60 }).map((_, i) => (
                      <option key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
               <div className="label" style={{ color: "var(--accent-red)", fontWeight: 900 }}>⌛ Registration Deadline</div>
               <input type="date" className="input" min={new Date().toISOString().split("T")[0]} max={editing.date} value={editing.registrationDeadline} onChange={e => setEditing({ ...editing, registrationDeadline: e.target.value })} onClick={(e) => e.target.showPicker && e.target.showPicker()} aria-label="Registration deadline" />
               <div style={{ fontSize: ".7rem", color: "var(--text-muted)", marginTop: ".3rem" }}>Deadline cannot be later than the event date ({editing.date}).</div>
            </div>
            <div><div className="label">Venue</div><input className="input" value={editing.venue} onChange={e => setEditing({ ...editing, venue: e.target.value })} aria-label="Event venue" /></div>
            <div className="formRow">
              <div><div className="label">Status</div>
                <select className="input" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} aria-label="Event status">
                  <option value="open">Open</option><option value="closed">Closed</option><option value="past">Past</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <input type="checkbox" id="featured" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} />
                <label htmlFor="featured" className="sectionSubtitle">Highlight in Events</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <input type="checkbox" id="advertise" checked={editing.advertise} onChange={e => setEditing({ ...editing, advertise: e.target.checked })} />
                <label htmlFor="advertise" className="sectionSubtitle" style={{ color: "var(--accent-gold)", fontWeight: 900 }}>🚀 Activate Advertising</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <input type="checkbox" id="isHero" checked={editing.isHero || false} onChange={e => setEditing({ ...editing, isHero: e.target.checked })} />
                <label htmlFor="isHero" className="sectionSubtitle" style={{ color: "var(--accent-cyan)", fontWeight: 900 }}>🏆 Pin to Hero Section</label>
              </div>
            </div>
            <div><div className="label">Tags (comma separated)</div><input className="input" value={editing.tags || ""} onChange={e => setEditing({ ...editing, tags: e.target.value })} aria-label="Event tags" placeholder="e.g. Workshop, Tech, Social" /></div>
            <div><div className="label">Description</div><textarea className="input" style={{ minHeight: 80, borderRadius: 12 }} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} aria-label="Event description" /></div>
            <div><div className="label">Certificate Description (Appears on certificates only)</div><textarea className="input" style={{ minHeight: 80, borderRadius: 12 }} value={editing.certificateDescription} onChange={e => setEditing({ ...editing, certificateDescription: e.target.value })} aria-label="Certificate description" placeholder="For participating in..." /></div>
            
            {editing.advertise && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: "1.2rem", background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "20px", marginTop: ".5rem" }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 950, color: "var(--accent-gold)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
                  ✨ UPLOAD ADVERTISEMENT POSTER
                </div>
                <div style={{ maxWidth: "280px", margin: "0 auto" }}>
                  <ImageUploader 
                    value={editing.adPoster} 
                    onChange={(url) => setEditing({ ...editing, adPoster: url })} 
                    placeholder="Drop Ad Poster Here" 
                    aspectRatio="3/4" 
                    maxSize={600} 
                  />
                </div>
                <div style={{ fontSize: ".7rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.8rem", lineHeight: 1.4 }}>
                  This poster will appear as a <b>Floating Popup</b> on the Home Page to drive registrations.
                </div>
              </motion.div>
            )}

            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end", marginTop: "1rem", position: "sticky", bottom: 0, background: "var(--modal-bg)", padding: "10px 0", zIndex: 10 }}>
              <button className="btn btnGhost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btnPrimary" onClick={saveEvent}>Save</button>
            </div>
            </div>
          </div>
        )}

        {/* Cabinet/Faculty Modal */}
        {(modalType === "cabinet" || modalType === "faculty") && editing && (
          <div style={{ display: "grid", gap: ".7rem" }}>
            <div className="flex-stack" style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
              <div style={{ width: 130, flexShrink: 0, margin: "0 auto" }}>
                <div className="label" style={{ marginBottom: ".5rem", textAlign: "center" }}>Profile Photo</div>
                <ImageUploader value={editing.avatar} onChange={(url) => setEditing({ ...editing, avatar: url })} placeholder="Upload Photo" aspectRatio="1" maxSize={256} />
                <div style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.45)", textAlign: "center", marginTop: "0.45rem", lineHeight: "1.3" }}>
                  Use 1:1 Square Pic<br/>Max File Size &lt; 1MB
                </div>
              </div>
              <div style={{ flex: 1, width: "100%" }}>
                <div><div className="label">Name <span style={{ color: "var(--accent-red)" }}>*</span></div><input className="input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} aria-label="Name" /></div>
              </div>
            </div>
            {modalType === "cabinet" && (
              <>
                <div className="formRow">
                  <div><div className="label">Role</div><input className="input" value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} aria-label="Role" /></div>
                  <div><div className="label">Degree</div><input className="input" value={editing.degree} onChange={e => setEditing({ ...editing, degree: e.target.value })} aria-label="Degree" /></div>
                </div>
                <div className="formRow">
                  <div><div className="label">AG No</div><input className="input" value={editing.agNo} onChange={e => setEditing({ ...editing, agNo: e.target.value })} aria-label="AG Number" /></div>
                  <div><div className="label">Phone</div><input className="input" value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} aria-label="Phone" /></div>
                </div>
                <div><div className="label">Email <span style={{ color: "var(--accent-red)" }}>*</span></div><input type="email" className="input" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} aria-label="Email" /></div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  <div>
                    <div className="label">LinkedIn URL</div>
                    <input 
                      className="input" 
                      value={editing.socials?.linkedin || ""} 
                      onChange={e => setEditing({ 
                        ...editing, 
                        socials: { ...(editing.socials || {}), linkedin: e.target.value } 
                      })} 
                      placeholder="https://..."
                      aria-label="LinkedIn URL"
                    />
                  </div>
                  <div>
                    <div className="label">Instagram URL</div>
                    <input 
                      className="input" 
                      value={editing.socials?.instagram || ""} 
                      onChange={e => setEditing({ 
                        ...editing, 
                        socials: { ...(editing.socials || {}), instagram: e.target.value } 
                      })} 
                      placeholder="https://..."
                      aria-label="Instagram URL"
                    />
                  </div>
                  <div>
                    <div className="label">Facebook URL</div>
                    <input 
                      className="input" 
                      value={editing.socials?.facebook || ""} 
                      onChange={e => setEditing({ 
                        ...editing, 
                        socials: { ...(editing.socials || {}), facebook: e.target.value } 
                      })} 
                      placeholder="https://..."
                      aria-label="Facebook URL"
                    />
                  </div>
                </div>
              </>
            )}
            {modalType === "faculty" && (
              <>
                <div className="formRow">
                  <div><div className="label">Role</div>
                    <select className="input" value={editing.departmentRole} onChange={e => setEditing({ ...editing, departmentRole: e.target.value })} aria-label="Department role">
                      <option>Chairman</option><option>Lecturer</option><option>Professor</option><option>Supervisor</option>
                    </select>
                  </div>
                  <div><div className="label">Experience Years</div><input type="number" className="input" value={editing.experienceYears} onChange={e => setEditing({ ...editing, experienceYears: +e.target.value })} aria-label="Experience years" /></div>
                </div>
                <div><div className="label">Education</div><input className="input" value={editing.education} onChange={e => setEditing({ ...editing, education: e.target.value })} aria-label="Education" /></div>
                <div className="formRow">
                  <div><div className="label">Email <span style={{ color: "var(--accent-red)" }}>*</span></div><input type="email" className="input" value={editing.email || ""} onChange={e => setEditing({ ...editing, email: e.target.value })} aria-label="Email" /></div>
                  <div><div className="label">Phone</div><input className="input" value={editing.phone || ""} onChange={e => setEditing({ ...editing, phone: e.target.value })} aria-label="Phone" /></div>
                </div>
                <div><div className="label">Expertise (comma sep)</div><input className="input" value={editing.expertise || ""} onChange={e => setEditing({ ...editing, expertise: e.target.value })} aria-label="Expertise areas" /></div>
              </>
            )}
            <div><div className="label">Summary</div><textarea className="input" style={{ minHeight: 70, borderRadius: 12 }} value={editing.summary} onChange={e => setEditing({ ...editing, summary: e.target.value })} aria-label="Summary" /></div>
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
              <button className="btn btnGhost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btnPrimary" onClick={savePerson}>Save</button>
            </div>
          </div>
        )}

        {/* Announcement Modal */}
        {modalType === "announcement" && editing && (
          <div style={{ display: "grid", gap: ".7rem" }}>
            <div><div className="label">Title</div><input className="input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} aria-label="Announcement title" /></div>
            <div><div className="label">Body</div><textarea className="input" style={{ minHeight: 100, borderRadius: 12 }} value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })} aria-label="Announcement body" /></div>
            <div className="formRow">
              <div><div className="label">Date</div><input type="date" className="input" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} aria-label="Date" /></div>
              <div><div className="label">Priority</div>
                <select className="input" value={editing.priority} onChange={e => setEditing({ ...editing, priority: e.target.value })} aria-label="Priority">
                  <option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div><div className="label">Tags (comma sep)</div><input className="input" value={editing.tags || ""} onChange={e => setEditing({ ...editing, tags: e.target.value })} aria-label="Tags" /></div>
            
            <div style={{ padding: "0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: ".75rem", fontWeight: 700, marginBottom: ".6rem", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: ".4rem" }}>
                📁 Direct File Attachment
              </div>
              <FileUploader 
                value={editing.attachment} 
                onChange={(base64) => setEditing({ ...editing, attachment: base64, attachmentLabel: editing.attachmentLabel || "Download File" })} 
              />
              <div style={{ marginTop: ".6rem" }}>
                <div className="label">Attachment Button Label</div>
                <input className="input" value={editing.attachmentLabel} onChange={e => setEditing({ ...editing, attachmentLabel: e.target.value })} placeholder="e.g. Download PDF" />
              </div>
            </div>

            <div style={{ padding: "0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: ".75rem", fontWeight: 700, marginBottom: ".6rem", color: "var(--accent-pink)", display: "flex", alignItems: "center", gap: ".4rem" }}>
                🔗 External Link / URL
              </div>
              <div className="formRow">
                <div><div className="label">Link URL</div><input className="input" value={editing.link} onChange={e => setEditing({ ...editing, link: e.target.value })} placeholder="https://..." /></div>
                <div><div className="label">Link Button Label</div><input className="input" value={editing.linkText} onChange={e => setEditing({ ...editing, linkText: e.target.value })} placeholder="e.g. Visit Website" /></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
              <button className="btn btnGhost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btnPrimary" onClick={saveAnnouncement}>Save</button>
            </div>
          </div>
        )}

        {/* Program Modal */}
        {modalType === "program" && editing && (
          <div style={{ display: "grid", gap: ".7rem" }}>
            <div className="formRow">
              <div><div className="label">Title</div><input className="input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} aria-label="Program title" /></div>
              <div><div className="label">Icon (emoji)</div><input className="input" value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} aria-label="Icon" /></div>
            </div>
            <div><div className="label">Description</div><textarea className="input" style={{ minHeight: 80, borderRadius: 12 }} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} aria-label="Description" /></div>
            <div className="formRow">
              <div>
                <div className="label">Type</div>
                <input 
                  list="program-types"
                  className="input" 
                  value={editing.type} 
                  onChange={e => setEditing({ ...editing, type: e.target.value })} 
                  placeholder="Select or type custom..."
                />
                <datalist id="program-types">
                  <option value="workshop">Workshop</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="competition">Competition</option>
                  <option value="talk">Talk</option>
                  <option value="course">Course</option>
                  <option value="seminar">Seminar</option>
                </datalist>
              </div>
              <div><div className="label">Status</div>
                <select className="input" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} aria-label="Status">
                  <option value="upcoming">Upcoming</option><option value="open">Open</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="formRow">
              <div><div className="label">Duration</div><input className="input" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })} aria-label="Duration" /></div>
              <div><div className="label">Participants (Current)</div><input type="number" className="input" value={editing.participants} onChange={e => setEditing({ ...editing, participants: +e.target.value })} aria-label="Participants" /></div>
            </div>
            <div className="formRow">
              <div><div className="label">Total Capacity</div><input type="number" className="input" value={editing.capacity} onChange={e => setEditing({ ...editing, capacity: +e.target.value })} aria-label="Capacity" /></div>
              <div><div className="label">Seats Remaining</div><input type="number" className="input" value={editing.seatsRemaining} onChange={e => setEditing({ ...editing, seatsRemaining: +e.target.value })} aria-label="Seats remaining" /></div>
            </div>
            <div className="formRow">
              <div><div className="label">Start Date</div><input type="date" className="input" value={editing.startDate} onChange={e => setEditing({ ...editing, startDate: e.target.value })} aria-label="Start date" /></div>
              <div><div className="label">Instructor</div><input className="input" value={editing.instructor} onChange={e => setEditing({ ...editing, instructor: e.target.value })} aria-label="Instructor" /></div>
            </div>
            <div><div className="label">Tags (comma sep)</div><input className="input" value={editing.tags || ""} onChange={e => setEditing({ ...editing, tags: e.target.value })} aria-label="Tags" /></div>
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
              <button className="btn btnGhost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btnPrimary" onClick={saveProgram}>Save</button>
            </div>
          </div>
        )}

        {/* Album Modal */}
        {modalType === "album" && editing && (
          <div style={{ display: "grid", gap: ".7rem" }}>
            <div><div className="label">Album Title</div><input className="input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} aria-label="Album title" /></div>
            <div className="sectionSubtitle">Images can be added after creating the album</div>
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
              <button className="btn btnGhost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btnPrimary" onClick={saveAlbum}>Save</button>
            </div>
          </div>
        )}

        {/* Home Content Modal */}
        {modalType === "home" && homeEditing && (
          <div style={{ display: "grid", gap: ".7rem" }}>
            <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "0.5rem", paddingBottom: "1.5rem" }}>
              <div><div className="label">Badge Text</div><input className="input" value={homeEditing.heroBadge} onChange={e => setHomeEditing({ ...homeEditing, heroBadge: e.target.value })} aria-label="Hero badge" /></div>
              <div className="formRow">
                <div><div className="label">Title Line 1</div><input className="input" value={homeEditing.heroTitle?.line1} onChange={e => setHomeEditing({ ...homeEditing, heroTitle: { ...homeEditing.heroTitle, line1: e.target.value } })} aria-label="Title line 1" /></div>
                <div><div className="label">Title Line 2</div><input className="input" value={homeEditing.heroTitle?.line2} onChange={e => setHomeEditing({ ...homeEditing, heroTitle: { ...homeEditing.heroTitle, line2: e.target.value } })} aria-label="Title line 2" /></div>
              </div>
              <div><div className="label">Title Line 3</div><input className="input" value={homeEditing.heroTitle?.line3} onChange={e => setHomeEditing({ ...homeEditing, heroTitle: { ...homeEditing.heroTitle, line3: e.target.value } })} aria-label="Title line 3" /></div>
              <div><div className="label">Description</div><textarea className="input" style={{ minHeight: 60, borderRadius: 12 }} value={homeEditing.heroDescription} onChange={e => setHomeEditing({ ...homeEditing, heroDescription: e.target.value })} aria-label="Hero description" /></div>

              <div className="hr" />
              <div style={{ fontWeight: 900 }}>Stats</div>
              {(homeEditing.stats || []).map((s, i) => (
                <div key={i} className="formRow">
                  <div><div className="label">Number</div><input className="input" value={s.number} onChange={e => { const arr = [...homeEditing.stats]; arr[i].number = e.target.value; setHomeEditing({ ...homeEditing, stats: arr }); }} aria-label={`Stat ${i + 1} number`} /></div>
                  <div><div className="label">Label</div><input className="input" value={s.label} onChange={e => { const arr = [...homeEditing.stats]; arr[i].label = e.target.value; setHomeEditing({ ...homeEditing, stats: arr }); }} aria-label={`Stat ${i + 1} label`} /></div>
                </div>
              ))}

              <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end", marginTop: ".5rem" }}>
                <button className="btn btnGhost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btnPrimary" onClick={saveHomeChanges}>Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Gallery Image Upload Modal */}
      <Modal open={imageModalOpen} title="Add Image to Album" onClose={() => setImageModalOpen(false)} maxWidth="400px">
        <div style={{ display: "grid", gap: "1rem" }}>
          <ImageUploader value={pendingImage} onChange={setPendingImage} placeholder="Drop image here or click to browse" aspectRatio="16/9" maxSize={800} />
          <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <button className="btn btnGhost" onClick={() => setImageModalOpen(false)}>Cancel</button>
            <button className="btn btnPrimary" disabled={!pendingImage} onClick={confirmAddImage}>Add Image</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}