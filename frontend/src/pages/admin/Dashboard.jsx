
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { EventContext } from "../../context/EventContext";
import { ThemeContext } from "../../context/ThemeContext";
import { listTickets } from "../../services/ticketService";
import { listCabinet, createCabinetMember, updateCabinetMember, deleteCabinetMember } from "../../services/cabinetService";
import { listFaculty, createFaculty as createFacultyMember, updateFaculty as updateFacultyMember, deleteFaculty as deleteFacultyMember } from "../../services/facultyService";
import { getHomeContent, saveHomeContent } from "../../services/homeService";
import { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../../services/announcementService";
import { listPrograms, createProgram, updateProgram, deleteProgram } from "../../services/programService";
import { listGalleryAlbums, createAlbum, updateAlbum, addImageToAlbum } from "../../services/galleryService";
import { useModal } from "../../context/ModalContext";
import { DashboardModals } from "../../components/admin/DashboardModals";
import SEOHead from "../../components/common/SEOHead";
import Sidebar from "./Sidebar";
import StatsCard from "./StatsCard";
import ActivityList from "./ActivityList";
import "../../assets/styles/pages/dashboard.css";

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
} from "./tabs";

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
  const [draftTheme, setDraftTheme] = useState(themeCtx?.defaultTheme || themeCtx?.theme || {});
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editing, setEditing] = useState(null);

  // Data refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  // Data states
  const [tickets, setTickets] = useState([]);
  const [cabinet, setCabinet] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [homeContent, setHomeContent] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    listTickets().then(d => setTickets(d || [])).catch(() => { });
    listCabinet().then(d => setCabinet(d || [])).catch(() => { });
    listFaculty().then(d => setFaculty(d || [])).catch(() => { });
    getHomeContent().then(d => setHomeContent(d || {})).catch(() => { });
    listAnnouncements().then(d => setAnnouncements(d || [])).catch(() => { });
    listPrograms().then(d => setPrograms(d || [])).catch(() => { });
    listGalleryAlbums().then(d => setGallery(d || [])).catch(() => { });
  }, [refreshKey, user, isAdmin]);

  // Sync draftTheme
  useEffect(() => {
    if (!hasUnsaved) {
      const themeToUse = Object.keys(themeCtx?.theme || {}).length > 0
        ? themeCtx.theme
        : (themeCtx?.defaultTheme || {});
      setDraftTheme(themeToUse);
    }
  }, [themeCtx.theme, themeCtx.defaultTheme, hasUnsaved]);

  if (eventsCtx.loading || themeCtx.loading) return null;
  if (!user || !isAdmin) {
    return (
      <section className="section">
        <SEOHead title="Access Denied" />
        <div className="sectionTitle">Access Denied</div>
        <button className="btn btnGhost" style={{ marginTop: ".9rem" }} onClick={() => nav("/admin/login")}>Admin Login</button>
      </section>
    );
  }

  // Handlers
  const openEventCreate = () => {
    setEditing({ title: "", date: new Date().toISOString().split("T")[0], time: "18:00", venue: "", status: "open", featured: false, advertise: false, capacity: 100, seatsRemaining: 100, tags: "", description: "", certificateDescription: "", adPoster: "", registrationDeadline: "" });
    setModalType("event");
    setModalOpen(true);
  };

  const openEventEdit = (e) => {
    setEditing({ ...e, tags: Array.isArray(e.tags) ? e.tags.join(", ") : (e.tags || "") });
    setModalType("event");
    setModalOpen(true);
  };

  const saveEvent = async () => {
    try {
      const payload = { ...editing, tags: editing.tags.split(",").map(t => t.trim()) };
      if (editing._id) {
        await eventsCtx.onUpdateEvent(editing._id, payload);
        showAlert("Event updated successfully!", "success");
      } else {
        await eventsCtx.onCreateEvent(payload);
        showAlert("Event created successfully!", "success");
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      showAlert(err.response?.data?.message || "Error saving event", "error");
    }
  };

  const openPersonCreate = (type) => {
    setEditing({ name: "", role: "", degree: "", agNo: "", phone: "", email: "", summary: "", avatar: "", departmentRole: "Lecturer", experienceYears: 0, education: "", expertise: "" });
    setModalType(type);
    setModalOpen(true);
  };

  const openPersonEdit = (item, type) => {
    setEditing({ ...item, expertise: Array.isArray(item.expertise) ? item.expertise.join(", ") : (item.expertise || "") });
    setModalType(type);
    setModalOpen(true);
  };

  const savePerson = async () => {
    try {
      const type = modalType;
      const payload = { ...editing };
      if (type === "faculty") {
        payload.expertise = typeof payload.expertise === "string"
          ? payload.expertise.split(",").map(e => e.trim()).filter(Boolean)
          : (Array.isArray(payload.expertise) ? payload.expertise : []);
      }

      if (editing._id) {
        if (type === "cabinet") await updateCabinetMember(editing._id, payload);
        else await updateFacultyMember(editing._id, payload);
        showAlert("Member updated!", "success");
      } else {
        if (type === "cabinet") await createCabinetMember(payload);
        else await createFacultyMember(payload);
        showAlert("Member added!", "success");
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      showAlert(err.response?.data?.message || "Error saving person", "error");
    }
  };

  const deletePerson = async (id, type) => {
    if (await showConfirm("Are you sure?")) {
      try {
        if (type === "cabinet") await deleteCabinetMember(id);
        else await deleteFacultyMember(id);
        showAlert("Deleted successfully", "success");
        refresh();
      } catch {
        showAlert("Delete failed", "error");
      }
    }
  };

  const openAnnouncementCreate = () => {
    setEditing({ title: "", body: "", priority: "normal", tags: "", date: new Date().toISOString().split("T")[0], attachment: "", attachmentLabel: "", link: "", linkText: "" });
    setModalType("announcement");
    setModalOpen(true);
  };

  const openAnnouncementEdit = (item) => {
    setEditing({ ...item, tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || "") });
    setModalType("announcement");
    setModalOpen(true);
  };

  const saveAnnouncement = async () => {
    try {
      const payload = { ...editing, tags: editing.tags.split(",").map(t => t.trim()) };
      if (editing._id) await updateAnnouncement(editing._id, payload);
      else await createAnnouncement(payload);
      setModalOpen(false);
      refresh();
      showAlert("Announcement saved!", "success");
    } catch {
      showAlert("Error saving announcement", "error");
    }
  };

  const openProgramCreate = () => {
    setEditing({ title: "", description: "", type: "workshop", status: "upcoming", duration: "", participants: 0, capacity: 50, seatsRemaining: 50, startDate: new Date().toISOString().split("T")[0], instructor: "", tags: "", icon: "🚀" });
    setModalType("program");
    setModalOpen(true);
  };

  const openProgramEdit = (item) => {
    setEditing({ ...item, tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || "") });
    setModalType("program");
    setModalOpen(true);
  };

  const saveProgram = async () => {
    try {
      const payload = { ...editing, tags: editing.tags.split(",").map(t => t.trim()) };
      if (editing._id) await updateProgram(editing._id, payload);
      else await createProgram(payload);
      setModalOpen(false);
      refresh();
      showAlert("Program saved!", "success");
    } catch {
      showAlert("Error saving program", "error");
    }
  };

  const openAlbumCreate = () => {
    setEditing({ title: "" });
    setModalType("album");
    setModalOpen(true);
  };

  const openAlbumEdit = (item) => {
    setEditing({ ...item });
    setModalType("album");
    setModalOpen(true);
  };

  const saveAlbum = async () => {
    try {
      if (editing._id) await updateAlbum(editing._id, editing);
      else await createAlbum(editing);
      setModalOpen(false);
      refresh();
      showAlert("Album saved!", "success");
    } catch {
      showAlert("Error saving album", "error");
    }
  };

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalAlbumId, setImageModalAlbumId] = useState(null);
  const [pendingImage, setPendingImage] = useState("");
  const handleAddImage = (id) => { setImageModalAlbumId(id); setImageModalOpen(true); };
  const confirmAddImage = async () => {
    try {
      await addImageToAlbum(imageModalAlbumId, pendingImage);
      setImageModalOpen(false);
      setPendingImage("");
      refresh();
      showAlert("Image added!", "success");
    } catch {
      showAlert("Error adding image", "error");
    }
  };

  const [homeEditing, setHomeEditing] = useState(null);
  const openHomeEdit = () => { setHomeEditing({ ...homeContent }); setModalType("home"); setModalOpen(true); };
  const saveHomeChanges = async () => {
    try {
      await saveHomeContent(homeEditing);
      setModalOpen(false);
      refresh();
      showAlert("Home content updated!", "success");
    } catch {
      showAlert("Error updating home", "error");
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "event": return editing?._id ? "Edit Event" : "Add Event";
      case "cabinet": return editing?._id ? "Edit Member" : "Add Member";
      case "faculty": return editing?._id ? "Edit Faculty" : "Add Faculty";
      case "announcement": return editing?._id ? "Edit Announcement" : "Add Announcement";
      case "program": return editing?._id ? "Edit Program" : "Add Program";
      case "album": return editing?._id ? "Edit Album" : "Add Album";
      case "home": return "Edit Home Content";
      default: return "Edit";
    }
  };

  return (
    <div className="adminDashboardLayout">
      <SEOHead title="Admin Dashboard | TCS" />

      <Sidebar
        tabs={ADMIN_TABS}
        activeTab={tab}
        setTab={setTab}
        logout={logout}
        nav={nav}
      />

      <main className="adminMainContent">
        <header className="adminHeader">
          <div className="welcomeText">
            <h1>Welcome, {user.name}</h1>
            <p>Here's what's happening today.</p>
          </div>
        </header>

        <section className="dashboardOverview">
          <div className="statsRow">
            <StatsCard title="Total Tickets" value={tickets.length} icon="🎟️" color="#ff3366" />
            <StatsCard title="Active Events" value={eventsCtx.events.length} icon="📅" color="#00ebff" />
            <StatsCard title="Members" value={cabinet.length} icon="👥" color="#00f5d4" />
          </div>

          <div className="dashboardGrid">
            <div className="tabContentArea">
              <div className="contentCard">
                {tab === "home" && <HomeTab homeContent={homeContent} openHomeEdit={openHomeEdit} refresh={refresh} />}
                {tab === "cabinet" && <CabinetTab cabinet={cabinet} openPersonCreate={openPersonCreate} openPersonEdit={openPersonEdit} deletePerson={deletePerson} />}
                {tab === "faculty" && <FacultyTab faculty={faculty} openPersonCreate={openPersonCreate} openPersonEdit={openPersonEdit} deletePerson={deletePerson} />}
                {tab === "events" && <EventsTab events={eventsCtx.events} eventsCtx={eventsCtx} openEventCreate={openEventCreate} openEventEdit={openEventEdit} />}
                {tab === "announcements" && <AnnouncementsTab announcements={announcements} openAnnouncementCreate={openAnnouncementCreate} openAnnouncementEdit={openAnnouncementEdit} refresh={refresh} />}
                {tab === "programs" && <ProgramsTab programs={programs} openProgramCreate={openProgramCreate} openProgramEdit={openProgramEdit} refresh={refresh} />}
                {tab === "degrees" && <DegreesTab refreshKey={refreshKey} onRefresh={refresh} />}
                {tab === "gallery" && <GalleryTab gallery={gallery} openAlbumCreate={openAlbumCreate} openAlbumEdit={openAlbumEdit} handleAddImage={handleAddImage} refresh={refresh} />}
                {tab === "tickets" && <TicketsTab tickets={tickets} events={eventsCtx.events} programs={programs} refresh={refresh} />}
                {tab === "theme" && <ThemeTab draftTheme={draftTheme} setDraftTheme={setDraftTheme} hasUnsaved={hasUnsaved} setHasUnsaved={setHasUnsaved} themeCtx={themeCtx} />}
                {tab === "users" && <UsersTab />}
                {tab === "audit" && <AuditLogsTab />}
              </div>
            </div>

            <aside className="activitySidebar">
              <div className="contentCard">
                <h3>Recent Activity</h3>
                <ActivityList activities={[]} />
              </div>
            </aside>
          </div>
        </section>

        <DashboardModals
          modalOpen={modalOpen} setModalOpen={setModalOpen} modalType={modalType}
          editing={editing} setEditing={setEditing} getModalTitle={getModalTitle}
          saveEvent={saveEvent} savePerson={savePerson} saveAnnouncement={saveAnnouncement}
          saveProgram={saveProgram} saveAlbum={saveAlbum} homeEditing={homeEditing}
          setHomeEditing={setHomeEditing} saveHomeChanges={saveHomeChanges}
          imageModalOpen={imageModalOpen} setImageModalOpen={setImageModalOpen}
          pendingImage={pendingImage} setPendingImage={setPendingImage} confirmAddImage={confirmAddImage}
        />
      </main>
    </div>
  );
}
