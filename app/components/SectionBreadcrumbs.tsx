// app/components/SectionBreadcrumbs.tsx
"use client";

import React from "react";
import { ACTIVE_SECTION_EVENT } from "./RevealSection";

type SectionInfo = {
    id: string;
    label: string;
    aliases?: string[];
};

type Props = {
    sections: SectionInfo[];
};

export default function SectionBreadcrumbs({ sections }: Props) {
    const [activeId, setActiveId] = React.useState<string | null>(
        () => sections[0]?.id ?? null
    );
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);
    const [groupHovered, setGroupHovered] = React.useState(false);

    React.useEffect(() => {
        const handleActivate = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;
            setActiveId(detail);
        };

        window.addEventListener(
            ACTIVE_SECTION_EVENT,
            handleActivate as EventListener
        );
        return () => {
            window.removeEventListener(
                ACTIVE_SECTION_EVENT,
                handleActivate as EventListener
            );
        };
    }, []);

    const handleClick = (sectionId: string) => {
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    if (!sections.length) return null;

    const showLabels = groupHovered;

    const resolveCanonicalActiveId = (id: string | null): string | null => {
        if (!id) return null;
        for (const section of sections) {
            if (section.id === id) return section.id;
            if (section.aliases?.includes(id)) return section.id;
        }
        return id;
    };

    const canonicalActiveId = resolveCanonicalActiveId(activeId);

    return (
        <div
            aria-label="Page breadcrumbs"
            onMouseEnter={() => setGroupHovered(true)}
            onMouseLeave={() => setGroupHovered(false)}
            style={{
                position: "fixed",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                zIndex: 50,
                minWidth: 160,
            }}
        >
            {sections.map((section) => {
                const isHovered = section.id === hoveredId;
                const isActive = section.id === canonicalActiveId;
                const baseOpacity = 0.5;
                const activeOpacity = 0.9;
                const targetOpacity = isActive ? activeOpacity : baseOpacity;
                const hoveredOpacity = isHovered
                    ? Math.min(1, targetOpacity + 0.1)
                    : targetOpacity;

                return (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => handleClick(section.id)}
                        onMouseEnter={() => setHoveredId(section.id)}
                        onMouseLeave={() =>
                            setHoveredId((prev) =>
                                prev === section.id ? null : prev
                            )
                        }
                        aria-label={section.label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "transparent",
                            border: "none",
                            padding: "4px 0",
                            cursor: "pointer",
                            color: "#111",
                            opacity: hoveredOpacity,
                            transition: "opacity 0.2s ease",
                        }}
                    >
                        <span
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 999,
                                backgroundColor: "#111",
                                filter: isHovered ? "brightness(1.1)" : "none",
                                transition: "opacity 0.2s ease, filter 0.2s ease",
                                opacity: hoveredOpacity,
                            }}
                        />
                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: isActive ? 600 : 500,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                opacity: showLabels ? (isActive ? 0.85 : 0.5) : 0,
                                whiteSpace: "nowrap",
                                width: 140,
                                textAlign: "left",
                                transition: "opacity 0.2s ease",
                                visibility: showLabels ? "visible" : "hidden",
                            }}
                        >
                            {section.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}