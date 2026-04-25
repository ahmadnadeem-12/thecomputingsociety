
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

/**
 * FileUploader Component
 * - Browse PDF/Excel/Docs from computer
 * - Returns base64 data URL
 */
export function FileUploader({
    value = "",
    onChange,
    placeholder = "Upload PDF/Excel File",
    maxSizeMB = 5,
}) {
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;
        
        // Size validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`File is too large! Maximum size is ${maxSizeMB}MB.`);
            return;
        }

        try {
            const dataUrl = await fileToDataURL(file);
            setFileName(file.name);
            onChange?.(dataUrl);
        } catch (err) {
            console.error("Error processing file:", err);
            alert("Failed to process file.");
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
        setFileName("");
        onChange?.("");
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <motion.div
            className="fileUploader"
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
                position: "relative",
                padding: "1rem",
                borderRadius: "12px",
                border: `2px dashed ${isDragging ? "var(--accent-cyan, #00d9ff)" : "rgba(255,255,255,0.15)"}`,
                background: isDragging
                    ? "rgba(0,217,255,0.05)"
                    : "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
            }}
        >
            <input
                ref={fileRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            <div style={{ 
                fontSize: "1.5rem", 
                width: "48px", 
                height: "48px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "10px"
            }}>
                {fileName ? (fileName.toLowerCase().endsWith('.pdf') ? '📄' : '📊') : '📁'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                {fileName || value.startsWith('data:') ? (
                    <div>
                        <div style={{ 
                            fontSize: "0.85rem", 
                            fontWeight: 600, 
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}>
                            {fileName || "File Uploaded"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", marginTop: "2px" }}>
                            File ready to save
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>
                            {placeholder}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "2px" }}>
                            PDF, Excel, or Word (Max {maxSizeMB}MB)
                        </div>
                    </div>
                )}
            </div>

            {(fileName || value) && (
                <button
                    onClick={handleClear}
                    style={{
                        padding: "0.4rem",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                    }}
                    title="Remove file"
                >
                    ✕
                </button>
            )}
        </motion.div>
    );
}
