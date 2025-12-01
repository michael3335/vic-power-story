"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    ReferenceLine,
    ReferenceDot,
    ReferenceArea,
} from "recharts";
import type { LabelProps } from "recharts";
import type { CategoricalChartFunc } from "recharts/types/chart/types";
import type { FEVDTrendPoint } from "@/types/results";
import { ACTIVE_SECTION_EVENT } from "./RevealSection";
import { useDetailMode } from "./DetailModeContext";

type Props = {
    data: FEVDTrendPoint[];
    sectionId?: string;
};

type DriverKey = "Gas" | "Renewables" | "Imports" | "Demand" | "Own";
type PhaseId = "pre" | "crisis" | "post";

const DRIVER_META: Record<DriverKey, { label: string; color: string }> = {
    Gas: { label: "Gas", color: "#d97706" },
    Renewables: { label: "Renewables", color: "#16a34a" },
    Imports: { label: "Imports", color: "#2563eb" },
    Demand: { label: "Demand", color: "#7c3aed" },
    Own: { label: "Other / own price", color: "#6b7280" },
};

const PHASE_LABELS: Record<PhaseId, string> = {
    pre: "Pre-crisis",
    crisis: "Crisis",
    post: "Post-crisis",
};

const DRIVER_ORDER: DriverKey[] = [
    "Own",
    "Renewables",
    "Demand",
    "Imports",
    "Gas",
];

// Boundaries (monthly strings)
const CRISIS_BOUNDARY_1 = "2022-01"; // start of crisis
const CRISIS_BOUNDARY_2 = "2023-02"; // end of crisis (inclusive)

// vertical dashed lines at the boundaries
const STATIC_LINES = [CRISIS_BOUNDARY_1, CRISIS_BOUNDARY_2];

const MONTH_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
] as const;

const PANEL_HEIGHT = 140;

type HoverState = { period: string; point: FEVDTrendPoint } | null;

interface FEVDTrendTooltipProps {
    active?: boolean;
    hover: HoverState;
}

const CustomTooltip: React.FC<FEVDTrendTooltipProps> = ({ active, hover }) => {
    if (!active || !hover) return null;

    const { period, point } = hover;
    const rows = DRIVER_ORDER.map((key) => {
        const raw = point[key];
        if (typeof raw !== "number" || Number.isNaN(raw)) return null;
        const meta = DRIVER_META[key];
        return {
            key,
            label: meta.label,
            color: meta.color,
            value: raw * 100,
        };
    })
        .filter(
            (row): row is { key: DriverKey; label: string; color: string; value: number } =>
                !!row
        )
        .sort((a, b) => b.value - a.value);

    if (!rows.length) return null;

    const formattedLabel = formatPeriodLabel(period);

    return (
        <div className="rounded-md border border-neutral-300 bg-white/90 px-3 py-2 text-xs text-black shadow-sm">
            <div className="mb-1 font-semibold">{formattedLabel}</div>
            <div className="space-y-1">
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="flex items-center justify-between gap-4"
                    >
                        <span className="flex items-center gap-2">
                            <span
                                style={{
                                    backgroundColor: row.color,
                                    width: 10,
                                    height: 10,
                                    borderRadius: 2,
                                    display: "inline-block",
                                }}
                            />
                            {row.label}
                        </span>
                        <span>{row.value.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const formatPeriodLabel = (period: string | null) => {
    if (!period) return "";
    const [year, month] = period.split("-");
    const mIndex = Number(month) - 1;
    const monthLabel = MONTH_SHORT[mIndex] ?? month;
    return `${monthLabel} ${year}`;
};

interface PhaseSegment {
    id: PhaseId;
    label: string;
    startPeriod: string;
    endPeriod: string;
    labelPeriod: string;
    fill: string;
}

export default function FEVDTrendStrip({ data, sectionId }: Props) {
    const { mode } = useDetailMode(); // "compact" | "detailed"
    const isCompact = mode === "compact";

    // y-axis: 0–50% in compact, 0–100% in detailed
    const yDomain: [number, number] = isCompact ? [0, 0.5] : [0, 1];

    const [hover, setHover] = React.useState<HoverState>(null);
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

    if (!data || data.length === 0) {
        return (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                Add `public/data/fevd_trend.json` with monthly FEVD shares to see the
                trend over time.
            </div>
        );
    }

    const drivers: DriverKey[] = DRIVER_ORDER;
    const firstIdx = 0;
    const lastIdx = data.length - 1;
    const lastPeriod = data[lastIdx].period;

    // indices for crisis start (>= B1), crisis end (<= B2), and post start (> B2)
    const crisisStartIdx = data.findIndex((d) => d.period >= CRISIS_BOUNDARY_1);
    let crisisEndIdx = -1;
    data.forEach((d, i) => {
        if (d.period <= CRISIS_BOUNDARY_2) crisisEndIdx = i;
    });
    const postStartIdx = data.findIndex((d) => d.period > CRISIS_BOUNDARY_2);

    const segments: PhaseSegment[] = [];

    // Pre-crisis: periods strictly before 2022-01
    const preEndIdx =
        crisisStartIdx > 0 ? crisisStartIdx - 1 : crisisStartIdx === 0 ? -1 : lastIdx;
    if (preEndIdx >= firstIdx) {
        const midIdx = Math.floor((firstIdx + preEndIdx) / 2);
        segments.push({
            id: "pre",
            label: PHASE_LABELS.pre,
            startPeriod: data[firstIdx].period,
            endPeriod: data[preEndIdx].period,
            labelPeriod: data[midIdx].period,
            fill: "#f3f4f6", // light grey
        });
    }

    // Crisis: 2022-01 <= period <= 2023-02
    if (crisisStartIdx !== -1 && crisisEndIdx >= crisisStartIdx) {
        const midIdx = Math.floor((crisisStartIdx + crisisEndIdx) / 2);
        segments.push({
            id: "crisis",
            label: PHASE_LABELS.crisis,
            startPeriod: data[crisisStartIdx].period,
            endPeriod: data[crisisEndIdx].period,
            labelPeriod: data[midIdx].period,
            fill: "#fecaca", // darker red
        });
    }

    // Post-crisis: period > 2023-02
    if (postStartIdx !== -1 && lastIdx >= postStartIdx) {
        const midIdx = Math.floor((postStartIdx + lastIdx) / 2);
        segments.push({
            id: "post",
            label: PHASE_LABELS.post,
            startPeriod: data[postStartIdx].period,
            endPeriod: lastPeriod,
            labelPeriod: data[midIdx].period,
            fill: "#f3f4f6", // light grey
        });
    }

    const years = Array.from(new Set(data.map((d) => d.period.slice(0, 4))));
    const yearTicks = years.map((year) => {
        const first = data.find((d) => d.period.startsWith(year));
        return first ? first.period : `${year}-01`;
    });

    const stats = drivers.reduce(
        (acc, driver) => {
            const values = data
                .map((d) => d[driver] as number)
                .filter((v) => typeof v === "number");
            const min = values.length ? Math.min(...values) : 0;
            const max = values.length ? Math.max(...values) : 0;
            acc[driver] = { min, max };
            return acc;
        },
        {} as Record<DriverKey, { min: number; max: number }>
    );

    const latest = data[data.length - 1];
    const hoverPeriod = hover?.period ?? null;
    const hoverPoint = hover?.point ?? null;

    const handleMouseMove: CategoricalChartFunc = (state) => {
        const label = state?.activeLabel;
        if (label === undefined || label === null) return;

        const payloadPoint = state?.activePayload?.[0]?.payload as
            | FEVDTrendPoint
            | undefined;
        const labelStr = String(label);
        const point =
            payloadPoint ??
            data.find((d) => d.period === labelStr) ??
            null;

        if (!point) return;

        setHover((prev) =>
            prev?.period === labelStr ? prev : { period: labelStr, point }
        );
    };

    const handleMouseLeave = () => {
        setHover(null);
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-3 lg:p-4 shadow-[0_10px_40px_-32px_rgba(0,0,0,0.45)]">
            {/* Small multiples: one panel per driver */}
            <div className="mt-2 flex justify-center">
                <div className="grid max-w-[960px] gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                    {drivers.map((driver) => {
                        const meta = DRIVER_META[driver];
                        const { min, max } = stats[driver];
                        const hoverShare =
                            hoverPoint && typeof hoverPoint[driver] === "number"
                                ? (hoverPoint[driver] as number)
                                : null;
                        const latestShare =
                            latest && typeof latest[driver] === "number"
                                ? (latest[driver] as number)
                                : null;

                        // hide Own / Demand / Imports in compact mode
                        const detailedOnly =
                            driver === "Own" || driver === "Demand" || driver === "Imports";

                        const renderLabel = (props: LabelProps) => {
                            if (!hoverPeriod || hoverShare == null) {
                                return null;
                            }

                            let cx: number | null = null;
                            let cy: number | null = null;

                            if (typeof props.x === "number") {
                                cx = props.x;
                            } else if (typeof props.x === "string") {
                                const n = Number(props.x);
                                if (!Number.isNaN(n)) cx = n;
                            }

                            if (typeof props.y === "number") {
                                cy = props.y;
                            } else if (typeof props.y === "string") {
                                const n = Number(props.y);
                                if (!Number.isNaN(n)) cy = n;
                            }

                            if (cx == null || cy == null) return null;

                            const periodText = formatPeriodLabel(hoverPeriod);
                            // *** changed here: only show percentage, no series name ***
                            const valueText = `${(hoverShare * 100).toFixed(1)}%`;

                            const paddingX = 6;
                            const textLen = Math.max(periodText.length, valueText.length);
                            const boxWidth = Math.max(70, textLen * 5.2);
                            const boxHeight = 32;

                            const x = cx + 8;
                            let y = cy - boxHeight - 6;
                            if (y < 8) {
                                y = cy + 10;
                            }

                            return (
                                <g>
                                    {/* translucent halo behind the point */}
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={8}
                                        fill={meta.color}
                                        fillOpacity={0.14}
                                        stroke="none"
                                    />
                                    {/* main point circle */}
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={4}
                                        fill="#ffffff"
                                        stroke={meta.color}
                                        strokeWidth={1.5}
                                    />
                                    {/* label box */}
                                    <rect
                                        x={x}
                                        y={y}
                                        width={boxWidth}
                                        height={boxHeight}
                                        rx={4}
                                        ry={4}
                                        fill="rgba(255,255,255,0.9)"
                                        stroke={meta.color}
                                        strokeWidth={0.8}
                                    />
                                    {/* period */}
                                    <text
                                        x={x + paddingX}
                                        y={y + 11}
                                        fontSize={11}
                                        fontWeight={600}
                                        fill="#111827"
                                    >
                                        {periodText}
                                    </text>
                                    {/* percentage only */}
                                    <text
                                        x={x + paddingX}
                                        y={y + 23}
                                        fontSize={10}
                                        fill="#111827"
                                    >
                                        {valueText}
                                    </text>
                                </g>
                            );
                        };

                        return (
                            <div
                                key={driver}
                                className={`flex flex-col rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-[11px] text-neutral-800 shadow-sm ${detailedOnly ? "detail-detailed" : ""
                                    }`}
                            >
                                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                                    <div className="flex items-baseline gap-2">
                                        <span
                                            style={{
                                                backgroundColor: meta.color,
                                                width: 10,
                                                height: 10,
                                                borderRadius: 2,
                                                display: "inline-block",
                                                marginRight: 6,
                                            }}
                                        />
                                        <span className="font-semibold text-neutral-900">
                                            {meta.label}
                                        </span>
                                        {latestShare !== null && (
                                            <span className="whitespace-nowrap text-[10px] text-neutral-500">
                                                Range: {(min * 100).toFixed(1)}–
                                                {(max * 100).toFixed(1)}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={PANEL_HEIGHT}
                                        minWidth={0}
                                    >
                                        <AreaChart
                                            key={`${animateKey}-${driver}`}
                                            data={data}
                                            margin={{
                                                top: 18, // room for phase labels
                                                right: 4,
                                                left: 0,
                                                bottom: 14,
                                            }}
                                            onMouseMove={handleMouseMove}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            {/* shaded segments: pre (grey), crisis (red), post (grey) */}
                                            {segments.map((seg) => (
                                                <ReferenceArea
                                                    key={seg.id}
                                                    x1={seg.startPeriod}
                                                    x2={seg.endPeriod}
                                                    strokeOpacity={0}
                                                    fill={seg.fill}
                                                    fillOpacity={seg.id === "crisis" ? 0.45 : 0.18}
                                                />
                                            ))}

                                            {/* static dashed reference lines at the boundaries */}
                                            {STATIC_LINES.map((date) => (
                                                <ReferenceLine
                                                    key={date}
                                                    x={date}
                                                    stroke="#d1d5db"
                                                    strokeDasharray="4 4"
                                                    strokeWidth={1}
                                                />
                                            ))}

                                            {/* phase labels at midpoints */}
                                            {segments.map((seg) => (
                                                <ReferenceLine
                                                    key={`label-${seg.id}`}
                                                    x={seg.labelPeriod}
                                                    stroke="none"
                                                    label={{
                                                        value: seg.label,
                                                        position: "top",
                                                        offset: 0,
                                                        fontSize: 10,
                                                        fill: "#6b7280",
                                                    }}
                                                />
                                            ))}

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e5e7eb"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="period"
                                                ticks={yearTicks}
                                                tick={{
                                                    fontSize: 8,
                                                    fill: "#9ca3af",
                                                }}
                                                tickFormatter={(v) => String(v).slice(0, 4)}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 9, fill: "#6b7280" }}
                                                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                                                domain={yDomain}
                                                width={32}
                                            />
                                            <Tooltip content={<CustomTooltip hover={hover} />} />
                                            {/* dynamic hover line */}
                                            {hoverPeriod && (
                                                <ReferenceLine
                                                    x={hoverPeriod}
                                                    stroke="#9ca3af"
                                                    strokeDasharray="3 3"
                                                    strokeWidth={1}
                                                />
                                            )}
                                            <Area
                                                type="monotone"
                                                dataKey={driver}
                                                stroke={meta.color}
                                                strokeWidth={2}
                                                fill={meta.color}
                                                fillOpacity={0.16}
                                                dot={false}
                                                activeDot={{
                                                    r: 3,
                                                    stroke: meta.color,
                                                    fill: "#ffffff",
                                                    strokeWidth: 1.5,
                                                }}
                                                isAnimationActive={animate}
                                            />
                                            {hoverPeriod &&
                                                hoverPoint &&
                                                hoverShare !== null && (
                                                    <ReferenceDot
                                                        x={hoverPeriod}
                                                        y={hoverShare}
                                                        r={3.5}
                                                        fill="#ffffff"
                                                        stroke={meta.color}
                                                        strokeWidth={1.5}
                                                        label={renderLabel}
                                                    />
                                                )}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
