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
    const idRef = useRef<string>(sectionId ?? React.useId());
    const [state, setState] = useState<RevealState>("idle");

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleActivate = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;
            if (detail === idRef.current) {
                setState("active");
            } else {
                setState((prev) => (prev === "active" ? "exiting" : prev));
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        if (currentActiveId !== idRef.current) {
                            currentActiveId = idRef.current;
                            window.dispatchEvent(new CustomEvent<string>(ACTIVE_SECTION_EVENT, { detail: idRef.current }));
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
            currentActiveId = idRef.current;
            window.dispatchEvent(new CustomEvent<string>(ACTIVE_SECTION_EVENT, { detail: idRef.current }));
        }

        return () => {
            window.removeEventListener(ACTIVE_SECTION_EVENT, handleActivate as EventListener);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (state !== "exiting") return;
        const timer = window.setTimeout(() => setState("idle"), 650);
        return () => window.clearTimeout(timer);
    }, [state]);

    return (
        <section
            id={idRef.current}
            ref={ref}
            className={`section ${state} ${className}`}
            style={{ scrollSnapAlign: "center" }}
        >
            <div className="section-inner">{children}</div>
        </section>
    );
}
