"use client";

import React from "react";
import { useDetailMode } from "./DetailModeContext";

export default function RenShareNarrative() {
    const { mode } = useDetailMode();

    if (mode === "compact") {
        return (
            <p>
                Renewables&apos; share of Victorian generation rises sharply over the
                decade, helping shift prices from being fuel-led to more weather-led.
            </p>
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

