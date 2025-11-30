"use client";

import React from "react";
import { useDetailMode } from "./DetailModeContext";

export default function FEVDTrendNarrative() {
    const { mode } = useDetailMode();

    if (mode === "compact") {
        return (
            <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>Each panel tracks how important each driver is over time.</li>
                <li>You can scan across to see gas fading and renewables rising.</li>
            </ul>
        );
    }

    return (
        <p>
            Each panel uses the same 0–100% scale so you can see at a glance how much
            each driver usually moves. Across the decade,{" "}
            <span style={{ whiteSpace: "nowrap" }}>other / own price</span> dominates,
            renewables gradually rise, and gas stays relatively small in the most
            recent years.
        </p>
    );
}
