
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

// Convert file to base64 data URL
function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Center crop and resize image
async function processImage(dataUrl, maxSize = 512) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const side = Math.min(img.width, img.height);
            const sx = Math.floor((img.width - side) / 2);
            const sy = Math.floor((img.height - side) / 2);
            canvas.width = maxSize;
            canvas.height = maxSize;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = dataUrl;
    });
}

/**
 * ImageUploader Component
 * - Browse files from computer
 * - Preview before confirm
 * - Returns base64 data URL
 */
export function ImageUploader({
    value = "",
    onChange,
    placeholder = "Upload Image",
    aspectRatio = "1",
    maxSize = 512,
    showPreview = true,
}) {
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(value);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith("image/")) return;

        try {
            const dataUrl = await fileToDataURL(file);
            const processed = await processImage(dataUrl, maxSize);
            setPreview(processed);
            onChange?.(processed);
        } catch (err) {
            console.error("Error processing image:", err);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleClick = () => fileRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setPreview("");
        onChange?.("");
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <motion.div
            className="imageUploader"
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
                position: "relative",
                aspectRatio,
                borderRadius: "var(--radius-md, 16px)",
                border: `2px dashed ${isDragging ? "var(--accent-pink, #c234a5)" : "rgba(255,255,255,0.2)"}`,
                background: isDragging
                    ? "rgba(194,52,165,0.1)"
                    : "rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.2s ease",
                minHeight: 120,
            }}
        >
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {showPreview && preview ? (
                <>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "inherit",
                        }}
                    />
                    {/* Overlay for actions */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.5)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.2s",
                        }}
                        className="imageUploader-overlay"
                    >
                        <span style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
                            📷 Change Image
                        </span>
                        <button
                            onClick={handleClear}
                            style={{
                                marginTop: "0.5rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "999px",
                                background: "rgba(220,39,67,0.8)",
                                border: "none",
                                color: "#fff",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                            }}
                        >
                            ✕ Remove
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.6 }}>
                        📷
                    </div>
                    <div
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted, #9a8fa6)",
                            fontWeight: 500,
                            textAlign: "center",
                            padding: "0 1rem",
                        }}
                    >
                        {placeholder}
                    </div>
                    <div
                        style={{
                            fontSize: "0.72rem",
                            color: "var(--text-dim, #6b5f78)",
                            marginTop: "0.25rem",
                        }}
                    >
                        Click or drag & drop
                    </div>
                </>
            )}

            <style>{`
        .imageUploader:hover .imageUploader-overlay {
          opacity: 1 !important;
        }
      `}</style>
        </motion.div>
    );
}
