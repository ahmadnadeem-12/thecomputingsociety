
import React from "react";
import { motion } from "framer-motion";

/**
 * LoadingSpinner - Reusable loading indicator
 * @param {Object} props
 * @param {string} props.size - Size: 'sm', 'md', 'lg'
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullPage - If true, centers on full page
 */
export default function LoadingSpinner({
    size = "md",
    text = "",
    fullPage = false
}) {
    const sizes = {
        sm: { spinner: 24, border: 3 },
        md: { spinner: 40, border: 4 },
        lg: { spinner: 60, border: 5 }
    };

    const { spinner, border } = sizes[size] || sizes.md;

    const spinnerStyle = {
        width: spinner,
        height: spinner,
        borderRadius: "50%",
        border: `${border}px solid rgba(255, 255, 255, 0.1)`,
        borderTopColor: "var(--accent-red)",
        borderRightColor: "var(--accent-pink)",
    };

    const containerStyle = fullPage ? {
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(5, 5, 8, 0.9)",
        backdropFilter: "blur(10px)",
        zIndex: 9999
    } : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem"
    };

    return (
        <div style={containerStyle}>
            <motion.div
                style={spinnerStyle}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            {text && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        marginTop: "1rem",
                        color: "var(--text-muted)",
                        fontSize: size === "sm" ? "0.8rem" : "0.9rem",
                        fontWeight: 500
                    }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
}
