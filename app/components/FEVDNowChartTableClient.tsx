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
import { ACTIVE_SECTION_EVENT } from "./RevealSection";

type Props = {
    demandFirst: FEVDFullRow | null;
    renFirst: FEVDFullRow | null;
    sectionId?: string;
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
    sectionId,
}: Props) {
    const [animate, setAnimate] = React.useState(false);
    const [animateKey, setAnimateKey] = React.useState(0);

    React.useEffect(() => {
        if (!sectionId) return;
        const handleActivate = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;
            if (detail === sectionId) {
                setAnimate(true);
                setAnimateKey((prev) => prev + 1);
            }
        };
        window.addEventListener(
            ACTIVE_SECTION_EVENT,
            handleActivate as EventListener
        );
        return () => {
            window.removeEventListener(
                ACTIVE_SECTION_EVENT,
                handleActivate as EventListener
            );
        };
    }, [sectionId]);
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

    return (
        <div className="space-y-4">
            {/* Chart */}
            <div className="w-full rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-4 shadow-[0_10px_40px_-32px_rgba(0,0,0,0.45)]">
                <ResponsiveContainer width="100%" height={230} minWidth={280}>
                    <BarChart
                        key={animateKey}
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

                        <Bar
                            dataKey="Gas"
                            stackId="a"
                            fill={COLORS.Gas}
                            isAnimationActive={animate}
                        >
                            <LabelList dataKey="Gas" content={labelInsideBar} />
                        </Bar>
                        <Bar
                            dataKey="Renewables"
                            stackId="a"
                            fill={COLORS.Renewables}
                            isAnimationActive={animate}
                        >
                            <LabelList dataKey="Renewables" content={labelInsideBar} />
                        </Bar>
                        <Bar
                            dataKey="Imports"
                            stackId="a"
                            fill={COLORS.Imports}
                            isAnimationActive={animate}
                        >
                            <LabelList dataKey="Imports" content={labelInsideBar} />
                        </Bar>
                        <Bar
                            dataKey="Demand"
                            stackId="a"
                            fill={COLORS.Demand}
                            isAnimationActive={animate}
                        >
                            <LabelList dataKey="Demand" content={labelInsideBar} />
                        </Bar>
                        <Bar
                            dataKey="Own"
                            stackId="a"
                            fill={COLORS.Own}
                            isAnimationActive={animate}
                        >
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
