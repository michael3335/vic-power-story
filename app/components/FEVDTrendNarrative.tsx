"use client";

import React from "react";
import { useDetailMode } from "./DetailModeContext";

export default function FEVDTrendNarrative() {
    const { mode } = useDetailMode();

    if (mode === "compact") {
        return (
            <p>
                Each panel uses the same 0–100% scale so you can compare drivers over
                time at a glance.
            </p>
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

