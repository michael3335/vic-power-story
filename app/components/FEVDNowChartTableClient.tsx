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
    Rectangle,
} from "recharts";
import type { RectangleProps } from "recharts";
import type {
    LabelContentType,
    Props as LabelProps,
} from "recharts/types/component/Label";
import type { FEVDFullRow } from "@/types/results";

type Props = {
    demandFirst: FEVDFullRow | null;
    renFirst: FEVDFullRow | null;
    sectionId?: string; // kept for API symmetry, not used now
};

type FEVDStackKey = Exclude<keyof FEVDFullRow, "horizon">;

const COLORS = {
    Gas: "#d97706", // amber-600
    Renewables: "#16a34a", // green-600
    Imports: "#2563eb", // blue-600
    Demand: "#7c3aed", // violet-600
    Own: "#6b7280", // gray-500
} as const;

const colorFor = (key: FEVDStackKey) => COLORS[key];

interface FEVDTooltipProps {
    active?: boolean;
    payload?: Array<{
        dataKey?: string | number;
        value?: number;
    }>;
    hoveredKey: FEVDStackKey | null;
}

/** Tooltip: only show the hovered segment (no graph/row name) */
const CustomTooltip: React.FC<FEVDTooltipProps> = ({
    active,
    payload,
    hoveredKey,
}) => {
    if (!active || !payload || !payload.length || !hoveredKey) return null;

    // Find the payload entry that matches the hovered stack key
    const entry = payload.find((p) => p.dataKey === hoveredKey) ?? payload[0];
    if (!entry) return null;

    const key = entry.dataKey as FEVDStackKey;
    const value = entry.value as number;
    if (typeof value !== "number" || !Number.isFinite(value)) return null;

    const segLabel = key === "Own" ? "Other / own price" : key;
    const color = colorFor(key);

    return (
        <div className="rounded-md border border-neutral-300 bg-white/95 px-3 py-2 text-xs text-black shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                    <span
                        style={{
                            backgroundColor: color,
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            display: "inline-block",
                        }}
                    />
                    {segLabel}
                </span>
                <span>{(value * 100).toFixed(1)}%</span>
            </div>
        </div>
    );
};

export default function FEVDNowChartTableClient({
    demandFirst,
    renFirst,
}: Props) {
    const [hoveredKey, setHoveredKey] = React.useState<FEVDStackKey | null>(null);

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

    /** Row label above each bar, fully left (based on Gas segment's x) */
    const labelAboveBar: LabelContentType = (props: LabelProps) => {
        const { x, y, index } = props;
        const row = chartData[index];
        if (!row) return null;

        const cx = toNumber(x) + 4; // slight padding from left edge of first segment
        const cy = toNumber(y) - 6;

        return (
            <text
                x={cx}
                y={cy}
                textAnchor="start"
                fill="#111827"
                fontSize={12}
                fontWeight={500}
            >
                {row.label}
            </text>
        );
    };

    const BarShape: React.FC<RectangleProps> = (props) => (
        <Rectangle
            {...props}
            fill={props.fill}
            fillOpacity={1}
            stroke="none"
            style={{ cursor: "pointer" }}
        />
    );

    return (
        <div className="space-y-4">
            {/* Chart */}
            <div className="w-full">
                <div className="w-full rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-4 shadow-[0_10px_40px_-32px_rgba(0,0,0,0.45)]">
                    <ResponsiveContainer width="100%" height={230} minWidth={320}>
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            barCategoryGap={24}
                            barGap={6}
                            barSize={32}
                            margin={{ top: 28, right: 32, left: 16, bottom: 8 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                                domain={[0, 1]}
                            />
                            {/* hide Y-axis labels so bars can be full width */}
                            <YAxis type="category" dataKey="label" hide />
                            <Tooltip content={<CustomTooltip hoveredKey={hoveredKey} />} />

                            <Bar
                                dataKey="Gas"
                                stackId="a"
                                fill={COLORS.Gas}
                                isAnimationActive={false}
                                shape={BarShape}
                                activeBar={BarShape}
                                onMouseOver={() => setHoveredKey("Gas")}
                                onMouseLeave={() => setHoveredKey(null)}
                            >
                                {/* Row label above the whole bar, left-aligned */}
                                <LabelList dataKey="Gas" content={labelAboveBar} />
                                <LabelList dataKey="Gas" content={labelInsideBar} />
                            </Bar>
                            <Bar
                                dataKey="Renewables"
                                stackId="a"
                                fill={COLORS.Renewables}
                                isAnimationActive={false}
                                shape={BarShape}
                                activeBar={BarShape}
                                onMouseOver={() => setHoveredKey("Renewables")}
                                onMouseLeave={() => setHoveredKey(null)}
                            >
                                <LabelList dataKey="Renewables" content={labelInsideBar} />
                            </Bar>
                            <Bar
                                dataKey="Imports"
                                stackId="a"
                                fill={COLORS.Imports}
                                isAnimationActive={false}
                                shape={BarShape}
                                activeBar={BarShape}
                                onMouseOver={() => setHoveredKey("Imports")}
                                onMouseLeave={() => setHoveredKey(null)}
                            >
                                <LabelList dataKey="Imports" content={labelInsideBar} />
                            </Bar>
                            <Bar
                                dataKey="Demand"
                                stackId="a"
                                fill={COLORS.Demand}
                                isAnimationActive={false}
                                shape={BarShape}
                                activeBar={BarShape}
                                onMouseOver={() => setHoveredKey("Demand")}
                                onMouseLeave={() => setHoveredKey(null)}
                            >
                                <LabelList dataKey="Demand" content={labelInsideBar} />
                            </Bar>
                            <Bar
                                dataKey="Own"
                                stackId="a"
                                fill={COLORS.Own}
                                isAnimationActive={false}
                                shape={BarShape}
                                activeBar={BarShape}
                                onMouseOver={() => setHoveredKey("Own")}
                                onMouseLeave={() => setHoveredKey(null)}
                            >
                                <LabelList dataKey="Own" content={labelInsideBar} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Horizontal legend: spread along x-axis, centered */}
            <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-2 text-[11px] text-neutral-700">
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

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-neutral-50">
                            <th className="border border-neutral-200 px-3 py-2 text-left">
                                Driver
                            </th>
                            {hasDemand && (
                                <th className="border border-neutral-200 px-3 py-2 text-right">
                                    Demand first
                                </th>
                            )}
                            {hasRen && (
                                <th className="border border-neutral-200 px-3 py-2 text-right">
                                    Renewables first
                                </th>
                            )}
                            {hasDemand && hasRen && (
                                <th className="border border-neutral-200 px-3 py-2 text-right">
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
                                    <tr
                                        key={label}
                                        className="odd:bg-white even:bg-neutral-50/70"
                                    >
                                        <td className="border border-neutral-200 px-3 py-2">
                                            {label}
                                        </td>
                                        {hasDemand && (
                                            <td
                                                className={`border border-neutral-200 px-3 py-2 text-right ${isMax(d, r)
                                                    ? "font-semibold text-neutral-900"
                                                    : "text-neutral-700"
                                                    }`}
                                            >
                                                {d !== null ? `${(d * 100).toFixed(1)}%` : "—"}
                                            </td>
                                        )}
                                        {hasRen && (
                                            <td
                                                className={`border border-neutral-200 px-3 py-2 text-right ${isMax(r, d)
                                                    ? "font-semibold text-neutral-900"
                                                    : "text-neutral-700"
                                                    }`}
                                            >
                                                {r !== null ? `${(r * 100).toFixed(1)}%` : "—"}
                                            </td>
                                        )}
                                        {hasDemand && hasRen && (
                                            <td className="border border-neutral-200 px-3 py-2 text-right text-neutral-700">
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
        </div>
    );
}
