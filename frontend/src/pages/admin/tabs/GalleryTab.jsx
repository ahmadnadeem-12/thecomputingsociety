
import React from "react";
import { deleteAlbum, removeImageFromAlbum, resetGallery } from "../../../services/galleryService";

export default function GalleryTab({
    gallery,
    openAlbumCreate,
    openAlbumEdit,
    handleAddImage,
    refresh
}) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div className="sectionSubtitle">Manage gallery albums and images</div>
                <div style={{ display: "flex", gap: ".5rem" }}>
                    <button
                        className="btn btnPrimary"
                        onClick={openAlbumCreate}
                        aria-label="Add new album"
                    >
                        + Add Album
                    </button>
                    <button
                        className="btn btnGhost"
                        onClick={() => { resetGallery(); refresh(); }}
                        aria-label="Reset gallery to defaults"
                    >
                        Reset Gallery
                    </button>
                </div>
            </div>
            <div className="hr" />
            <div style={{ display: "grid", gap: "1.5rem" }}>
                {gallery.map(album => (
                    <div key={album.id} className="card">
                        <div className="albumHeader">
                            <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#fff" }}>{album.title}</div>
                            <div className="albumButtons">
                                <button
                                    className="btn btnGhost"
                                    style={{ padding: ".35rem .7rem", fontSize: ".75rem" }}
                                    onClick={() => openAlbumEdit(album)}
                                    aria-label={`Edit ${album.title}`}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btnGhost"
                                    style={{ padding: ".35rem .7rem", fontSize: ".75rem" }}
                                    onClick={() => handleAddImage(album.id)}
                                    aria-label={`Add image to ${album.title}`}
                                >
                                    ➕ Add Image
                                </button>
                                <button
                                    className="btn btnGhost"
                                    style={{ padding: ".35rem .7rem", fontSize: ".75rem" }}
                                    onClick={() => { deleteAlbum(album.id); refresh(); }}
                                    aria-label={`Delete ${album.title}`}
                                >
                                    🗑️ Delete Album
                                </button>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: ".5rem" }}>
                            {album.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        position: "relative",
                                        aspectRatio: "1",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        background: "rgba(0,0,0,0.3)"
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`${album.title} image ${idx + 1}`}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        loading="lazy"
                                    />
                                    <button
                                        onClick={() => { removeImageFromAlbum(album.id, img); refresh(); }}
                                        aria-label="Remove image"
                                        style={{
                                            position: "absolute", top: 4, right: 4,
                                            width: 20, height: 20, borderRadius: "50%",
                                            background: "rgba(220,39,67,0.9)", border: "none",
                                            color: "#fff", fontSize: "12px", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="sectionSubtitle" style={{ marginTop: ".5rem" }}>
                            {album.images.length} images
                        </div>
                    </div>
                ))}
                {gallery.length === 0 && (
                    <div className="sectionSubtitle">No albums yet. Create your first album!</div>
                )}
            </div>
        </div>
    );
}
