import React from "react";

/**
 * LivePreview Component
 * Shows a visual mockup preview of theme colors in real-time.
 * Receives theme props directly from ThemeTab and updates instantly.
 */
export default function LivePreview({ theme = {}, updateKey = 0 }) {
    // Helper to get color from theme props (uses friendly names like "Accent Red")
    const getColor = (friendlyName, fallback) => {
        return theme[friendlyName] || fallback;
    };

    // Get colors from theme
    const colors = {
        bgDark: getColor("Background Dark", "#0a0a0f"),
        bgCard: getColor("Background Card", "#120c1c"),
        accentRed: getColor("Accent Red", "#dc2743"),
        accentCyan: getColor("Accent Cyan", "#00d9ff"),
        accentPink: getColor("Accent Pink", "#c234a5"),
        textPrimary: getColor("Text Primary", "#ffffff"),
        textSecondary: getColor("Text Secondary", "#e8e0ed"),
        textMuted: getColor("Text Muted", "#9a8fa6"),
        titleThe: getColor("Title THE", "#ff4d6d"),
        titleComputing: getColor("Title COMPUTING", "#c77dff"),
        titleSociety: getColor("Title SOCIETY", "#00d9ff"),
        linkColor: getColor("Link Color", "#00d9ff"),
        btnPrimary: getColor("Button Primary", "#dc2743"),
        modalBg: getColor("Modal Background", "#120c1c"),
        modalBorder: getColor("Modal Border", "#3a2050"),
        sidebarBg: getColor("Sidebar Background", "#0f0812"),
    };

    return (
        <div
            key={updateKey} // Force re-render when theme changes
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden"
            }}
        >
            {/* Preview Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "rgba(0,0,0,0.4)",
                borderBottom: "1px solid rgba(255,255,255,0.1)"
            }}>
                <div style={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: colors.accentCyan
                }}>
                    🎨 Live Theme Preview
                </div>
                <div style={{
                    marginLeft: "auto",
                    fontSize: "0.65rem",
                    padding: "0.2rem 0.5rem",
                    background: "rgba(0,255,100,0.15)",
                    color: "#4ade80",
                    borderRadius: "4px",
                    fontWeight: 600
                }}>
                    ● LIVE
                </div>
            </div>

            {/* Visual Preview - Mini Website Mockup */}
            <div style={{
                flex: 1,
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                overflowY: "auto"
            }}>
                {/* Mini Browser Window */}
                <div style={{
                    background: colors.bgDark,
                    borderRadius: "12px",
                    border: `1px solid ${colors.modalBorder}`,
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    transition: "all 0.2s ease"
                }}>
                    {/* Browser Tab Bar */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        background: colors.sidebarBg,
                        borderBottom: `1px solid ${colors.modalBorder}`
                    }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }}></span>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }}></span>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c940" }}></span>
                        </div>
                        <div style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "0.65rem",
                            color: colors.textMuted,
                            background: "rgba(255,255,255,0.05)",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px"
                        }}>
                            tcs-website.vercel.app
                        </div>
                    </div>

                    {/* Mini Website Content */}
                    <div style={{ padding: "1rem" }}>
                        {/* Mini Header/Logo */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "1rem"
                        }}>
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${colors.accentRed}, ${colors.accentPink})`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                color: "white",
                                transition: "all 0.2s ease"
                            }}>
                                TCS
                            </div>
                            <div>
                                <span style={{ color: colors.titleThe, fontWeight: 700, fontSize: "0.7rem", transition: "color 0.2s" }}>THE </span>
                                <span style={{ color: colors.titleComputing, fontWeight: 700, fontSize: "0.7rem", transition: "color 0.2s" }}>COMPUTING </span>
                                <span style={{ color: colors.titleSociety, fontWeight: 700, fontSize: "0.7rem", transition: "color 0.2s" }}>SOCIETY</span>
                            </div>
                        </div>

                        {/* Hero Section Mini */}
                        <div style={{
                            background: colors.bgCard,
                            borderRadius: "8px",
                            padding: "0.75rem",
                            marginBottom: "0.75rem",
                            border: `1px solid ${colors.modalBorder}`,
                            transition: "all 0.2s ease"
                        }}>
                            <div style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                marginBottom: "0.25rem",
                                color: colors.textPrimary,
                                transition: "color 0.2s"
                            }}>
                                Welcome to TCS
                            </div>
                            <div style={{
                                fontSize: "0.6rem",
                                color: colors.textMuted,
                                marginBottom: "0.5rem",
                                transition: "color 0.2s"
                            }}>
                                Department of Computer Science, UAF
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                <button style={{
                                    background: colors.btnPrimary,
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "0.25rem 0.5rem",
                                    fontSize: "0.55rem",
                                    color: "white",
                                    fontWeight: 600,
                                    transition: "all 0.2s ease"
                                }}>
                                    Explore
                                </button>
                                <button style={{
                                    background: "transparent",
                                    border: `1px solid ${colors.accentCyan}`,
                                    borderRadius: "4px",
                                    padding: "0.25rem 0.5rem",
                                    fontSize: "0.55rem",
                                    color: colors.accentCyan,
                                    fontWeight: 600,
                                    transition: "all 0.2s ease"
                                }}>
                                    Events
                                </button>
                            </div>
                        </div>

                        {/* Stats Mini */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "0.5rem",
                            marginBottom: "0.75rem"
                        }}>
                            {["500+", "50+", "10+"].map((stat, i) => (
                                <div key={i} style={{
                                    textAlign: "center",
                                    padding: "0.4rem",
                                    background: colors.bgCard,
                                    borderRadius: "6px",
                                    border: `1px solid ${colors.modalBorder}`,
                                    transition: "all 0.2s ease"
                                }}>
                                    <div style={{
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        color: colors.accentRed,
                                        transition: "color 0.2s"
                                    }}>{stat}</div>
                                    <div style={{
                                        fontSize: "0.5rem",
                                        color: colors.textMuted,
                                        transition: "color 0.2s"
                                    }}>
                                        {["Members", "Events", "Years"][i]}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Links Preview */}
                        <div style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap"
                        }}>
                            {["Home", "Events", "Gallery", "Tickets"].map((link, i) => (
                                <span key={i} style={{
                                    fontSize: "0.55rem",
                                    color: i === 0 ? colors.accentRed : colors.linkColor,
                                    padding: "0.2rem 0.4rem",
                                    background: i === 0 ? `${colors.accentRed}15` : "transparent",
                                    borderRadius: "4px",
                                    transition: "all 0.2s ease"
                                }}>
                                    {link}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Color Swatches - Now shows actual theme colors */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0.5rem"
                }}>
                    {[
                        { label: "Primary", color: colors.accentRed },
                        { label: "Accent", color: colors.accentCyan },
                        { label: "Background", color: colors.bgDark },
                        { label: "Text", color: colors.textPrimary }
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <div style={{
                                width: "100%",
                                height: 30,
                                borderRadius: "6px",
                                background: item.color,
                                border: "1px solid rgba(255,255,255,0.1)",
                                marginBottom: "0.25rem",
                                transition: "background 0.2s ease"
                            }}></div>
                            <div style={{
                                fontSize: "0.55rem",
                                color: "rgba(255,255,255,0.5)"
                            }}>
                                {item.label}
                            </div>
                            <div style={{
                                fontSize: "0.5rem",
                                color: colors.accentCyan,
                                fontFamily: "monospace"
                            }}>
                                {item.color}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Title Colors Swatches */}
                <div style={{
                    padding: "0.5rem",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "8px"
                }}>
                    <div style={{
                        fontSize: "0.6rem",
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: "0.4rem",
                        textAlign: "center"
                    }}>
                        Title Colors
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.5rem",
                        alignItems: "center"
                    }}>
                        <span style={{
                            color: colors.titleThe,
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            transition: "color 0.2s"
                        }}>THE</span>
                        <span style={{
                            color: colors.titleComputing,
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            transition: "color 0.2s"
                        }}>COMPUTING</span>
                        <span style={{
                            color: colors.titleSociety,
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            transition: "color 0.2s"
                        }}>SOCIETY</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                padding: "0.5rem 1rem",
                background: "rgba(0,0,0,0.3)",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                fontSize: "0.65rem",
                color: colors.textMuted,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
            }}>
                <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    animation: "pulse 2s infinite"
                }}></span>
                Colors update instantly as you edit
            </div>
        </div>
    );
}
