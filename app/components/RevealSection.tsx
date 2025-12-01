"use client";

import React, { useEffect, useRef, useState } from "react";

export const ACTIVE_SECTION_EVENT = "reveal-section:activate";
let currentActiveId: string | null = null;

type Props = {
    children: React.ReactNode;
    className?: string;
    sectionId?: string;
};

type RevealState = "idle" | "active" | "exiting";

export default function RevealSection({
    children,
    className = "",
    sectionId,
}: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const generatedId = React.useId();
    const [stableId] = useState(() => sectionId ?? generatedId);
    const [state, setState] = useState<RevealState>("idle");

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleActivate = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;
            if (detail === stableId) {
                setState("active");
            } else {
                setState((prev) => (prev === "active" ? "exiting" : prev));
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
                        if (currentActiveId !== stableId) {
                            currentActiveId = stableId;
                            window.dispatchEvent(
                                new CustomEvent<string>(ACTIVE_SECTION_EVENT, {
                                    detail: stableId,
                                })
                            );
                        }
                    }
                });
            },
            {
                threshold: [0.35, 0.5, 0.65],
                rootMargin: "-10% 0px -10% 0px",
            }
        );

        window.addEventListener(ACTIVE_SECTION_EVENT, handleActivate as EventListener);
        observer.observe(el);

        if (currentActiveId === null) {
            currentActiveId = stableId;
            window.dispatchEvent(new CustomEvent<string>(ACTIVE_SECTION_EVENT, { detail: stableId }));
        }

        return () => {
            window.removeEventListener(ACTIVE_SECTION_EVENT, handleActivate as EventListener);
            observer.disconnect();
        };
    }, [stableId]);

    useEffect(() => {
        if (state !== "exiting") return;
        const timer = window.setTimeout(() => setState("idle"), 650);
        return () => window.clearTimeout(timer);
    }, [state]);

    return (
        <section
            id={stableId}
            ref={ref}
            className={`section ${state} ${className}`}
        >
            <div className="section-inner">{children}</div>
        </section>
    );
}
