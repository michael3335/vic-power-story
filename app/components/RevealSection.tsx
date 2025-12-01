"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

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

    // --- 1. Your existing "active section" logic (unchanged) ---
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

        window.addEventListener(
            ACTIVE_SECTION_EVENT,
            handleActivate as EventListener
        );
        observer.observe(el);

        if (currentActiveId === null) {
            currentActiveId = stableId;
            window.dispatchEvent(
                new CustomEvent<string>(ACTIVE_SECTION_EVENT, { detail: stableId })
            );
        }

        return () => {
            window.removeEventListener(
                ACTIVE_SECTION_EVENT,
                handleActivate as EventListener
            );
            observer.disconnect();
        };
    }, [stableId]);

    useEffect(() => {
        if (state !== "exiting") return;
        const timer = window.setTimeout(() => setState("idle"), 650);
        return () => window.clearTimeout(timer);
    }, [state]);

    // --- 2. New GSAP scroll-based reveal, layered on top ---
    useEffect(() => {
        const sectionEl = ref.current;
        if (!sectionEl) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) {
            // No animation: just ensure everything is visible
            sectionEl
                .querySelectorAll<HTMLElement>(
                    ".section-inner h1, " +
                    ".section-inner h2, " +
                    ".section-inner h3, " +
                    ".section-inner p, " +
                    ".section-inner .detail-compact, " +
                    ".section-inner .detail-detailed, " +
                    ".section-inner ul, " +
                    ".section-inner ol, " +
                    ".section-inner table, " +
                    ".section-inner .full-bleed"
                )
                .forEach((node) => {
                    node.style.opacity = "1";
                    node.style.transform = "none";
                });
            return;
        }

        let ctx: gsap.Context | null = null;
        let mounted = true;

        (async () => {
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");
            if (!mounted || !ref.current) return;

            gsap.registerPlugin(ScrollTrigger);

            const el = ref.current;

            ctx = gsap.context(() => {
                if (!el) return;

                // Main section content reveal: headings, paragraphs, detail blocks, tables, full-bleed wrappers
                const targets = gsap.utils.toArray<HTMLElement>(
                    el.querySelectorAll(
                        ".section-inner > h1, " +
                        ".section-inner > h2, " +
                        ".section-inner > h3, " +
                        ".section-inner > p, " +
                        ".section-inner > .detail-compact, " +
                        ".section-inner > .detail-detailed, " +
                        ".section-inner > ul, " +
                        ".section-inner > ol, " +
                        ".section-inner > table, " +
                        ".section-inner > .full-bleed"
                    )
                );

                if (targets.length) {
                    gsap.from(targets, {
                        autoAlpha: 0,
                        y: 20,
                        duration: 0.6,
                        ease: "power2.out",
                        stagger: 0.06,
                        scrollTrigger: {
                            trigger: el,
                            start: "top 75%",
                            toggleActions: "play none none reverse",
                        },
                    });
                }

                // Slightly enhanced bullet-list reveals for lists inside the section
                const lists = el.querySelectorAll<HTMLUListElement>("ul");
                lists.forEach((list) => {
                    const items = list.querySelectorAll("li");
                    if (!items.length) return;

                    gsap.from(items, {
                        autoAlpha: 0,
                        x: -10,
                        duration: 0.4,
                        ease: "power2.out",
                        stagger: 0.04,
                        scrollTrigger: {
                            trigger: list,
                            start: "top 80%",
                            toggleActions: "play none none reverse",
                        },
                    });
                });
            }, sectionEl);
        })();

        return () => {
            mounted = false;
            ctx?.revert();
        };
    }, []); // runs once per section on mount

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