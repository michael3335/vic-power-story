import React from "react";
import type { FEVDFullRow } from "@/types/results";

type Props = {
    demandFirst: FEVDFullRow | null;
    renFirst: FEVDFullRow | null;
};

type DriverKey = "Gas" | "Renewables" | "Imports" | "Demand";

const SCENARIOS: Array<{
    key: DriverKey;
    label: string;
    shockLabel: string;
    magnitude: number; // expressed as decimal change, e.g. +0.1 = +10%
}> = [
    {
        key: "Renewables",
        label: "Weak wind/solar output",
        shockLabel: "-20%",
        magnitude: -0.2,
    },
    {
        key: "Imports",
        label: "Interconnector constraint",
        shockLabel: "-30%",
        magnitude: -0.3,
    },
    {
        key: "Demand",
        label: "Heatwave demand jump",
        shockLabel: "+10%",
        magnitude: 0.1,
    },
    {
        key: "Gas",
        label: "Global gas price spike",
        shockLabel: "+50%",
        magnitude: 0.5,
    },
];

export default function BillSensitivityTable({ demandFirst, renFirst }: Props) {
    if (!demandFirst && !renFirst) return null;

    // Use the average of the two orderings to keep it simple and stable
    const drivers: DriverKey[] = ["Gas", "Renewables", "Imports", "Demand"];
    const averages: Record<DriverKey, number> = drivers.reduce((acc, key) => {
        const d = demandFirst ? demandFirst[key] : null;
        const r = renFirst ? renFirst[key] : null;
        const vals = [d, r].filter((v): v is number => typeof v === "number");
        const avg = vals.length ? vals.reduce((sum, v) => sum + v, 0) / vals.length : 0;
        return { ...acc, [key]: avg };
    }, {} as Record<DriverKey, number>);

    return (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-4 shadow-[0_10px_40px_-32px_rgba(0,0,0,0.45)]">
            <div className="mb-2 text-sm font-semibold text-neutral-900">
                How different shocks could affect bills (illustrative only)
            </div>
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="text-left text-neutral-600">
                        <th className="border border-neutral-300 px-2 py-1">Scenario</th>
                        <th className="border border-neutral-300 px-2 py-1">Shock</th>
                        <th className="border border-neutral-300 px-2 py-1 text-right">FEVD share</th>
                        <th className="border border-neutral-300 px-2 py-1 text-right">
                            Approximate change in average monthly wholesale price (illustrative only)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {SCENARIOS.map((row) => {
                        const share = averages[row.key];
                        const approx = Math.abs(share * row.magnitude * 100);
                        return (
                            <tr key={row.key}>
                                <td className="border border-neutral-300 px-2 py-1">{row.label}</td>
                                <td className="border border-neutral-300 px-2 py-1">{row.shockLabel}</td>
                                <td className="border border-neutral-300 px-2 py-1 text-right">
                                    {(share * 100).toFixed(1)}%
                                </td>
                                <td className="border border-neutral-300 px-2 py-1 text-right">
                                    {share ? `${approx.toFixed(2)}%` : "—"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="mt-2 text-[11px] text-neutral-600">
                These are back-of-the-envelope, illustrative sensitivities that scale the
                modelled shares by the assumed shock size. They show relative exposure,
                not exact bill changes or elasticities.
            </div>
            <p className="mt-2 text-[11px] text-neutral-600">
                Each row reports the approximate magnitude of the average monthly wholesale
                price move that follows from the scenario’s shock (share × shock magnitude × 100).
                The direction is implied by whether the shock raises or restricts the driver,
                and the calculations ignore higher-order dynamics and feedbacks.
            </p>
        </div>
    );
}
