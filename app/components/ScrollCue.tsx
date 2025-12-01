"use client";

import React from "react";
import { ACTIVE_SECTION_EVENT } from "./RevealSection";

export default function ScrollCue() {
    const [isHeroActive, setIsHeroActive] = React.useState(true);

    React.useEffect(() => {
        const handleActivate = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;
            setIsHeroActive(detail === "hero");
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

    const stateClass = isHeroActive ? "scroll-cue--visible" : "scroll-cue--hidden";

    return (
        <div className={`scroll-cue ${stateClass}`} aria-hidden="true">
            Scroll to explore ↓
        </div>
    );
}
