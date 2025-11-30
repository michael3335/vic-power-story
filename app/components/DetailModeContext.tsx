"use client";

import React from "react";

export type DetailMode = "compact" | "detailed";

type DetailModeContextValue = {
    mode: DetailMode;
    setMode: (mode: DetailMode) => void;
};

const DetailModeContext = React.createContext<DetailModeContextValue | null>(null);

type ProviderProps = {
    children: React.ReactNode;
};

export function DetailModeProvider({ children }: ProviderProps) {
    const [mode, setMode] = React.useState<DetailMode>("compact");

    const isCompact = mode === "compact";

    const toggle = () => {
        setMode((prev) => (prev === "compact" ? "detailed" : "compact"));
    };

    return (
        <DetailModeContext.Provider value={{ mode, setMode }}>
            <div className="relative">
                <div className="detail-toggle" aria-label="Toggle detail level">
                    <span className="detail-toggle__mode">
                        {isCompact ? "Compact" : "Detailed"}
                    </span>
                    <button
                        type="button"
                        onClick={toggle}
                        aria-label={`Switch to ${isCompact ? "detailed" : "compact"} view`}
                        className="detail-toggle__button"
                    >
                        <span className="detail-toggle__track">
                            <span
                                className="detail-toggle__thumb"
                                style={{
                                    transform: isCompact ? "translateX(0)" : "translateX(20px)",
                                }}
                            />
                        </span>
                    </button>
                </div>
                {children}
            </div>
        </DetailModeContext.Provider>
    );
}

export function useDetailMode(): DetailModeContextValue {
    const ctx = React.useContext(DetailModeContext);
    if (!ctx) {
        throw new Error("useDetailMode must be used within a DetailModeProvider");
    }
    return ctx;
}
