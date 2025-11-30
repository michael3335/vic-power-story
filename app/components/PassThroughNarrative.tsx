"use client";

import React from "react";
import { useDetailMode } from "./DetailModeContext";

type Props = {
    phase1Avg: number | null;
    phase2Avg: number | null;
    phase3Avg: number | null;
};

const formatPercent = (value: number | null) =>
    value !== null ? `${(value * 100).toFixed(1)}%` : "—";

export default function PassThroughNarrative({
    phase1Avg,
    phase2Avg,
    phase3Avg,
}: Props) {
    const { mode } = useDetailMode();

    if (mode === "compact") {
        return (
            <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>Early on, gas price swings flowed straight into power prices.</li>
                <li>Through the mid-2020s, that link weakened and became less reliable.</li>
                <li>Now, gas is one driver among many rather than the main act.</li>
            </ul>
        );
    }

    return (
        <>
            <p>
                Earlier in the decade, changes in gas prices had a clearer effect on
                electricity prices than they do now. Phase averages suggest a
                gas-anchored regime in 2015–19 (around {formatPercent(phase1Avg)}) and
                a much weaker gas link in 2023–25 (around {formatPercent(phase3Avg)}),
                with a noisy crisis/transition period in between (
                {formatPercent(phase2Avg)}).
            </p>
            <p>
                These pass-through numbers report the percent change in wholesale power
                price per 1% move in gas price (beta × 100), so the line can be read as
                an elasticity-like response. When the coefficient turns negative—as it
                often does after 2023—it means renewables, weather or network
                conditions are pushing prices down even as gas stays high. Shaded bands
                match the three phases in the narrative so you can see the break points
                directly on the chart.
            </p>
        </>
    );
}
