"use client";

import React from "react";
import { ACTIVE_SECTION_EVENT } from "./RevealSection";

type SectionInfo = {
    id: string;
    label: string;
};

type Props = {
    sections: SectionInfo[];
};

export default function SectionBreadcrumbs({ sections }: Props) {
    const [activeId, setActiveId] = React.useState<string | null>(() => sections[0]?.id ?? null);

    React.useEffect(() => {
        const handleActivate = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;
            setActiveId(detail);
        };

        window.addEventListener(ACTIVE_SECTION_EVENT, handleActivate as EventListener);
        return () => {
            window.removeEventListener(ACTIVE_SECTION_EVENT, handleActivate as EventListener);
        };
    }, []);

    if (!sections.length) return null;

    return (
        <div
            aria-label="Page breadcrumbs"
            className="hidden lg:flex flex-col fixed left-4 top-1/2 -translate-y-1/2 space-y-3"
        >
            {sections.map((section) => {
                const isActive = section.id === activeId;
                return (
                    <span
                        key={section.id}
                        role="presentation"
                        aria-label={section.label}
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            backgroundColor: "#111",
                            opacity: isActive ? 0.35 : 0.8,
                            transition: "opacity 0.2s ease",
                        }}
                    />
                );
            })}
        </div>
    );
}
