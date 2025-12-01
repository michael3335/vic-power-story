"use client";

import React from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { ModelReadyPoint } from "@/types/results";
import { ACTIVE_SECTION_EVENT } from "./RevealSection";

type SeriesKey = "gas" | "price" | "ren_share";

type Props = {
    data: ModelReadyPoint[];
    sectionId?: string;
    includedKeys?: SeriesKey[];
};

type TooltipPayload = {
    value?: number | string;
    payload: {
        month: string;
    };
};

type TooltipProps = {
    active?: boolean;
    label?: string | number;
    payload?: TooltipPayload[];
    valueFormatter: (value: number) => string;
};

const CustomTooltip: React.FC<TooltipProps> = ({
    active,
    payload,
    label,
    valueFormatter,
}) => {
    if (!active || !payload || !payload.length) return null;
    const rawValue = payload[0]?.value;
    const value =
        typeof rawValue === "number"
            ? rawValue
            : typeof rawValue === "string"
                ? Number(rawValue)
                : NaN;
    if (!Number.isFinite(value)) return null;

    const [year, month] = String(label ?? "").split("-");
    const parsedDate = new Date(Number(year), Number(month) - 1, 1);
    const formattedDate = Number.isNaN(parsedDate.getTime())
        ? label
        : new Intl.DateTimeFormat("en-AU", {
            month: "short",
            year: "numeric",
        }).format(parsedDate);

    return (
        <div
            className="rounded-md border border-neutral-300 px-5 py-4 text-xs text-black"
            style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
        >
            <div className="font-semibold text-neutral-900">{formattedDate}</div>
            <div className="mt-1 font-semibold text-neutral-800">
                {valueFormatter(value)}
            </div>
        </div>
    );
};

type SeriesConfig = {
    key: SeriesKey;
    label: string;
    color: string;
    gradientId: string;
    yLabel: string;
    yDomain: [number, number | "auto"];
    unitLabel: string;
    valueFormatter: (value: number) => string;
};

const SERIES: SeriesConfig[] = [
    {
        key: "gas",
        label: "Gas price (AUD/GJ)",
        color: "#d97706",
        gradientId: "gasPriceFill",
        yLabel: "Gas price (AUD/GJ)",
        yDomain: [0, "auto"],
        unitLabel: "Gas price",
        valueFormatter: (v) => `$${v.toFixed(2)}`,
    },
    {
        key: "price",
        label: "Electricity price (AUD/MWh, VWA)",
        color: "#2563eb",
        gradientId: "elecPriceFill",
        yLabel: "Elec. price (AUD/MWh)",
        yDomain: [0, "auto"],
        unitLabel: "Electricity price",
        valueFormatter: (v) => `$${v.toFixed(0)}`,
    },
    {
        key: "ren_share",
        label: "Renewables share",
        color: "#16a34a",
        gradientId: "renSharePriceFill",
        yLabel: "Renewables share (%)",
        yDomain: [0, 1],
        unitLabel: "Renewables share",
        valueFormatter: (v) => `${(v * 100).toFixed(1)}%`,
    },
];

const INVASION_MARKER = {
    month: "2022-02",
    label: "24 Feb 2022: Russia invades Ukraine",
};

function formatYearTick(value: string | number) {
    const [year] = String(value).split("-");
    return year;
}

function buildYearTicks(data: { month: string }[]) {
    const years = Array.from(new Set(data.map((d) => d.month.slice(0, 4))));
    return years
        .map((year) => {
            const first = data.find((d) => d.month.startsWith(year));
            return first ? first.month : `${year}-01`;
        })
        .filter(Boolean);
}

export default function ModelReadyChartsClient({
    data,
    sectionId,
    includedKeys,
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
        window.addEventListener(ACTIVE_SECTION_EVENT, handleActivate as EventListener);
        return () => {
            window.removeEventListener(
                ACTIVE_SECTION_EVENT,
                handleActivate as EventListener
            );
        };
    }, [sectionId]);

    if (!data || !data.length) {
        return <p className="text-sm text-neutral-600">No price or renewables data found.</p>;
    }

    const chartData = data.map((d) => ({
        ...d,
        month: d.date.slice(0, 7),
    }));
    const yearTicks = buildYearTicks(chartData);
    const CHART_HEIGHT = 320;

    const activeSeries = includedKeys
        ? SERIES.filter((series) => includedKeys.includes(series.key))
        : SERIES;

    return (
        <div className="space-y-6">
            {activeSeries.map((series) => (
                <div key={series.key} className="w-full">
                    <div
                        className="mb-2 inline-block rounded-md text-sm font-semibold text-neutral-800"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.92)",
                            padding: "10px 14px",
                            boxShadow: "none",
                        }}
                    >
                        {series.label}
                    </div>
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={320}>
                        <AreaChart
                            key={`${series.key}-${animateKey}`}
                            data={chartData}
                            margin={{ top: 10, right: 18, left: 8, bottom: 14 }}
                        >
                            <defs>
                                <linearGradient
                                    id={series.gradientId}
                                    x1="0"
                                    x2="0"
                                    y1="0"
                                    y2="1"
                                >
                                    <stop offset="5%" stopColor={series.color} stopOpacity={0.28} />
                                    <stop offset="100%" stopColor={series.color} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 10, fill: "#4b5563" }}
                                tickMargin={10}
                                tickFormatter={formatYearTick}
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
                                tick={{ fontSize: 10, fill: "#4b5563" }}
                                tickFormatter={
                                    series.key === "ren_share"
                                        ? (v) => `${(v * 100).toFixed(0)}%`
                                        : (v) => v
                                }
                                domain={series.yDomain}
                                label={{
                                    value: series.yLabel,
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 12,
                                    style: { fontSize: 10, fill: "#374151" },
                                }}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={{ stroke: "#e5e7eb" }}
                            />
                            <Tooltip
                                cursor={{ fill: "#f3f4f6" }}
                                content={<CustomTooltip valueFormatter={series.valueFormatter} />}
                            />
                            {series.key !== "ren_share" ? (
                                <ReferenceLine
                                    x={INVASION_MARKER.month}
                                    stroke="#ef4444"
                                    strokeDasharray="4 4"
                                    strokeWidth={1}
                                    label={<ReferenceLabel text={INVASION_MARKER.label} />}
                                />
                            ) : null}
                            <Area
                                type="monotone"
                                dataKey={series.key}
                                stroke={series.color}
                                strokeWidth={1.5}
                                fill={`url(#${series.gradientId})`}
                                dot={false}
                                activeDot={{ r: 3, fill: series.color }}
                                isAnimationActive={animate}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ))}
        </div>
    );
}

type ReferenceLabelProps = {
    text: string;
    viewBox?: {
        x?: number;
        y?: number;
    };
};

function ReferenceLabel({ text, viewBox }: ReferenceLabelProps) {
    const x = viewBox?.x ?? 0;
    const y = (viewBox?.y ?? 0) + 8;
    const paddingX = 6;
    const paddingY = 4;
    const approxWidth = text.length * 6.5;
    const approxHeight = 14;
    const rectX = x - approxWidth / 2 - paddingX;
    const rectY = y - approxHeight;
    const width = approxWidth + paddingX * 2;
    const height = approxHeight + paddingY;

    return (
        <g>
            <rect
                x={rectX}
                y={rectY}
                width={width}
                height={height}
                rx={4}
                ry={4}
                fill="rgba(255,255,255,0.85)"
                stroke="#ef4444"
                strokeWidth={0.6}
            />
            <text
                x={x}
                y={rectY + height - paddingY - 2}
                textAnchor="middle"
                fill="#b91c1c"
                fontSize={11}
                fontWeight={600}
            >
                {text}
            </text>
        </g>
    );
}
