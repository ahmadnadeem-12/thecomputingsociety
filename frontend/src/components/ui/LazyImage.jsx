
import React, { useState, useRef, useEffect, memo } from "react";

/**
 * LazyImage - Lazy loading image with blur placeholder
 * Uses IntersectionObserver for performance
 */
const LazyImage = memo(function LazyImage({
    src,
    alt = "",
    className = "",
    style = {},
    fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%231a0a25' width='100' height='100'/%3E%3C/svg%3E"
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "100px", threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    const containerStyle = {
        position: "relative",
        overflow: "hidden",
        backgroundColor: "rgba(26, 10, 37, 0.5)",
        ...style
    };

    const imgStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "opacity 0.3s ease, filter 0.3s ease",
        opacity: isLoaded ? 1 : 0,
        filter: isLoaded ? "blur(0)" : "blur(10px)"
    };

    const placeholderStyle = {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, rgba(30, 15, 45, 0.9), rgba(15, 8, 25, 0.95))",
        opacity: isLoaded ? 0 : 1,
        transition: "opacity 0.3s ease"
    };

    return (
        <div ref={imgRef} style={containerStyle} className={className}>
            {/* Placeholder */}
            <div style={placeholderStyle}>
                <div style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.1)",
                    borderTopColor: "var(--accent-pink)",
                    animation: isInView && !isLoaded ? "spin 1s linear infinite" : "none"
                }} />
            </div>

            {/* Actual Image */}
            {isInView && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    style={imgStyle}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                />
            )}

            {/* Fallback for error */}
            {hasError && (
                <div style={{
                    ...placeholderStyle,
                    opacity: 1,
                    flexDirection: "column",
                    gap: "0.5rem"
                }}>
                    <span style={{ fontSize: "1.5rem" }}>🖼️</span>
                    <span style={{
                        fontSize: "0.7rem",
                        color: "var(--text-dim)"
                    }}>
                        Image unavailable
                    </span>
                </div>
            )}

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
});

export default LazyImage;
