"use client";

import React from "react";
import { useDetailMode } from "./DetailModeContext";

export default function RenShareNarrative() {
    const { mode } = useDetailMode();

    if (mode === "compact") {
        return (
            <>
                <p>
                    The charts below show monthly series since 2015, including the share of generation from renewables.
                </p>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Victoria now gets a much larger share of its power from wind and solar than it did a decade ago.</li>
                    <li>The shift suggests dependence on coal is likely to have decreased.</li>
                </ul>
            </>
        );
    }

    return (
        <>
            <p>
                The charts below show monthly series since 2015, including the share of generation from renewables.
            </p>
            <p>
                From 2015 to 2025, renewables&apos; share of generation rises from
                roughly one-fifth to well over one-half. That structural change is one
                reason prices now respond more to weather and renewable availability
                than to gas alone.
            </p>
        </>
    );
}
