// components/RevealSection.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
    children: React.ReactNode;
    className?: string;
};

export default function RevealSection({ children, className = "" }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        // Once revealed, we can stop observing
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
            }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <section
            ref={ref}
            className={`section ${visible ? "visible" : ""} ${className}`}
        >
            {children}
        </section>
    );
}