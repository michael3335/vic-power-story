"use client";

import React from "react";
import {
    Area,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    AreaChart,
} from "recharts";
import type { RenSharePoint } from "@/types/results";
import { ACTIVE_SECTION_EVENT } from "./RevealSection";

type Props = {
    data: RenSharePoint[];
    sectionId?: string;
};

type TooltipProps = {
    active?: boolean;
    label?: string | number;
    payload?: {
        payload: RenSharePoint;
    }[];
};

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
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
                Renewables share of generation:{" "}
                <span className="font-semibold">
                    {(p.ren_share * 100).toFixed(1)}%
                </span>
            </div>
        </div>
    );
};

export default function RenShareSeriesChartClient({ data, sectionId }: Props) {
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
            <p className="text-sm text-neutral-600">
                No renewables share data found.
            </p>
        );
    }

    const CHART_HEIGHT = 360;

    const monthFormatter = (value: string | number) => {
        const [y] = String(value).split("-");
        return y;
    };

    const yearTicks = (() => {
        const years = Array.from(new Set(data.map((d) => d.date.slice(0, 4))));
        return years.map((year) => {
            const first = data.find((d) => d.date.startsWith(year));
            return first ? first.date : `${year}-01`;
        });
    })();

    return (
        <div className="w-full">
            <ResponsiveContainer
                width="100%"
                height={CHART_HEIGHT}
                minWidth={300}
            >
                <AreaChart
                    key={animateKey}
                    data={data}
                    margin={{ top: 12, right: 18, left: 8, bottom: 12 }}
                >
                    <defs>
                        <linearGradient id="renShareFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.08} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                        tick={{ fontSize: 10, fill: "#4b5563" }}
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                        domain={[0, 1]}
                        label={{
                            value: "Renewables share (%)",
                            angle: -90,
                            position: "insideLeft",
                            offset: 12,
                            style: { fontSize: 10, fill: "#374151" },
                        }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={{ stroke: "#e5e7eb" }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "#f3f4f6" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="ren_share"
                        stroke="#16a34a"
                        strokeWidth={1.5}
                        fill="url(#renShareFill)"
                        dot={false}
                        activeDot={{ r: 3, fill: "#16a34a" }}
                        isAnimationActive={animate}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
