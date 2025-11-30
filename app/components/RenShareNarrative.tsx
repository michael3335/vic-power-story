"use client";

import React from "react";
import { useDetailMode } from "./DetailModeContext";

export default function RenShareNarrative() {
    const { mode } = useDetailMode();

    if (mode === "compact") {
        return (
            <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>Renewable generation in Victoria climbs sharply over the decade.</li>
                <li>That growth helps shift prices from fuel-led to more weather-led.</li>
            </ul>
        );
    }

    return (
        <>
            <p>
                From 2015 to 2025, renewables&apos; share of generation rises from
                roughly one-fifth to well over one-half. That structural change is one
                reason prices now respond more to weather and renewable availability
                than to gas alone.
            </p>
        </>
    );
}
