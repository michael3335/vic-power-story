"use client";

import React from "react";
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ReferenceLine,
    ReferenceArea,
    ResponsiveContainer,
} from "recharts";
import type { RollingBetaPoint } from "@/types/results";
import { ACTIVE_SECTION_EVENT } from "./RevealSection";

type Props = {
    data: RollingBetaPoint[];
    sectionId?: string;
};

type RollingTooltipProps = {
    active?: boolean;
    label?: string | number;
    payload?: {
        payload: RollingBetaPoint;
    }[];
};

const CustomTooltip: React.FC<RollingTooltipProps> = ({
    active,
    payload,
    label,
}) => {
    if (!active || !payload || !payload.length) return null;

    const p = payload[0].payload;
    const [year, month] = String(label ?? "").split("-");
    const parsedDate = new Date(Number(year), Number(month) - 1, 1);
    const formattedDate = Number.isNaN(parsedDate.getTime())
        ? label
        : new Intl.DateTimeFormat("en-AU", {
            month: "short",
            year: "numeric",
        }).format(parsedDate);

    return (
        <div className="rounded-md border border-neutral-300 bg-white/95 px-3 py-2 text-xs text-black shadow-sm">
            <div className="mb-1 font-semibold">{formattedDate}</div>
            <div>
                Gas → price pass-through:{" "}
                <span className="font-semibold">
                    {(p.beta * 100).toFixed(1)}%
                </span>
            </div>
            <div className="mt-1">
                95% band: {(p.lower * 100).toFixed(1)}% to{" "}
                {(p.upper * 100).toFixed(1)}%
            </div>
        </div>
    );
};

export default function RollingBetaChartClient({ data, sectionId }: Props) {
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
    if (!data || !data.length) {
        return (
            <p className="text-sm text-neutral-600">No rolling beta data found.</p>
        );
    }

    // Responsive width; fixed height works well for this layout
    const CHART_HEIGHT = 260;
    const lastDate = data[data.length - 1]?.date;

    // Build a band series from lower/upper so we can shade between them
    const chartData = data.map((d) => ({
        ...d,
        band: Math.max(0, d.upper - d.lower),
    }));

    // X-axis: show one tick per year with the year label only
    const monthFormatter = (value: string | number) => {
        const [y] = String(value).split("-");
        return y;
    };

    // Tick positions: first available month in each year
    const yearTicks = (() => {
        const years = Array.from(new Set(data.map((d) => d.date.slice(0, 4))));
        return years.map((year) => {
            const first = data.find((d) => d.date.startsWith(year));
            return first ? first.date : `${year}-01`;
        });
    })();

    const phases: Array<{
        id: string;
        label: string;
        start: string;
        end?: string;
        color: string;
        windowLabel: string;
    }> = [
        {
            id: "p1",
            label: "Phase 1 · Gas-anchored",
            start: "2015-01",
            end: "2019-12",
            color: "#0ea5e9",
            windowLabel: "12-month windows",
        },
        {
            id: "p2",
            label: "Phase 2 · Crisis/transition",
            start: "2020-01",
            end: "2022-12",
            color: "#f59e0b",
            windowLabel: "36-month windows",
        },
        {
            id: "p3",
            label: "Phase 3 · Weather/RE-led",
            start: "2023-01",
            color: "#16a34a",
            windowLabel: "21-month windows",
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={300}>
            <ComposedChart
                key={animateKey}
                data={chartData}
                margin={{ top: 12, right: 18, left: 8, bottom: 12 }}
            >
                <defs>
                    <linearGradient id="bandFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.06} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                {/* Light shading to show the broad phases / breaks */}
                {phases.map((phase) => (
                    <ReferenceArea
                        key={phase.id}
                        x1={phase.start}
                        x2={phase.end ?? lastDate}
                        stroke={phase.color}
                        strokeOpacity={0.9}
                        strokeWidth={1.2}
                        fill={phase.color}
                        fillOpacity={0.35}
                        label={{
                            value: phase.label,
                            position: "insideTop",
                            fill: "#0f172a",
                            fontSize: 11,
                        }}
                    />
                ))}
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#4b5563" }}
                    tickMargin={10}
                    tickFormatter={monthFormatter}
                    ticks={yearTicks}
                    padding={{ left: 8, right: 8 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={{ stroke: "#e5e7eb" }}
                    label={{
                        value: "Year",
                        position: "insideBottom",
                        offset: -4,
                        style: { fontSize: 10, fill: "#374151" },
                    }}
                />
                <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: "#4b5563" }}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    label={{
                        value: "Pass-through (%)",
                        angle: -90,
                        position: "insideLeft",
                        offset: 12,
                        style: { fontSize: 10, fill: "#374151" },
                    }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={{ stroke: "#e5e7eb" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
                {/* Zero baseline to show when pass-through ~ 0 */}
                <ReferenceLine
                    yAxisId="left"
                    y={0}
                    stroke="#9ca3af"
                    strokeDasharray="4 4"
                    strokeOpacity={0.9}
                />
                {/* Uncertainty band (shade between lower and upper) */}
                <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="lower"
                    stackId="band"
                    stroke="none"
                    fill="transparent"
                    isAnimationActive={animate}
                />
                <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="band"
                    stackId="band"
                    stroke="none"
                    fill="url(#bandFill)"
                    isAnimationActive={animate}
                />
                {/* Phase boundaries (on top of band but under markers) */}
                <ReferenceLine
                    x="2020-01"
                    stroke="#9ca3af"
                    strokeDasharray="2 2"
                    strokeOpacity={0.9}
                />
                <ReferenceLine
                    x="2023-01"
                    stroke="#9ca3af"
                    strokeDasharray="2 2"
                    strokeOpacity={0.9}
                />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="beta"
                    stroke="#111827"
                    strokeWidth={2.2}
                    isAnimationActive={animate}
                    activeDot={(props) => {
                        const { cx, cy, payload } = props;
                        const point = payload as RollingBetaPoint;
                        const significant = point.lower > 0 || point.upper < 0;
                        const belowZero = point.beta < 0;
                        const color = belowZero ? "#b91c1c" : "#111827";
                        return (
                            <g>
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={significant ? 4.5 : 4}
                                    fill={significant ? color : "#ffffff"}
                                    stroke={color}
                                    strokeWidth={1.2}
                                />
                            </g>
                        );
                    }}
                    dot={(props) => {
                        const { cx, cy, payload } = props;
                        const point = payload as RollingBetaPoint;
                        const significant = point.lower > 0 || point.upper < 0;
                        const belowZero = point.beta < 0;
                        const color = belowZero ? "#b91c1c" : "#111827";
                        return (
                            <circle
                                cx={cx}
                                cy={cy}
                                r={significant ? 3.8 : 3.4}
                                fill={significant ? color : "#ffffff"}
                                stroke={color}
                                strokeWidth={1}
                            />
                        );
                    }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
