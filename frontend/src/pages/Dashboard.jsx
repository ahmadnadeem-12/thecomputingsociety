
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
import { ImageUploader } from "../components/ui/ImageUploader";
import SEOHead from "../components/common/SEOHead";

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
  ThemeTab
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
];

export default function Dashboard() {
  const nav = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const eventsCtx = useContext(EventContext);
  const themeCtx = useContext(ThemeContext);

  const [tab, setTab] = useState("home");
  // Initialize with defaultTheme first, then sync with actual theme
  const [draftTheme, setDraftTheme] = useState(themeCtx?.defaultTheme || themeCtx?.theme || {});
  const [hasUnsaved, setHasUnsaved] = useState(false);

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
    listGalleryAlbums().then(d => setGallery(d || [])).catch(() => { });
  }, [refreshKey]);

  // Auth check - redirect if not logged in
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
    setEditing({ title: "", date: "2025-12-31", time: "18:00", venue: "", status: "open", featured: false, capacity: 100, seatsRemaining: 100, tags: [], description: "" });
    setModalType("event");
    setModalOpen(true);
  };

  const openEventEdit = (e) => {
    setEditing({ ...e });
    setModalType("event");
    setModalOpen(true);
  };

  const saveEvent = async () => {
    if (!editing?.title) return;
    if (editing._id || editing.id) await eventsCtx.update(editing._id || editing.id, editing);
    else await eventsCtx.create(editing);
    setModalOpen(false);
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
    setEditing({ ...item });
    setModalType(type);
    setModalOpen(true);
  };

  const savePerson = async () => {
    if (!editing?.name) return;
    const id = editing._id || editing.id;
    if (modalType === "cabinet") {
      if (id) await updateCabinetMember(id, editing);
      else await createCabinetMember(editing);
    } else {
      if (id) await updateFaculty(id, editing);
      else await createFaculty(editing);
    }
    setModalOpen(false);
    refresh();
  };

  const deletePerson = async (id, type) => {
    if (!confirm("Delete this profile?")) return;
    if (type === "cabinet") await deleteCabinetMember(id);
    else await deleteFaculty(id);
    refresh();
  };

  // Announcements
  const openAnnouncementCreate = () => {
    setEditing({ title: "", body: "", date: new Date().toISOString().split("T")[0], priority: "normal", tags: [], link: "", linkText: "" });
    setModalType("announcement");
    setModalOpen(true);
  };

  const openAnnouncementEdit = (item) => {
    setEditing({ ...item });
    setModalType("announcement");
    setModalOpen(true);
  };

  const saveAnnouncement = async () => {
    if (!editing?.title) return;
    const id = editing._id || editing.id;
    if (id) await updateAnnouncement(id, editing);
    else await createAnnouncement(editing);
    setModalOpen(false);
    refresh();
  };

  // Programs
  const openProgramCreate = () => {
    setEditing({ title: "", type: "workshop", description: "", icon: "📚", duration: "", participants: 0, status: "upcoming", startDate: "", instructor: "", tags: [] });
    setModalType("program");
    setModalOpen(true);
  };

  const openProgramEdit = (item) => {
    setEditing({ ...item });
    setModalType("program");
    setModalOpen(true);
  };

  const saveProgram = async () => {
    if (!editing?.title) return;
    const id = editing._id || editing.id;
    if (id) await updateProgram(id, editing);
    else await createProgram(editing);
    setModalOpen(false);
    refresh();
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
          <div className="sectionSubtitle">Manage all content (localStorage based)</div>
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
      <nav style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: "1rem" }} role="tablist">
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
          <TicketsTab tickets={tickets} events={events} refresh={refresh} />
        )}
        {tab === "theme" && (
          <ThemeTab draftTheme={draftTheme} setDraftTheme={setDraftTheme} hasUnsaved={hasUnsaved} setHasUnsaved={setHasUnsaved} themeCtx={themeCtx} />
        )}
      </div>

      {/* ==================== MODALS ==================== */}
      <Modal open={modalOpen} title={getModalTitle()} onClose={() => setModalOpen(false)} maxWidth="720px">
        {/* Event Modal */}
        {modalType === "event" && editing && (
          <div style={{ display: "grid", gap: ".7rem" }}>
            <div><div className="label">Title</div><input className="input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} aria-label="Event title" /></div>
            <div className="formRow">
              <div><div className="label">Date</div><input type="date" className="input" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} aria-label="Event date" /></div>
              <div><div className="label">Time</div><input type="time" className="input" value={editing.time} onChange={e => setEditing({ ...editing, time: e.target.value })} aria-label="Event time" /></div>
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
                <label htmlFor="featured" className="sectionSubtitle">Featured</label>
              </div>
            </div>
            <div><div className="label">Description</div><textarea className="input" style={{ minHeight: 80, borderRadius: 12 }} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} aria-label="Event description" /></div>
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
              <button className="btn btnGhost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btnPrimary" onClick={saveEvent}>Save</button>
            </div>
          </div>
        )}

        {/* Cabinet/Faculty Modal */}
        {(modalType === "cabinet" || modalType === "faculty") && editing && (
          <div style={{ display: "grid", gap: ".7rem" }}>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
              <div style={{ width: 130, flexShrink: 0 }}>
                <div className="label" style={{ marginBottom: ".5rem" }}>Profile Photo</div>
                <ImageUploader value={editing.avatar} onChange={(url) => setEditing({ ...editing, avatar: url })} placeholder="Upload Photo" aspectRatio="1" maxSize={256} />
              </div>
              <div style={{ flex: 1 }}>
                <div><div className="label">Name</div><input className="input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} aria-label="Name" /></div>
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
                <div><div className="label">Email</div><input type="email" className="input" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} aria-label="Email" /></div>
              </>
            )}
            {modalType === "faculty" && (
              <>
                <div className="formRow">
                  <div><div className="label">Role</div>
                    <select className="input" value={editing.departmentRole} onChange={e => setEditing({ ...editing, departmentRole: e.target.value })} aria-label="Department role">
                      <option>Chairman</option><option>Professor</option><option>Supervisor</option><option>Lecturer</option>
                    </select>
                  </div>
                  <div><div className="label">Experience Years</div><input type="number" className="input" value={editing.experienceYears} onChange={e => setEditing({ ...editing, experienceYears: +e.target.value })} aria-label="Experience years" /></div>
                </div>
                <div><div className="label">Education</div><input className="input" value={editing.education} onChange={e => setEditing({ ...editing, education: e.target.value })} aria-label="Education" /></div>
                <div><div className="label">Expertise (comma sep)</div><input className="input" value={(editing.expertise || []).join(", ")} onChange={e => setEditing({ ...editing, expertise: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} aria-label="Expertise areas" /></div>
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
            <div><div className="label">Tags (comma sep)</div><input className="input" value={(editing.tags || []).join(", ")} onChange={e => setEditing({ ...editing, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} aria-label="Tags" /></div>
            <div className="formRow">
              <div><div className="label">Link URL</div><input className="input" value={editing.link} onChange={e => setEditing({ ...editing, link: e.target.value })} aria-label="Link URL" /></div>
              <div><div className="label">Link Text</div><input className="input" value={editing.linkText} onChange={e => setEditing({ ...editing, linkText: e.target.value })} aria-label="Link text" /></div>
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
              <div><div className="label">Type</div>
                <select className="input" value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} aria-label="Type">
                  <option value="workshop">Workshop</option><option value="bootcamp">Bootcamp</option><option value="competition">Competition</option><option value="talk">Talk</option>
                </select>
              </div>
              <div><div className="label">Status</div>
                <select className="input" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} aria-label="Status">
                  <option value="upcoming">Upcoming</option><option value="open">Open</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="formRow">
              <div><div className="label">Duration</div><input className="input" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })} aria-label="Duration" /></div>
              <div><div className="label">Participants</div><input type="number" className="input" value={editing.participants} onChange={e => setEditing({ ...editing, participants: +e.target.value })} aria-label="Participants" /></div>
            </div>
            <div className="formRow">
              <div><div className="label">Start Date</div><input type="date" className="input" value={editing.startDate} onChange={e => setEditing({ ...editing, startDate: e.target.value })} aria-label="Start date" /></div>
              <div><div className="label">Instructor</div><input className="input" value={editing.instructor} onChange={e => setEditing({ ...editing, instructor: e.target.value })} aria-label="Instructor" /></div>
            </div>
            <div><div className="label">Tags (comma sep)</div><input className="input" value={(editing.tags || []).join(", ")} onChange={e => setEditing({ ...editing, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} aria-label="Tags" /></div>
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
          <div style={{ display: "grid", gap: ".7rem", maxHeight: "60vh", overflowY: "auto" }}>
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
        )}
      </Modal>

      {/* Gallery Image Upload Modal */}
      <Modal open={imageModalOpen} title="Add Image to Album" onClose={() => setImageModalOpen(false)} maxWidth="400px">
        <div style={{ display: "grid", gap: "1rem" }}>
          <ImageUploader value={pendingImage} onChange={setPendingImage} placeholder="Drop image here or click to browse" aspectRatio="16/9" maxSize={1024} />
          <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <button className="btn btnGhost" onClick={() => setImageModalOpen(false)}>Cancel</button>
            <button className="btn btnPrimary" disabled={!pendingImage} onClick={confirmAddImage}>Add Image</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}