"use client";

import React from "react";

const MIN_SCROLL = 30;

export default function ScrollCue() {
    const [atTop, setAtTop] = React.useState(true);

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const handleScroll = () => {
            const isTop = window.scrollY <= MIN_SCROLL;
            setAtTop(isTop);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            className={`scroll-cue ${atTop ? "scroll-cue--visible" : "scroll-cue--hidden"}`}
            aria-hidden="true"
        >
            Scroll to explore ↓
        </div>
    );
}
