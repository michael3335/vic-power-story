"use client";

import React from "react";
import { useDetailMode } from "./DetailModeContext";

export default function FEVDNowNarrative() {
    const { mode } = useDetailMode();

    if (mode === "compact") {
        return (
            <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>The bars show what is driving price swings now.</li>
                <li>Most movement comes from overall market conditions, not gas alone.</li>
                <li>Renewables explain more of the action than gas in the latest data.</li>
            </ul>
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
