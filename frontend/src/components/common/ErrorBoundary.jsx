
import React, { Component } from "react";

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * Displays a fallback UI instead of crashing the whole app
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="section" style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    minHeight: "60vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    {/* Error Icon */}
                    <div style={{
                        fontSize: "4rem",
                        marginBottom: "1.5rem",
                        animation: "pulse 2s infinite"
                    }}>
                        ⚠️
                    </div>

                    <h1 style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: "2rem",
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #dc2743 0%, #c234a5 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginBottom: "1rem"
                    }}>
                        Oops! Something Went Wrong
                    </h1>

                    <p style={{
                        color: "var(--text-muted)",
                        fontSize: "1rem",
                        maxWidth: "400px",
                        marginBottom: "2rem",
                        lineHeight: 1.6
                    }}>
                        An unexpected error occurred. Don't worry, our team has been notified.
                        Please try refreshing the page or go back to home.
                    </p>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            className="btn btnPrimary"
                            onClick={() => window.location.reload()}
                        >
                            🔄 Refresh Page
                        </button>
                        <button
                            className="btn btnGhost"
                            onClick={this.handleReset}
                        >
                            🏠 Go Home
                        </button>
                    </div>

                    {/* Error details for development */}
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <details style={{
                            marginTop: "2rem",
                            padding: "1rem",
                            background: "rgba(220, 39, 67, 0.1)",
                            borderRadius: "12px",
                            border: "1px solid rgba(220, 39, 67, 0.3)",
                            maxWidth: "600px",
                            textAlign: "left"
                        }}>
                            <summary style={{
                                cursor: "pointer",
                                color: "var(--accent-red)",
                                fontWeight: 600
                            }}>
                                🔧 Developer Details
                            </summary>
                            <pre style={{
                                marginTop: "1rem",
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                                overflow: "auto"
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
