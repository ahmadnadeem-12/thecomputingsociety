
import React, { useState, useEffect, useMemo } from "react";
import LivePreview from "../../../components/admin/LivePreview";

export default function ThemeTab({
    draftTheme,
    setDraftTheme,
    hasUnsaved,
    setHasUnsaved,
    themeCtx
}) {
    // Color groups
    const colorGroups = {
        "🎨 Background Colors": ["Background Dark", "Background Darker", "Background Purple", "Background Card"],
        "✨ Accent Colors": ["Accent Red", "Accent Pink", "Accent Purple", "Accent Cyan", "Accent Gold"],
        "📝 Text Colors": ["Text Primary", "Text Secondary", "Text Muted", "Text Dim"],
        "🔲 Border Colors": ["Border Soft", "Border Glow"],
        "🏷️ Title Colors (THE COMPUTING SOCIETY)": ["Title THE", "Title COMPUTING", "Title SOCIETY"],
        "🪟 Glass Effect": ["Glass Background", "Glass Border"],
        "📌 Sidebar": ["Sidebar Background", "Sidebar Border", "Sidebar Text"],
        "🎨 TCS Logo Gradient": ["TCS Logo Start", "TCS Logo Middle", "TCS Logo End"],
        "💬 Modal/Dialog": ["Modal Background", "Modal Border", "Modal Header"],
        "🔗 Links & Buttons": ["Link Color", "Button Primary", "Button Hover"]
    };

    // Get current theme with defaults
    const currentTheme = useMemo(() => {
        const defaultTheme = themeCtx?.defaultTheme || {};
        return { ...defaultTheme, ...draftTheme };
    }, [draftTheme, themeCtx?.defaultTheme]);

    // Apply theme live whenever it changes
    useEffect(() => {
        if (themeCtx?.applyLive && Object.keys(currentTheme).length > 0) {
            themeCtx.applyLive(currentTheme);
            // Also save to localStorage so iframe can read it
            localStorage.setItem('tcs_theme_preview', JSON.stringify(currentTheme));
        }
    }, [currentTheme, themeCtx]);

    // Counter for triggering iframe refresh
    const [themeChangeCount, setThemeChangeCount] = useState(0);

    const handleColorChange = (colorKey, newValue) => {
        setDraftTheme(prev => ({ ...prev, [colorKey]: newValue }));
        setHasUnsaved(true);
        setThemeChangeCount(prev => prev + 1);
    };

    const handleSaveTheme = () => {
        const password = prompt("Enter admin password to save theme:");
        if (password === "tcsadmin") {
            themeCtx.setTheme(currentTheme);
            setHasUnsaved(false);
            alert("✅ Theme saved successfully!");
        } else {
            alert("❌ Incorrect password!");
        }
    };

    const handleReset = () => {
        if (confirm("Reset theme to defaults?")) {
            themeCtx.reset();
            setDraftTheme(themeCtx.defaultTheme || {});
            setHasUnsaved(false);
        }
    };

    const handleCancel = () => {
        setDraftTheme(themeCtx.theme || {});
        themeCtx.applyLive(themeCtx.theme || {});
        setHasUnsaved(false);
    };

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
            gap: "1rem",
            minHeight: "400px",
            maxHeight: "calc(100vh - 180px)",
            overflow: "hidden"
        }}>
            {/* LEFT PANEL - Color Controls */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                height: "100%",
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "0.25rem"
            }}>
                {/* Info Banner */}
                <div style={{
                    background: "linear-gradient(135deg, rgba(220, 39, 67, 0.15), rgba(194, 52, 165, 0.15))",
                    border: "1px solid rgba(220, 39, 67, 0.3)",
                    borderRadius: "12px",
                    padding: "1rem 1.25rem",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backdropFilter: "blur(10px)"
                }}>
                    <div style={{ fontWeight: 700, marginBottom: ".3rem", color: "#ff8fa3" }}>
                        🎨 Live Theme Editor
                    </div>
                    <div style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
                        Changes apply instantly! See preview on the right →
                    </div>
                </div>

                {/* Debug Info */}
                <div style={{
                    padding: "0.5rem",
                    background: "rgba(255, 193, 7, 0.1)",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontFamily: "monospace"
                }}>
                    Theme Keys Loaded: {Object.keys(currentTheme).length}
                    {Object.keys(currentTheme).length === 0 && " ⚠️ NO THEME LOADED!"}
                </div>

                {/* Color Groups */}
                {Object.entries(colorGroups).map(([groupName, colorKeys]) => (
                    <div key={groupName} style={{
                        marginBottom: "0.5rem",
                        padding: "0.75rem",
                        background: "rgba(20, 12, 30, 0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px"
                    }}>
                        <div style={{ fontWeight: 700, marginBottom: ".5rem", fontSize: ".85rem", color: "#ff8fa3" }}>
                            {groupName}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
                            {colorKeys.map(colorKey => {
                                const colorValue = currentTheme[colorKey] || "#ffffff";

                                return (
                                    <div key={colorKey} style={{
                                        display: "flex",
                                        gap: "0.4rem",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: ".25rem .4rem",
                                        borderRadius: "6px",
                                        background: "rgba(0,0,0,0.2)",
                                        border: "1px solid rgba(255,255,255,0.05)"
                                    }}>
                                        {/* Color Name */}
                                        <div style={{
                                            flex: 1,
                                            color: "var(--text-secondary)",
                                            fontSize: ".7rem",
                                            fontWeight: 500
                                        }}>
                                            {colorKey}
                                        </div>

                                        {/* Color Picker */}
                                        <input
                                            type="color"
                                            value={colorValue.startsWith('#') ? colorValue.slice(0, 7) : "#ffffff"}
                                            onChange={(e) => handleColorChange(colorKey, e.target.value)}
                                            style={{
                                                width: "32px",
                                                height: "24px",
                                                padding: 0,
                                                border: "1px solid rgba(255,255,255,0.25)",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                flexShrink: 0,
                                                position: "relative",
                                                zIndex: 1,
                                                pointerEvents: "auto"
                                            }}
                                            title={`Change ${colorKey}`}
                                        />

                                        {/* Current Value */}
                                        <div style={{
                                            fontSize: ".65rem",
                                            color: "var(--text-muted)",
                                            fontFamily: "monospace",
                                            minWidth: "55px",
                                            textAlign: "right",
                                            flexShrink: 0
                                        }}>
                                            {colorValue.startsWith('#') ? colorValue.slice(0, 7) : colorValue}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Action Buttons */}
                <div style={{
                    display: "flex",
                    gap: ".5rem",
                    flexWrap: "wrap",
                    padding: "0.6rem",
                    marginTop: "auto",
                    background: "rgba(10, 5, 15, 0.95)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    position: "sticky",
                    bottom: 0,
                    zIndex: 100
                }}>
                    <button
                        className={`btn ${hasUnsaved ? "btnPrimary" : "btnGhost"}`}
                        onClick={handleSaveTheme}
                        disabled={!hasUnsaved}
                        style={{ flex: 1, fontSize: ".8rem", padding: ".5rem .75rem" }}
                    >
                        💾 Save Theme
                    </button>
                    <button
                        className="btn btnGhost"
                        disabled={!hasUnsaved}
                        onClick={handleCancel}
                        style={{ fontSize: ".8rem", padding: ".5rem .75rem" }}
                    >
                        ✕ Cancel
                    </button>
                    <button
                        className="btn btnGhost"
                        onClick={handleReset}
                        style={{ fontSize: ".8rem", padding: ".5rem .75rem" }}
                    >
                        🔄 Reset
                    </button>
                </div>

                {/* Unsaved Changes Indicator */}
                {hasUnsaved && (
                    <div style={{
                        padding: ".6rem .75rem",
                        background: "rgba(255, 193, 7, 0.15)",
                        border: "1px solid rgba(255, 193, 7, 0.4)",
                        borderRadius: "10px",
                        color: "#ffd54f",
                        fontSize: ".8rem",
                        textAlign: "center"
                    }}>
                        ⚠️ Unsaved changes - Click "Save Theme" to keep them
                    </div>
                )}
            </div>

            {/* RIGHT PANEL - Live Preview */}
            <div style={{
                position: "sticky",
                top: 0,
                height: "calc(100vh - 200px)",
                minHeight: "500px"
            }}>
                <LivePreview theme={currentTheme} updateKey={themeChangeCount} />
            </div>
        </div>
    );
}
