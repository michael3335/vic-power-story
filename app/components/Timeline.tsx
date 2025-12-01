// app/components/Timeline.tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

type TimelineEvent = {
  id: string;
  year: string;
  label: string;
  description: string;
};

type TimelineProps = {
  events: TimelineEvent[];
};

export function Timeline({ events }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let ctx: gsap.Context | null = null;
    let mounted = true;

    (async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!mounted || !containerRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".timeline-card");

        gsap.fromTo(
          cards,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );

        gsap.fromTo(
          ".timeline-progress",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
            },
          }
        );
      }, containerRef);
    })();

    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/90 px-4 py-5 text-slate-50 shadow-[0_22px_60px_-32px_rgba(15,23,42,1)] md:px-6 md:py-6"
    >
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            Victoria power market timeline
          </p>
          <p className="mt-1 text-sm text-slate-100/90">
            Four shocks that reshape how prices are set.
          </p>
        </div>
        <p className="text-xs font-medium text-slate-400">2017–2025</p>
      </div>

      <div className="relative mb-5 h-[4px] w-full overflow-hidden rounded-full bg-white/10">
        <div className="timeline-progress absolute left-0 top-0 h-full w-full rounded-full bg-white/70" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="timeline-card relative rounded-2xl border border-white/10 bg-white/5 px-3 py-4 shadow-sm md:px-4 md:py-5"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-slate-50">
                {event.year}
              </span>
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
                {event.label}
              </span>
            </div>
            <p className="text-xs text-slate-100/90 md:text-sm">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
