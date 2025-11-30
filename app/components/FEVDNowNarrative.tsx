"use client";

import React from "react";
import { useDetailMode } from "./DetailModeContext";

export default function FEVDNowNarrative() {
    const { mode } = useDetailMode();

    if (mode === "compact") {
        return (
            <p>
                The stacked bars summarise how much each driver contributes to price
                ups and downs over a two-year horizon, with other/own price
                dynamics dominating and renewables next.
            </p>
        );
    }

    return (
        <p>
            The bars and numbers show how much each driver contributes to price ups and
            downs over that two-year horizon. The two rows use slightly different
            technical ordering choices in the VAR, but they tell the same big-picture
            story about what actually moves prices.
        </p>
    );
}

