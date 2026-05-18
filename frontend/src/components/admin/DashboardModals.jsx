import React from "react";
import { motion } from "framer-motion";
import { Modal } from "../ui/Modal";
import { ImageUploader } from "../ui/ImageUploader";
import { FileUploader } from "../ui/FileUploader";

export function DashboardModals({
  modalOpen,
  setModalOpen,
  modalType,
  editing,
  setEditing,
  getModalTitle,
  saveEvent,
  savePerson,
  saveAnnouncement,
  saveProgram,
  saveAlbum,
  homeEditing,
  setHomeEditing,
  saveHomeChanges,
  imageModalOpen,
  setImageModalOpen,
  pendingImage,
  setPendingImage,
  confirmAddImage
}) {
  return (
    <>
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
                        const displayH = i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`;
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
              </div>
              <div style={{ flex: 1, width: "100%" }}>
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
                      <option>Chairman</option><option>Lecturer</option><option>Professor</option><option>Supervisor</option>
                    </select>
                  </div>
                  <div><div className="label">Experience Years</div><input type="number" className="input" value={editing.experienceYears} onChange={e => setEditing({ ...editing, experienceYears: +e.target.value })} aria-label="Experience years" /></div>
                </div>
                <div><div className="label">Education</div><input className="input" value={editing.education} onChange={e => setEditing({ ...editing, education: e.target.value })} aria-label="Education" /></div>
                <div className="formRow">
                  <div><div className="label">Email</div><input type="email" className="input" value={editing.email || ""} onChange={e => setEditing({ ...editing, email: e.target.value })} aria-label="Email" /></div>
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
          <ImageUploader value={pendingImage} onChange={setPendingImage} placeholder="Drop image here or click to browse" aspectRatio="16/9" maxSize={1024} />
          <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <button className="btn btnGhost" onClick={() => setImageModalOpen(false)}>Cancel</button>
            <button className="btn btnPrimary" disabled={!pendingImage} onClick={confirmAddImage}>Add Image</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
