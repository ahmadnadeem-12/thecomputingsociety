
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useModal } from "../../../context/ModalContext";
import { listDegrees, createDegree, updateDegree, deleteDegree } from "../../../services/degreeService";

export default function DegreesTab({ refreshKey, onRefresh }) {
    const { showAlert, showConfirm } = useModal();
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        code: "",
        name: "",
        fullName: "",
        duration: "4 Years",
        semesters: 8,
        description: "",
        icon: "📚",
        courses: "",
        pdfUrl: ""
    });

    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        listDegrees()
            .then(data => setDegrees(data || []))
            .catch(err => console.error("Failed to fetch degrees:", err))
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const resetForm = () => {
        setForm({
            code: "",
            name: "",
            fullName: "",
            duration: "4 Years",
            semesters: 8,
            description: "",
            icon: "📚",
            courses: "",
            pdfUrl: ""
        });
        setEditingId(null);
    };

    const handleEdit = (deg) => {
        setForm({
            code: deg.code || "",
            name: deg.name || "",
            fullName: deg.fullName || "",
            duration: deg.duration || "4 Years",
            semesters: deg.semesters || 8,
            description: deg.description || "",
            icon: deg.icon || "📚",
            courses: (deg.courses || []).join(", "),
            pdfUrl: deg.pdfUrl || "",
            pdfName: deg.pdfName || ""
        });
        setEditingId(deg.id);
        // Scroll to form at top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSave = async () => {
        const data = {
            ...form,
            semesters: parseInt(form.semesters) || 8,
            courses: form.courses.split(",").map(c => c.trim()).filter(Boolean)
        };

        try {
            if (editingId) {
                await updateDegree(editingId, data);
            } else {
                await createDegree(data);
            }
            resetForm();
            onRefresh?.();
        } catch (err) {
            console.error("Save error:", err);
            showAlert("Save Failed", "We couldn't save the degree program. Please try again.", "error");
        }
    };

    const handleDelete = async (id) => {
        showConfirm(
          "Delete Program",
          "Are you sure you want to permanently delete this degree program?",
          async () => {
             try {
                await deleteDegree(id);
                onRefresh?.();
                showAlert("Deleted", "Degree program has been removed.", "success");
            } catch (err) {
                console.error("Delete error:", err);
                showAlert("Error", "Failed to delete the program.", "error");
            }
          },
          { type: "error" }
        );
    };

    return (
        <div>
            {/* Form */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: 800, marginBottom: "1rem" }}>
                    {editingId ? "✏️ Edit Degree Program" : "➕ Add Degree Program"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="formGroup">
                        <label className="formLabel">Program Code *</label>
                        <input
                            className="input"
                            placeholder="e.g. BS CS"
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                        />
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Short Name *</label>
                        <input
                            className="input"
                            placeholder="e.g. Computer Science"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="formGroup">
                    <label className="formLabel">Full Name</label>
                    <input
                        className="input"
                        placeholder="e.g. Bachelor of Science in Computer Science"
                        value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div className="formGroup">
                        <label className="formLabel">Icon</label>
                        <input
                            className="input"
                            placeholder="e.g. 💻"
                            value={form.icon}
                            onChange={e => setForm({ ...form, icon: e.target.value })}
                        />
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Duration</label>
                        <input
                            className="input"
                            placeholder="e.g. 4 Years"
                            value={form.duration}
                            onChange={e => setForm({ ...form, duration: e.target.value })}
                        />
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Semesters</label>
                        <input
                            className="input"
                            type="number"
                            placeholder="8"
                            value={form.semesters}
                            onChange={e => setForm({ ...form, semesters: e.target.value })}
                        />
                    </div>
                </div>

                <div className="formGroup">
                    <label className="formLabel">Description</label>
                    <textarea
                        className="input"
                        rows={3}
                        placeholder="Program description..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="formGroup">
                    <label className="formLabel">Courses (comma-separated)</label>
                    <textarea
                        className="input"
                        rows={2}
                        placeholder="Programming, Data Structures, Algorithms, ..."
                        value={form.courses}
                        onChange={e => setForm({ ...form, courses: e.target.value })}
                    />
                </div>

                <div className="formGroup">
                    <label className="formLabel">📥 Course Outline PDF</label>

                    {/* File Upload */}
                    <div style={{
                        border: "2px dashed rgba(220, 39, 67, 0.4)",
                        borderRadius: "12px",
                        padding: "1rem",
                        textAlign: "center",
                        background: "rgba(0,0,0,0.2)"
                    }}>
                        <input
                            type="file"
                            accept=".pdf"
                            id="pdfUpload"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.type === "application/pdf") {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        setForm({ ...form, pdfUrl: reader.result, pdfName: file.name });
                                    };
                                    reader.readAsDataURL(file);
                                } else {
                                    showAlert("Invalid File", "Please select a valid PDF file for the course outline.", "warning");
                                }
                            }}
                        />
                        <label
                            htmlFor="pdfUpload"
                            className="btn btnPrimary"
                            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                        >
                            📄 Choose PDF File
                        </label>

                        {form.pdfUrl && (
                            <div 
                                key={form.pdfUrl}
                                style={{ 
                                    marginTop: "1rem", 
                                    padding: "0.5rem",
                                    background: "rgba(255, 77, 109, 0.1)",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.85rem",
                                    border: "1px solid rgba(255, 77, 109, 0.2)"
                                }}
                            >
                                <span style={{ color: "#4ade80" }}>✅</span> 
                                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "200px" }}>
                                    {form.pdfName || "File ready"}
                                </span>
                                <span
                                    onClickCapture={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log("Forced remove triggered");
                                        setForm(prev => ({ ...prev, pdfUrl: "", pdfName: "" }));
                                        const input = document.getElementById('pdfUpload');
                                        if (input) input.value = '';
                                    }}
                                    style={{
                                        marginLeft: "10px",
                                        color: "#ff4d6d",
                                        fontWeight: "800",
                                        cursor: "pointer",
                                        padding: "4px 10px",
                                        background: "rgba(255, 77, 109, 0.2)",
                                        borderRadius: "4px",
                                        fontSize: "0.7rem",
                                        border: "1px solid #ff4d6d",
                                        display: "inline-block",
                                        pointerEvents: "auto",
                                        zIndex: 10
                                    }}
                                >
                                    ✕ REMOVE
                                </span>
                            </div>
                        )}

                        {!form.pdfUrl && (
                            <div style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: ".5rem" }}>
                                Upload PDF file (max 5MB). Students can download from Programs page.
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
                    <button className="btn btnPrimary" onClick={handleSave}>
                        {editingId ? "💾 Save Changes" : "➕ Add Program"}
                    </button>
                    {editingId && (
                        <button className="btn btnGhost" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="card">
                <div style={{ fontWeight: 800, marginBottom: "1rem" }}>
                    🎓 Degree Programs ({degrees.length})
                </div>

                {degrees.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        No degree programs added yet
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {degrees.map(deg => (
                            <motion.div
                                key={deg.id}
                                className="listItem"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem",
                                    background: "rgba(0,0,0,0.2)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.05)"
                                }}
                                whileHover={{ background: "rgba(0,0,0,0.3)" }}
                            >
                                <div style={{ fontSize: "2rem" }}>{deg.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                                        {deg.code} - {deg.name}
                                    </div>
                                    <div style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
                                        {deg.duration} • {deg.semesters} Semesters
                                        {deg.pdfUrl && " • 📄 PDF Available"}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: ".5rem" }}>
                                    <button
                                        className="btn btnGhost"
                                        style={{ padding: ".4rem .75rem", fontSize: ".75rem" }}
                                        onClick={() => handleEdit(deg)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn btnGhost"
                                        style={{ padding: ".4rem .75rem", fontSize: ".75rem", color: "#ff6b6b" }}
                                        onClick={() => handleDelete(deg.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
