"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import type { LabelContentType, Props as LabelProps } from "recharts/types/component/Label";
import type { FEVDFullRow } from "@/types/results";

type Props = {
    demandFirst: FEVDFullRow | null;
    renFirst: FEVDFullRow | null;
};

interface FEVDTooltipPayload {
    label: string;
    Gas: number;
    Renewables: number;
    Imports: number;
    Demand: number;
    Own: number;
}

interface FEVDTooltipProps {
    active?: boolean;
    payload?: { payload: FEVDTooltipPayload }[];
}

type FEVDStackKey = Exclude<keyof FEVDFullRow, "horizon">;

const LABELS: FEVDStackKey[] = [
    "Gas",
    "Renewables",
    "Imports",
    "Demand",
    "Own",
];

const COLORS = {
    Gas: "#d97706", // amber-600
    Renewables: "#16a34a", // green-600
    Imports: "#2563eb", // blue-600
    Demand: "#7c3aed", // violet-600
    Own: "#6b7280", // gray-500
} as const;

const CustomTooltip: React.FC<FEVDTooltipProps> = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;

    return (
        <div className="rounded-md border border-neutral-300 bg-white/95 px-3 py-2 text-xs text-black shadow-sm">
            <div className="mb-1 font-semibold">{p.label}</div>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Gas</span>
                    <span>{(p.Gas * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span>Renewables</span>
                    <span>{(p.Renewables * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span>Imports</span>
                    <span>{(p.Imports * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span>Demand</span>
                    <span>{(p.Demand * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span>Other / own price</span>
                    <span>{(p.Own * 100).toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
};

export default function FEVDNowChartTableClient({
    demandFirst,
    renFirst,
}: Props) {
    const hasDemand = !!demandFirst;
    const hasRen = !!renFirst;

    if (!hasDemand && !hasRen) {
        return <p className="text-sm text-neutral-600">No FEVD data found.</p>;
    }

    type ChartRow = { label: string } & Record<FEVDStackKey, number>;

    const chartData: ChartRow[] = [
        ...(hasDemand
            ? [
                {
                    label: "Demand first",
                    Gas: demandFirst!.Gas,
                    Renewables: demandFirst!.Renewables,
                    Imports: demandFirst!.Imports,
                    Demand: demandFirst!.Demand,
                    Own: demandFirst!.Own,
                },
            ]
            : []),
        ...(hasRen
            ? [
                {
                    label: "Renewables first",
                    Gas: renFirst!.Gas,
                    Renewables: renFirst!.Renewables,
                    Imports: renFirst!.Imports,
                    Demand: renFirst!.Demand,
                    Own: renFirst!.Own,
                },
            ]
            : []),
    ];

    const summaries = chartData.map((row) => {
        const sorted = LABELS.map((key) => ({
            key,
            label: key === "Own" ? "Other / own price" : key,
            value: row[key],
        })).sort((a, b) => b.value - a.value);

        return {
            label: row.label,
            top: sorted[0],
            runnerUp: sorted[1],
        };
    });

    const toNumber = (value?: number | string) => {
        if (typeof value === "number") return value;
        if (typeof value === "string") {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
        }
        return 0;
    };

    const labelInsideBar: LabelContentType = ({
        x,
        y,
        width,
        height,
        value,
    }: LabelProps) => {
        const rawValue =
            typeof value === "number"
                ? value
                : typeof value === "string"
                    ? Number(value)
                    : NaN;
        if (!Number.isFinite(rawValue)) return "";
        const pct = rawValue * 100;

        const widthNum = toNumber(width);
        const heightNum = toNumber(height);
        const xNum = toNumber(x);
        const yNum = toNumber(y);
        // Avoid cluttering tiny slivers
        if (pct < 8 || widthNum < 32) return "";

        const text = pct >= 20 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;

        return (
            <text
                x={xNum + widthNum / 2}
                y={yNum + heightNum / 2 + 4}
                fill="#f9fafb"
                fontSize={11}
                fontWeight={600}
                textAnchor="middle"
            >
                {text}
            </text>
        );
    };

    const CHART_HEIGHT = 230;

    return (
        <div className="space-y-4">
            {/* Local title / strapline */}
            <div className="text-center text-xs text-neutral-700">
                <div className="font-semibold">
                    What actually drives price ups and downs?
                </div>
                <div className="mt-1 text-[11px] text-neutral-600">
                    Looking over the next two years, most of the movement in prices comes
                    from{" "}
                    <span className="whitespace-nowrap">other / own price</span>{" "}
                    dynamics, with renewables next and gas only a small slice.
                </div>
            </div>

            {/* Summary chips */}
            <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
                {summaries.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] shadow-sm"
                    >
                        <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                            {s.label}
                        </div>
                        <div className="text-xs font-semibold text-neutral-900">
                            {s.top.label} leads ({(s.top.value * 100).toFixed(1)}%)
                        </div>
                        <div className="text-[11px] text-neutral-600">
                            Runner up: {s.runnerUp.label} (
                            {(s.runnerUp.value * 100).toFixed(1)}%)
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="w-full rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-4 shadow-[0_10px_40px_-32px_rgba(0,0,0,0.45)]">
                <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={280}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        barCategoryGap={24}
                        barGap={6}
                        barSize={30}
                        margin={{ top: 8, right: 24, left: 120, bottom: 8 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            type="number"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                            domain={[0, 1]}
                        />
                        <YAxis
                            type="category"
                            dataKey="label"
                            tick={{ fontSize: 12 }}
                            width={110}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        <Bar dataKey="Gas" stackId="a" fill={COLORS.Gas}>
                            <LabelList dataKey="Gas" content={labelInsideBar} />
                        </Bar>
                        <Bar
                            dataKey="Renewables"
                            stackId="a"
                            fill={COLORS.Renewables}
                        >
                            <LabelList dataKey="Renewables" content={labelInsideBar} />
                        </Bar>
                        <Bar dataKey="Imports" stackId="a" fill={COLORS.Imports}>
                            <LabelList dataKey="Imports" content={labelInsideBar} />
                        </Bar>
                        <Bar dataKey="Demand" stackId="a" fill={COLORS.Demand}>
                            <LabelList dataKey="Demand" content={labelInsideBar} />
                        </Bar>
                        <Bar dataKey="Own" stackId="a" fill={COLORS.Own}>
                            <LabelList dataKey="Own" content={labelInsideBar} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Horizontal legend */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] text-neutral-700">
                {([
                    ["Gas", COLORS.Gas],
                    ["Renewables", COLORS.Renewables],
                    ["Imports", COLORS.Imports],
                    ["Demand", COLORS.Demand],
                    ["Other / own price", COLORS.Own],
                ] as const).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-2">
                        <span
                            style={{
                                backgroundColor: color,
                                width: 10,
                                height: 10,
                                borderRadius: 2,
                                display: "inline-block",
                            }}
                        />
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            {/* Comparative table */}
            <div className="text-[11px] text-neutral-600">
                Bars and numbers show how much each driver contributes to price ups and
                downs over a two-year horizon. The two rows use slightly different
                technical modelling choices; they tell the same big-picture story.
            </div>

            <table className="mt-2 w-full border-collapse text-xs">
                <thead>
                    <tr>
                        <th className="border border-neutral-300 px-2 py-1 text-left">
                            Driver
                        </th>
                        {hasDemand && (
                            <th className="border border-neutral-300 px-2 py-1 text-right">
                                Demand first
                            </th>
                        )}
                        {hasRen && (
                            <th className="border border-neutral-300 px-2 py-1 text-right">
                                Renewables first
                            </th>
                        )}
                        {hasDemand && hasRen && (
                            <th className="border border-neutral-300 px-2 py-1 text-right">
                                Δ (pp)
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {(() => {
                        const labels: Array<[string, FEVDStackKey]> = [
                            ["Gas", "Gas"],
                            ["Renewables", "Renewables"],
                            ["Imports", "Imports"],
                            ["Demand", "Demand"],
                            ["Other / own price", "Own"],
                        ];

                        const isMax = (val: number | null, other: number | null) =>
                            val !== null && (other === null || val >= other);

                        return labels.map(([label, key]) => {
                            const d = hasDemand ? demandFirst![key] : null;
                            const r = hasRen ? renFirst![key] : null;

                            return (
                                <tr key={label}>
                                    <td className="border border-neutral-300 px-2 py-1">
                                        {label}
                                    </td>
                                    {hasDemand && (
                                        <td
                                            className={`border border-neutral-300 px-2 py-1 text-right ${isMax(d, r) ? "font-semibold" : ""
                                                }`}
                                        >
                                            {d !== null ? `${(d * 100).toFixed(1)}%` : "—"}
                                        </td>
                                    )}
                                    {hasRen && (
                                        <td
                                            className={`border border-neutral-300 px-2 py-1 text-right ${isMax(r, d) ? "font-semibold" : ""
                                                }`}
                                        >
                                            {r !== null ? `${(r * 100).toFixed(1)}%` : "—"}
                                        </td>
                                    )}
                                    {hasDemand && hasRen && (
                                        <td className="border border-neutral-300 px-2 py-1 text-right">
                                            {d !== null && r !== null
                                                ? `${((r - d) * 100).toFixed(1)} pp`
                                                : "—"}
                                        </td>
                                    )}
                                </tr>
                            );
                        });
                    })()}
                </tbody>
            </table>
        </div>
    );
}
