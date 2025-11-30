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
import type { CategoricalChartFunc } from "recharts/types/chart/types";
import type { FEVDTrendPoint } from "@/types/results";
import { ACTIVE_SECTION_EVENT } from "./RevealSection";

type Props = {
    data: FEVDTrendPoint[];
    sectionId?: string;
};

type DriverKey = "Gas" | "Renewables" | "Imports" | "Demand" | "Own";

const PHASES: Array<{ id: string; start: string; end?: string }> = [
    { id: "p1", start: "2015-01", end: "2019-12" },
    { id: "p2", start: "2020-01", end: "2022-12" },
    { id: "p3", start: "2023-01" },
];

const DRIVER_META: Record<DriverKey, { label: string; color: string }> = {
    Gas: { label: "Gas", color: "#d97706" },
    Renewables: { label: "Renewables", color: "#16a34a" },
    Imports: { label: "Imports", color: "#2563eb" },
    Demand: { label: "Demand", color: "#7c3aed" },
    Own: { label: "Other / own price", color: "#6b7280" },
};

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

interface FEVDTrendTooltipProps {
    active?: boolean;
    payload?: { value?: number; dataKey?: string }[];
    label?: string | number;
}

const CustomTooltip: React.FC<FEVDTrendTooltipProps> = ({
    active,
    payload,
    label,
}) => {
    if (!active || !payload || !payload.length) return null;

    const rows = payload
        .filter(
            (entry): entry is { value: number; dataKey: string } =>
                !!entry &&
                typeof entry.dataKey === "string" &&
                entry.dataKey in DRIVER_META
        )
        .map((entry) => {
            const key = entry.dataKey as DriverKey;
            const meta = DRIVER_META[key];
            const value = (entry.value ?? 0) * 100;
            return {
                key,
                label: meta.label,
                color: meta.color,
                value,
            };
        })
        .sort((a, b) => b.value - a.value);

    if (!rows.length) return null;

    const formattedLabel = (() => {
        if (label == null) return "";
        const [year, month] = String(label).split("-");
        const mIndex = Number(month) - 1;
        const monthLabel = MONTH_SHORT[mIndex] ?? month;
        return `${monthLabel} ${year}`;
    })();

    return (
        <div className="rounded-md border border-neutral-300 bg-white/95 px-3 py-2 text-xs text-black shadow-sm">
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

export default function FEVDTrendStrip({ data, sectionId }: Props) {
    const [activePeriod, setActivePeriod] = React.useState<string | null>(null);
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

    const drivers: DriverKey[] = ["Own", "Renewables", "Demand", "Imports", "Gas"];
    const yDomain: [number, number] = [0, 1];
    const PANEL_HEIGHT = 140;
    const lastPeriod = data[data.length - 1]?.period ?? null;

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
    const activePoint =
        activePeriod !== null
            ? data.find((d) => d.period === activePeriod) ?? null
            : null;

    const formatPeriodLabel = (period: string | null) => {
        if (!period) return "";
        const [year, month] = period.split("-");
        const mIndex = Number(month) - 1;
        const monthLabel = MONTH_SHORT[mIndex] ?? month;
        return `${monthLabel} ${year}`;
    };

    const handleMouseMove: CategoricalChartFunc = (nextState) => {
        const label = nextState?.activeLabel;
        if (label === undefined || label === null) {
            return;
        }
        setActivePeriod(String(label));
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-3 lg:p-4 shadow-[0_10px_40px_-32px_rgba(0,0,0,0.45)]">
            {/* Small multiples: one panel per driver, all on 0–100% scale */}
            <div className="mt-2 flex justify-center">
                <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-[960px]">
                    {drivers.map((driver) => {
                        const meta = DRIVER_META[driver];
                        const { min, max } = stats[driver];
                        const currentPoint = activePoint ?? latest;
                        const currentShare =
                            currentPoint && typeof currentPoint[driver] === "number"
                                ? (currentPoint[driver] as number)
                                : null;
                        const latestShare =
                            latest && typeof latest[driver] === "number"
                                ? (latest[driver] as number)
                                : null;

                        return (
                            <div
                                key={driver}
                                className="flex flex-col rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-[11px] text-neutral-800 shadow-sm"
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
                                            <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                                                Range: {(min * 100).toFixed(1)}–
                                                {(max * 100).toFixed(1)}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full">
                                    {/* 50% width and centered */}
                                    <div className="mx-auto w-1/2">
                                        <ResponsiveContainer
                                            width="100%"   // fill the 50%-width wrapper
                                            height={PANEL_HEIGHT}
                                            minWidth={0}
                                        >
                                            <AreaChart
                                                key={`${animateKey}-${driver}`}
                                                data={data}
                                                margin={{
                                                    top: 4,
                                                    right: 4,
                                                    left: 0,
                                                    bottom: 14,
                                                }}
                                                onMouseMove={handleMouseMove}
                                                onMouseLeave={() => setActivePeriod(null)}
                                            >
                                                {PHASES.map((phase) => (
                                                    <ReferenceArea
                                                        key={phase.id}
                                                        x1={phase.start}
                                                        x2={phase.end ?? lastPeriod ?? phase.start}
                                                        strokeOpacity={0}
                                                        fill="#e5e7eb"
                                                        fillOpacity={0.25}
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
                                                    tick={{ fontSize: 8, fill: "#9ca3af" }}
                                                    tickFormatter={(v) => String(v).slice(0, 4)}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 9, fill: "#6b7280" }}
                                                    tickFormatter={(v) =>
                                                        `${(v * 100).toFixed(0)}%`
                                                    }
                                                    domain={yDomain}
                                                    width={32}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                {activePeriod && (
                                                    <ReferenceLine
                                                        x={activePeriod}
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
                                                {activePeriod &&
                                                    activePoint &&
                                                    currentShare !== null && (
                                                        <ReferenceDot
                                                            x={activePeriod}
                                                            y={currentShare}
                                                            r={3.5}
                                                            fill="#ffffff"
                                                            stroke={meta.color}
                                                            strokeWidth={1.5}
                                                        />
                                                    )}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
