import fs from "fs/promises";
import path from "path";
import RevealSection from "./components/RevealSection";
import RollingBetaChartClient from "./components/RollingBetaChartClient";
import FEVDNowChartTableClient from "./components/FEVDNowChartTableClient";
import FEVDTrendStrip from "./components/FEVDTrendStrip";
import BillSensitivityTable from "./components/BillSensitivityTable";
import SectionBreadcrumbs from "./components/SectionBreadcrumbs";
import ScrollCue from "./components/ScrollCue";
import { DetailModeProvider } from "./components/DetailModeContext";
import RenShareNarrative from "./components/RenShareNarrative";
import PassThroughNarrative from "./components/PassThroughNarrative";
import FEVDNowNarrative from "./components/FEVDNowNarrative";
import FEVDTrendNarrative from "./components/FEVDTrendNarrative";
import MobileDisclaimerModal from "./components/MobileDisclaimerModal";
import ModelReadyChartsClient from "./components/ModelReadyChartsClient";
import RenShareSeriesChartClient from "./components/RenShareSeriesChartClient";
import { Timeline } from "./components/Timeline";
import type {
  RollingBetaPoint,
  FEVDFullRow,
  FEVDTrendPoint,
  RenSharePoint,
  ModelReadyPoint,
} from "@/types/results";

type SectionBreadcrumb = {
  id: string;
  label: string;
  aliases?: string[];
};

type RollingPhaseDefinition = {
  id: string;
  label: string;
  start: string;
  end?: string;
  color: string;
  windowLabel: string;
};

type SystemTimelineEvent = {
  id: string;
  year: string;
  label: string;
  description: string;
};

type WebData = {
  rollingBeta: RollingBetaPoint[];
  fevdDemandFirst: FEVDFullRow | null;
  fevdRenFirst: FEVDFullRow | null;
  fevdTrend: FEVDTrendPoint[];
  renShareSeries: RenSharePoint[];
  modelReady: ModelReadyPoint[];
};

const SECTION_BREADCRUMBS: SectionBreadcrumb[] = [
  {
    id: "hero",
    label: "Overview",
    aliases: ["about", "tldr"],
  },
  { id: "background", label: "Background & Motivation" },
  { id: "old-story", label: "Conventional Belief" },
  { id: "contribution", label: "What’s Different Here" },
  {
    id: "system-change",
    label: "How VIC Changed",
    aliases: ["system-change-prices", "system-change-ren-share"],
  },
  { id: "methods", label: "Data & Methods" },
  {
    id: "phases",
    label: "Evidence",
    aliases: ["pass-through", "fevd-now", "fevd-trend"],
  },
  { id: "bills", label: "Impact on Households" },
  { id: "policy", label: "Policy & Market" },
  { id: "limitations", label: "Limitations" },
];

const ROLLING_PHASES: RollingPhaseDefinition[] = [
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

const SYSTEM_TIMELINE_EVENTS: SystemTimelineEvent[] = [
  {
    id: "hazelwood",
    year: "2017",
    label: "Hazelwood",
    description:
      "The Hazelwood brown coal station closes, tightening supply and lifting wholesale prices.",
  },
  {
    id: "covid",
    year: "2020",
    label: "Covid-19",
    description:
      "The pandemic reshapes demand profiles and volatility as lockdowns and recovery play out.",
  },
  {
    id: "fuel-shock",
    year: "2022",
    label: "Fuel shock",
    description:
      "Russia–Ukraine drives a global gas and coal crunch, sending fuel benchmarks sharply higher.",
  },
  {
    id: "market-cap",
    year: "Jun 2022",
    label: "Market cap",
    description:
      "Price caps and a temporary NEM suspension break the usual fuel-linked price formation.",
  },
];

async function getWebData(): Promise<WebData> {
  const base = path.join(process.cwd(), "public", "data");

  async function safeRead<T>(fileName: string): Promise<T | null> {
    try {
      const raw = await fs.readFile(path.join(base, fileName), "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  const [
    rollingBeta,
    fevdDemandFirstArr,
    fevdRenFirstArr,
    fevdTrend,
    renShareSeries,
    modelReady,
  ] = await Promise.all([
    safeRead<RollingBetaPoint[]>("rolling_beta.json"),
    safeRead<FEVDFullRow[]>("fevd_full_demand_first.json"),
    safeRead<FEVDFullRow[]>("fevd_full_ren_first.json"),
    safeRead<FEVDTrendPoint[]>("fevd_trend.json"),
    safeRead<RenSharePoint[]>("ren_share_series.json"),
    safeRead<ModelReadyPoint[]>("model_ready.json"),
  ]);

  return {
    rollingBeta: rollingBeta ?? [],
    fevdDemandFirst: fevdDemandFirstArr?.[0] ?? null,
    fevdRenFirst: fevdRenFirstArr?.[0] ?? null,
    fevdTrend: fevdTrend ?? [],
    renShareSeries: renShareSeries ?? [],
    modelReady: modelReady ?? [],
  };
}

type RollingPhaseSummary = {
  id: string;
  label: string;
  start: string;
  end?: string;
  color: string;
  windowLabel: string;
  avgBeta: number | null;
  count: number;
};

const parseYearMonth = (value: string) => {
  const [y, m] = value.split("-");
  return new Date(Number(y), Number(m) - 1, 1);
};

function computeRollingPhaseSummaries(
  data: RollingBetaPoint[]
): RollingPhaseSummary[] {
  return ROLLING_PHASES.map((phase) => {
    const startDate = parseYearMonth(phase.start);
    const endDate = phase.end ? parseYearMonth(phase.end) : null;
    const points = data.filter((d) => {
      const dDate = parseYearMonth(d.date);
      return dDate >= startDate && (!endDate || dDate <= endDate);
    });
    const avgBeta = points.length
      ? points.reduce((sum, p) => sum + p.beta, 0) / points.length
      : null;
    return { ...phase, avgBeta, count: points.length };
  });
}

type PhaseAverages = {
  phase1: number | null;
  phase2: number | null;
  phase3: number | null;
};

const PUBLISHED_DATE = "30 Nov 2025";

function getPhaseAverage(
  summaries: RollingPhaseSummary[],
  id: RollingPhaseDefinition["id"]
): number | null {
  return summaries.find((phase) => phase.id === id)?.avgBeta ?? null;
}

function getPhaseAverages(summaries: RollingPhaseSummary[]): PhaseAverages {
  return {
    phase1: getPhaseAverage(summaries, "p1"),
    phase2: getPhaseAverage(summaries, "p2"),
    phase3: getPhaseAverage(summaries, "p3"),
  };
}

export default async function Home() {
  const data = await getWebData();
  const rollingPhaseSummaries = computeRollingPhaseSummaries(data.rollingBeta);
  const maxAbsRollingPhaseBeta = Math.max(
    0,
    ...rollingPhaseSummaries.map((phase) =>
      phase.avgBeta !== null ? Math.abs(phase.avgBeta) : 0
    )
  );
  const phaseAverages = getPhaseAverages(rollingPhaseSummaries);

  return (
    <DetailModeProvider>
      <MobileDisclaimerModal />
      <div className="snap-container">
        <main>
          <SectionBreadcrumbs sections={SECTION_BREADCRUMBS} />

          {/* 1. OVERVIEW */}
          <HeroSection publishedDate={PUBLISHED_DATE} />
          <AboutSection />

          {/* 2. BACKGROUND AND MOTIVATION */}
          <BackgroundSection />
          <OldStorySection />
          <ContributionSection />
          <SystemChangeSection modelReady={data.modelReady} />

          {/* 3. DATA AND METHODS */}
          <MethodsSection />

          {/* 4. EVIDENCE */}
          <PhasesNarrativeSection />
          <PassThroughSection
            rollingBeta={data.rollingBeta}
            rollingPhaseSummaries={rollingPhaseSummaries}
            maxAbsRollingPhaseBeta={maxAbsRollingPhaseBeta}
            phaseAverages={phaseAverages}
          />
          <FEVDNowSection
            fevdDemandFirst={data.fevdDemandFirst}
            fevdRenFirst={data.fevdRenFirst}
          />
          <FEVDTrendSection fevdTrend={data.fevdTrend} />

          {/* 5. IMPLICATION */}
          <BillsSection
            fevdDemandFirst={data.fevdDemandFirst}
            fevdRenFirst={data.fevdRenFirst}
          />
          <PolicySection />

          {/* 6. LIMITATIONS */}
          <LimitationsSection />
        </main>
      </div>
    </DetailModeProvider>
  );
}

type HeroSectionProps = {
  publishedDate: string;
};

function HeroSection({ publishedDate }: HeroSectionProps) {
  return (
    <RevealSection sectionId="hero">
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: "42rem" }}>
          <p
            style={{
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Victorian Energy Market Dynamics • Explainer
          </p>
          <p
            style={{
              marginTop: "0.4rem",
              fontSize: "0.8rem",
              color: "#6b7280",
            }}
          >
            {publishedDate} ·{" "}
            <a
              href="https://michaelharrison.au"
              target="_blank"
              className="contact-link"
            >
              Michael Harrison
            </a>
          </p>
          <h1
            style={{
              fontSize: "2.8rem",
              lineHeight: 1.1,
              fontWeight: 600,
              marginTop: "1.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Decoupling from gas
          </h1>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 500,
              color: "#4b5563",
              maxWidth: "32rem",
            }}
          >
            From gas-led to renewable-led power pricing
          </h2>

          <p
            style={{
              marginTop: "1.25rem",
              fontSize: "0.95rem",
              color: "#555",
              maxWidth: "38rem",
            }}
            className="detail-detailed"
          >
            Using monthly data from 2015 to 2025 and standard tools from energy
            economics, we track how gas, renewables, imports and demand each
            contribute to Victorian wholesale electricity prices, and attempt to
            answer the question:
            <br />
            <br />
            <b>
              Does gas still anchor Victorian power prices, or has the system
              become weather / renewables-led?
            </b>
          </p>

          <div style={{ marginTop: "1.75rem" }}>
            <a href="" className="hero-cta">
              Download report (PDF)
            </a>
          </div>

          <ScrollCue />
        </div>
      </section>
    </RevealSection>
  );
}

function AboutSection() {
  return (
    <RevealSection sectionId="about">
      <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
        About this project
      </h2>
      <div
        className="mt-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 shadow-sm"
        style={{ maxWidth: "36rem" }}
      >
        <dl className="space-y-1">
          <div className="flex gap-2">
            <dt className="w-24 text-neutral-500">Author</dt>
            <dd className="flex-1">
              <a
                href="https://michaelharrison.au"
                className="underline underline-offset-2"
                target="_blank"
              >
                Michael Harrison
              </a>
            </dd>
          </div>

          <div className="flex gap-2">
            <dt className="w-24 text-neutral-500">Scope</dt>
            <dd className="flex-1">Victoria only (NEM VIC region)</dd>
          </div>

          <div className="flex gap-2">
            <dt className="w-24 text-neutral-500">Period</dt>
            <dd className="flex-1">Monthly data, 2015–2025</dd>
          </div>

          <div className="flex gap-2 detail-detailed">
            <dt className="w-24 text-neutral-500">Data</dt>
            <dd className="flex-1">
              <p>
                Monthly Victorian prices, gas, renewables, imports/exports,
                demand and weather, plus key global fuel benchmarks.
              </p>
              <p className="data-sources mt-1 text-xs text-neutral-500">
                <a
                  href="https://explore.openelectricity.org.au/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Electricity
                </a>{" "}
                ·{" "}
                <a
                  href="https://www.aer.gov.au/industry/registers/charts/wallumbilla-gas-supply-hub-trade-volume-and-vwa-prices-pipeline"
                  target="_blank"
                  rel="noreferrer"
                >
                  AER
                </a>{" "}
                ·{" "}
                <a
                  href="https://fred.stlouisfed.org/graph/?g=ko34"
                  target="_blank"
                  rel="noreferrer"
                >
                  FRED
                </a>{" "}
                ·{" "}
                <a
                  href="https://www.indexmundi.com/commodities/?commodity=coal-australian"
                  target="_blank"
                  rel="noreferrer"
                >
                  Index Mundi
                </a>
              </p>
            </dd>
          </div>
          <div className="flex gap-2 detail-compact">
            <dt className="w-24 text-neutral-500">Methods</dt>
            <dd className="flex-1">
              <p>We focus on three main variables:</p>
              <ul>
                <li>Victorian Electricty Prices</li>
                <li>Wallumbilla Gas Prices</li>
                <li>Renewables Generation Share</li>
              </ul>
              <p>
                We compare the relationship between these variables over time
                trying to identify structural changes in the relationship that
                may indicate Victorian prices move independently from gas.
              </p>
            </dd>
          </div>

          <div className="flex gap-2 detail-detailed">
            <dt className="w-24 text-neutral-500">Methods</dt>
            <dd className="flex-1">
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Rolling gas → power pass-through models</li>
                <li>Structural VAR with FEVD</li>
                <li>Unit root, break and cointegration tests</li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </RevealSection>
  );
}

function OldStorySection() {
  return (
    <RevealSection sectionId="old-story">
      <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
        2.1 Conventional Belief
      </h2>
      <div className="detail-compact">
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>
            For years, the simple story was that when gas goes up, power bills
            follow.
          </li>
          <li>
            Reports and commentary treated gas as the fuel that sets most
            wholesale electricity prices.
          </li>
          <li>
            That view put gas at the centre of price setting and pushed
            renewables and weather to the edges.
          </li>
        </ul>
      </div>
      <div className="detail-detailed">
        <p>The dominant story in Australia’s electricity debate has been simple:</p>
        <p style={{ fontStyle: "italic", marginLeft: "1rem" }}>
          “If gas prices jump, electricity prices follow.”
        </p>
        <p>
          Policy reports, think tanks and commentators all treat gas as the fuel
          that sets wholesale prices in the National Electricity Market (NEM).
          The Australia Institute’s 2025 briefing on{" "}
          <a
            href="https://australiainstitute.org.au/wp-content/uploads/2025/07/P1816-Gas-updates-gas-and-electricity-prices-WEB.pdf"
            target="_blank"
            rel="noreferrer"
          >
            gas and electricity prices
          </a>{" "}
          puts it bluntly:{" "}
          <span style={{ fontStyle: "italic" }}>
            “Gas and electricity prices are closely correlated because in the
            NEM the price of gas-powered electricity generation often sets the
            wholesale price of electricity.”
          </span>
        </p>
        <p>
          Earlier work from the same institute argued that linking east coast
          gas to export markets has{" "}
          <a
            href="https://australiainstitute.org.au/post/gas-exports-have-tripled-australian-gas-prices-and-doubled-electricity-prices/"
            target="_blank"
            rel="noreferrer"
          >
            “tripled Australian gas prices and doubled electricity prices”
          </a>
          , cementing the idea that gas costs flow straight through to power
          bills.
        </p>
        <p>
          Independent analysts make the same connection. In a widely cited piece
          on high power bills, IEEFA notes that{" "}
          <a
            href="https://ieefa.org/resources/whats-really-driving-high-power-bills-hint-its-not-renewables-and-how-can-we-reduce-them"
            target="_blank"
            rel="noreferrer"
          >
            gas prices have historically been a key driver of wholesale
            electricity price rises
          </a>
          , with a very strong historical correlation between gas and
          electricity prices.
        </p>
        <p>
          Academic work has reinforced this view. Nolan, Gilmore and Munro
          (2022), in a Griffith University working paper on the{" "}
          <a
            href="https://www.griffith.edu.au/__data/assets/pdf_file/0034/1639348/No.2022-08-Gas-Price-and-Electricity-price-Relationship.pdf"
            target="_blank"
            rel="noreferrer"
          >
            gas–electricity price relationship in the NEM
          </a>
          , show that over 2012–2021 much of the mainland market behaved like a
          gas-indexed system: wholesale prices could be closely linked to
          Wallumbilla gas via an effective “grid heat rate”, with coal and hydro
          often shadow-pricing gas even when gas units were not literally
          setting the price.
        </p>
        <p>
          The Climate Council’s explainer on{" "}
          <a
            href="https://www.climatecouncil.org.au/four-reasons-why-your-power-prices-are-sky-high-and-rising/"
            target="_blank"
            rel="noreferrer"
          >
            why power prices are “sky high and rising”
          </a>{" "}
          pushes the same story from another angle:{" "}
          <span style={{ fontStyle: "italic" }}>
            “polluting and expensive fossil fuels like coal and gas are the main
            culprits”
          </span>{" "}
          behind soaring bills.
        </p>
        <p>
          Put together, think-tank commentary and academic research reinforce a
          clear picture: in the standard narrative,{" "}
          <b>gas still sits at the centre of price formation</b>, with
          renewables and weather playing supporting roles at the margins. The
          rest of this page tests that story directly using Victorian data from
          2015–2025 — and shows how, in a high-renewables, interconnected
          system, that gas–power link has fundamentally changed.
        </p>
      </div>
    </RevealSection>
  );
}

function ContributionSection() {
  return (
    <RevealSection sectionId="contribution">
      <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
        2.2 What this study does differently
      </h2>

      {/* Compact – general audience */}
      <div className="detail-compact">
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>
            We look just at <b>Victoria</b>, rather than treating the whole east
            coast as one big market.
          </li>
          <li>
            We include the recent years when <b>renewables, storage and
              interconnectors</b> really start to bite.
          </li>
          <li>
            We test, in simple terms, whether Victoria still behaves like a{" "}
            <b>gas-led</b> market or more like a <b>weather-led</b> one.
          </li>
          <li>
            We show three simple facts:
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>
                earlier in the decade, gas price moves and power prices tended
                to move together; in recent years they mostly do not;
              </li>
              <li>
                when prices bounce around now,{" "}
                <b>renewables explain much more of that</b> than gas does;
              </li>
              <li>
                over the decade, renewables’ role in price swings has grown,
                while gas’s role has shrunk.
              </li>
            </ul>
          </li>
          <li>
            Put simply: Victoria has <b>decoupled from gas</b> — monthly prices
            now lean far more on <b>weather, renewables and system conditions</b>{" "}
            than on global gas prices.
          </li>
        </ul>
      </div>

      {/* Detailed – for people who care about methods */}
      <div className="detail-detailed">
        <p>
          This work builds on that standard gas–power story, but does three
          things differently:
        </p>
        <ul>
          <li>
            <b>Victoria focus:</b> It zooms in on Victorian wholesale prices
            rather than treating the mainland NEM as one homogeneous market.
          </li>
          <li>
            <b>High-renewables period:</b> It extends the data through 2025,
            capturing the post-2022 crisis years where renewables, storage and
            interconnectors play a much larger role.
          </li>
          <li>
            <b>Time-series lens:</b> It uses cointegration tests, structural
            break tests and VAR/FEVD analysis to look at regime shifts and
            variance shares, not just simple correlations or average “heat
            rates”.
          </li>
        </ul>

        <p className="mt-3">Empirically, three findings drive the story:</p>
        <ul>
          <li>
            <b>Pass-through collapses:</b> rolling gas → power models show a
            clear positive relationship in 2015–19 that falls to around zero
            (and sometimes negative) in 2023–25.
          </li>
          <li>
            <b>Renewables ≫ gas in variance shares:</b> in the latest data, gas
            shocks explain only around <b>2%</b> of two-year price variance,
            while renewables explain around <b>14–15%</b>, and this result is
            robust to alternative VAR orderings.
          </li>
          <li>
            <b>A decade-long shift:</b> FEVD trends over time show renewables’
            contribution to price variation rising and gas’s contribution
            shrinking, consistent with a structural move away from gas-anchored
            pricing.
          </li>
        </ul>

        <p className="mt-3">
          Taken together, these results suggest that while gas historically
          anchored prices across the NEM, in Victoria&apos;s recent
          high-renewables regime wholesale prices have largely{" "}
          <b>decoupled from international fossil fuel benchmarks</b>.
          Geopolitical risk transmitted via global oil and gas prices has been
          replaced by <b>meteorological and system risk</b> — dunkelflaute,
          heatwaves and network conditions now sit at the centre of monthly
          price formation, with gas moving to the periphery.
        </p>
      </div>
    </RevealSection>
  );
}

function BackgroundSection() {
  return (
    <RevealSection sectionId="background">
      <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
        2. Background and Motivation
      </h2>
      <div className="detail-compact">
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>
            Victoria is part of a shared electricity market where the cheapest
            power needed sets the price.
          </li>
          <li>
            Big shifts like coal closures, the pandemic and global fuel shocks
            have changed how this market behaves.
          </li>
          <li>
            At the same time, much more wind, solar and storage have come online
            and links to other states have strengthened.
          </li>
          <li>
            We ask whether gas still anchors prices in this newer, more
            renewable and more connected system.
          </li>
        </ul>
      </div>
      <div className="detail-detailed">
        <p>
          Victoria sits inside the National Electricity Market (NEM), a
          multi-region wholesale pool where generators bid every few minutes and
          the cheapest plant needed to meet demand sets the price (the
          “merit-order”).
        </p>
        <p>
          Historically, brown coal supplied most Victorian energy, with gas
          often setting the marginal price. Several events reshaped this
          picture, including coal closures, Covid-19, Russia&apos;s invasion of
          Ukraine and the resulting global fuel crunch and domestic market
          interventions.
        </p>
        <p>
          Our analysis sits on top of this institutional backdrop. We are not
          re-telling the standard merit-order story, but testing whether gas
          still anchors prices in this newer, high-renewables, interconnected
          system.
        </p>
      </div>
    </RevealSection>
  );
}

type SystemChangeSectionProps = {
  modelReady: ModelReadyPoint[];
};

function SystemChangeSection({ modelReady }: SystemChangeSectionProps) {
  const renOnly = modelReady.map(({ date, ren_share }) => ({
    date: date.slice(0, 7),
    ren_share,
  }));

  return (
    <>
      <RevealSection sectionId="system-change">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          2.3 How Victoria&apos;s system has changed
        </h2>
        <div className="detail-compact">
          <p className="text-sm text-neutral-700" style={{ maxWidth: "42rem" }}>
            Scroll through the timeline and charts to see how coal exits, Covid-19
            and the 2022 fuel shock line up with visible shifts in Victorian prices
            and renewables.
          </p>
        </div>
        <div className="detail-detailed">
          <p className="text-sm text-neutral-700" style={{ maxWidth: "42rem" }}>
            This section pulls together the major structural shocks to Victoria&apos;s
            system – Hazelwood&apos;s closure, Covid-19, the Russia–Ukraine fuel shock
            and the June 2022 market intervention – as a single visual timeline before
            you look at prices and renewables in more detail.
          </p>
        </div>
        <h3 style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
          2.3.1 Timeline of key events
        </h3>
        <div className="mt-4 full-bleed">
          <div className="wide-inner">
            <Timeline events={SYSTEM_TIMELINE_EVENTS} />
          </div>
        </div>
      </RevealSection>

      <RevealSection sectionId="system-change-prices">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          2.3.2 Price series
        </h2>
        <div className="detail-compact">
          <p className="text-sm text-neutral-700" style={{ maxWidth: "42rem" }}>
            Use this chart to see how Victorian wholesale prices and gas prices move
            closely together early in the sample, then diverge around the global
            fuel shock and market interventions.
          </p>
        </div>
        <div className="detail-detailed">
          <p className="text-sm text-neutral-700" style={{ maxWidth: "42rem" }}>
            Early in the decade, gas and electricity prices track one another
            closely. Around 2022–23, global fuel shocks and domestic interventions
            break that tight link: wholesale prices fall back faster than gas,
            consistent with a system that is less tightly anchored to fuel costs.
          </p>
        </div>
        <div className="mt-4" style={{ maxWidth: "40rem" }}>
          <ModelReadyChartsClient
            data={modelReady}
            sectionId="system-change-prices"
            includedKeys={["gas", "price"]}
          />
        </div>
      </RevealSection>

      <RevealSection sectionId="system-change-ren-share">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          2.3.3 Renewables share
        </h2>
        <div className="mt-4" style={{ maxWidth: "40rem" }}>
          <RenShareNarrative />
          <RenShareSeriesChartClient
            data={renOnly}
            sectionId="system-change-ren-share"
          />
        </div>
      </RevealSection>
    </>
  );
}

function MethodsSection() {
  return (
    <RevealSection sectionId="methods">
      <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
        3. Data and Methods
      </h2>
      <div className="detail-compact">
        <p className="text-sm text-neutral-700" style={{ maxWidth: "42rem" }}>
          We bring together monthly data on Victorian prices, gas, renewables and
          related drivers, and apply standard time-series tools to track breaks and
          changing price dynamics over 2015–2025.
        </p>
      </div>
      <div className="detail-detailed">
        <h3 style={{ marginTop: "0.75rem", fontSize: "1.1rem" }}>3.1 Data</h3>
        <p>We assembled monthly data for Victoria from early 2015 to late 2025:</p>
        <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
          <li>wholesale electricity prices,</li>
          <li>gas prices at the Wallumbilla gas hub,</li>
          <li>the share of generation from renewables,</li>
          <li>imports and exports between Victoria and other states,</li>
          <li>demand, temperature and key global fuel prices.</li>
        </ul>

        <h3 style={{ marginTop: "1rem", fontSize: "1.1rem" }}>3.2 Methods</h3>
        <p>
          On top of this, we applied well-established econometric tools: unit
          root and cointegration tests, structural break tests, rolling models,
          and vector autoregressions (VARs) with forecast error variance
          decompositions (FEVDs), plus a standard spillover index to summarise
          cross-variable connectedness.
        </p>

        <h3 style={{ marginTop: "1rem", fontSize: "1.1rem" }}>3.3 Breaks</h3>
        <p>
          These tests first ask whether any variable provides a stable long-run
          “anchor” for the others. In our data there is{" "}
          <strong>no cointegrating relationship</strong> tying electricity
          prices tightly to gas, renewables or demand; in plain terms, power
          prices do not reliably “track” any one of these over the long run.
          Around <strong>a quarter</strong> of overall volatility reflects
          shocks spilling across variables rather than each series moving on its
          own. That is one early sign that the old gas anchor has weakened.
        </p>
        <p>
          You don&apos;t need the equations to follow the story. The important
          part is that we ask the same question in several independent ways: how
          important is gas today, compared with renewables, imports and demand?
        </p>
      </div>
    </RevealSection>
  );
}

function PhasesNarrativeSection() {
  return (
    <RevealSection sectionId="phases">
      <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
        4. Evidence
      </h2>
      <div className="detail-compact">
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>
            Over the decade, Victoria moves from gas-anchored prices to a more
            weather-driven pattern.
          </li>
          <li>Early on, gas price moves show up clearly in wholesale prices.</li>
          <li>
            During the crisis years, prices are buffeted by shocks and do not
            follow a single simple rule.
          </li>
          <li>
            By the most recent years, renewables, imports and other market forces
            explain much more of the action than gas alone.
          </li>
        </ul>
      </div>
      <div className="detail-detailed">
        <p>
          When we line up the data with the model results, Victoria’s last decade
          looks like three broad phases. Across break tests, rolling regressions
          and variance decompositions, the same pattern emerges.
        </p>

        <h3 style={{ marginTop: "1.25rem", fontSize: "1.2rem" }}>
          4.1 Gas-anchored prices (roughly 2015–2019)
        </h3>
        <p>
          In the early years of our sample, the old story holds. When gas prices
          move in our models, Victorian wholesale prices move with them. Over a
          two-year horizon, gas shocks explain roughly{" "}
          <strong>one in every eight movements</strong> in the wholesale price.
        </p>
        <p>
          Renewables are growing, but they still explain only a modest share of
          price variation. Gas is central to price formation; renewables are
          supporting actors.
        </p>

        <h3 style={{ marginTop: "1.25rem", fontSize: "1.2rem" }}>
          Phase 2: Crisis and transition (around 2020–2022)
        </h3>
        <p>
          Covid, global gas shocks and market interventions make prices volatile.
          In our models, this shows up as{" "}
          <strong>a clear rejection of a single, stable gas–price relationship</strong>{" "}
          over 2015–2025. Break tests on the rolling gas pass-through pick out
          shifts clustered around 2022–23 across different window lengths:
          shorter windows see more stepping, but the regime change is robust.
        </p>

        <h3 style={{ marginTop: "1.25rem", fontSize: "1.2rem" }}>
          Phase 3: Weather and renewables in the driver&apos;s seat (2023 onwards)
        </h3>
        <p>
          By the most recent years, the picture has flipped. In our variance
          decompositions, gas shocks explain only around{" "}
          <strong>2% of price variation</strong>, while renewables explain{" "}
          <strong>about 14–15%</strong> and imports a few percent more. The bulk
          – roughly four-fifths – is due to own-price shocks and other factors.
          In FEVD language, “other / own price” mostly captures shocks that hit
          electricity prices directly – policy shifts, bidding behaviour,
          outages or other market responses we haven’t modelled explicitly –
          plus the VAR’s mechanical own-shock term.
        </p>
        <p>
          In practical terms, gas hasn’t disappeared, but it has moved from the{" "}
          <em>centre</em> of price formation to the <em>periphery</em>. In a
          high-renewables, interconnected system, prices behave less like a pure
          gas market and more like a <strong>weather-driven, renewable-rich system</strong>.
        </p>
        <p>
          This is more than the familiar idea that “renewables push prices down”
          via the merit order. In our models, once we control for renewables,
          imports, demand and past prices, additional gas price movements explain
          only a small slice of remaining volatility – the gas–power link itself
          has weakened.
        </p>
      </div>
    </RevealSection>
  );
}

type PassThroughSectionProps = {
  rollingBeta: RollingBetaPoint[];
  rollingPhaseSummaries: RollingPhaseSummary[];
  maxAbsRollingPhaseBeta: number;
  phaseAverages: PhaseAverages;
};

function PassThroughSection({
  rollingBeta,
  rollingPhaseSummaries,
  maxAbsRollingPhaseBeta,
  phaseAverages,
}: PassThroughSectionProps) {
  return (
    <RevealSection sectionId="pass-through">
      <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
        4.1 Gas pass-through weakens over time
      </h2>
      <p>
        The chart below tracks how much changes in gas prices flow through to
        power prices, month by month. Shaded bands line up with the three phases
        above. When the line hugs zero (and the shaded confidence band crosses
        zero), gas isn’t really moving electricity prices. Red dots mark short
        periods where gas and power even move in opposite directions. The quick
        read: gas clearly mattered in 2015–19, but in 2023–25 the typical
        pass-through is close to zero.
      </p>
      <PassThroughNarrative
        phase1Avg={phaseAverages.phase1}
        phase2Avg={phaseAverages.phase2}
        phase3Avg={phaseAverages.phase3}
      />
      <div className="mt-4 full-bleed">
        <div className="wide-inner">
          <div className="w-full rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-4 shadow-[0_10px_40px_-32px_rgba(0,0,0,0.45)]">
            <RollingBetaChartClient data={rollingBeta} sectionId="pass-through" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-neutral-700">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-10 rounded-full bg-[#60a5fa]/40" />
          Shaded band: uncertainty range (95%)
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-neutral-900 bg-white" />
          Hollow dots: gas effect is unclear
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-neutral-900 bg-neutral-900" />
          Solid dots: gas clearly moves prices
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-[#b91c1c]" />
          Red markers: periods when gas and power move in opposite directions
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {rollingPhaseSummaries.map((phase) => {
          const width =
            phase.avgBeta !== null && maxAbsRollingPhaseBeta > 0
              ? Math.max(
                10,
                (Math.abs(phase.avgBeta) / maxAbsRollingPhaseBeta) * 100
              )
              : 0;
          const valueLabel =
            phase.avgBeta !== null ? `${(phase.avgBeta * 100).toFixed(1)}%` : "—";
          return (
            <div
              key={phase.id}
              className="rounded-lg border border-neutral-200 bg-white/90 px-3 py-2 text-[11px] text-neutral-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{phase.label}</span>
                <span className="text-neutral-600">{valueLabel}</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${width}%`,
                    backgroundColor: phase.color,
                  }}
                />
              </div>
              <div className="mt-1 text-[10px] text-neutral-500">
                {phase.windowLabel}
              </div>
            </div>
          );
        })}
      </div>
    </RevealSection>
  );
}

type FEVDNowSectionProps = {
  fevdDemandFirst: FEVDFullRow | null;
  fevdRenFirst: FEVDFullRow | null;
};

function FEVDNowSection({
  fevdDemandFirst,
  fevdRenFirst,
}: FEVDNowSectionProps) {
  return (
    <RevealSection sectionId="fevd-now">
      <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
        4.2 Renewables now explain more of price variance than gas
      </h2>
      <p>
        Over a two-year (24-month) horizon in the most recent data, our FEVD
        results show that gas shocks account for only a small slice of price
        variation (around <strong>2%</strong>). Renewables explain roughly{" "}
        <strong>14–15%</strong>, imports a few percent more, and{" "}
        <span style={{ whiteSpace: "nowrap" }}>other / own price</span> dynamics
        about <strong>four-fifths</strong>. The stacked bars make that plain: the
        big gray chunk is “other / own price”, the green slice is renewables, and
        the tiny amber slice is gas.
      </p>
      <FEVDNowNarrative />
      <p>
        Here “other / own price” mostly captures shocks that hit electricity
        prices directly – bidding behaviour, outages, policy shifts and market
        design – plus the mechanical “own-shock” component of the VAR.
      </p>
      <div className="mt-4">
        <FEVDNowChartTableClient
          demandFirst={fevdDemandFirst}
          renFirst={fevdRenFirst}
          sectionId="fevd-now"
        />
      </div>
    </RevealSection>
  );
}

type FEVDTrendSectionProps = {
  fevdTrend: FEVDTrendPoint[];
};

function FEVDTrendSection({ fevdTrend }: FEVDTrendSectionProps) {
  return (
    <RevealSection sectionId="fevd-trend">
      <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
        4.3 Shift in price drivers
      </h2>
      <p>
        These panels show how each driver’s share of overall variance moves over
        time, not just at the two-year horizon above. Monthly FEVD shares for
        each driver show <span style={{ whiteSpace: "nowrap" }}>other / own price</span>{" "}
        dynamics dominating throughout, renewables rising over the decade, and
        gas small in the latest period after a mid-sample spike. The shaded
        background bands align with the three phases above. Panels run in story
        order (own-price → renewables → demand → imports → gas) and all share a
        0–100% scale so you can compare at a glance.
      </p>
      <FEVDTrendNarrative />
      <div className="mt-4">
        <FEVDTrendStrip data={fevdTrend} sectionId="fevd-trend" />
      </div>
    </RevealSection>
  );
}

type BillsSectionProps = {
  fevdDemandFirst: FEVDFullRow | null;
  fevdRenFirst: FEVDFullRow | null;
};

function BillsSection({ fevdDemandFirst, fevdRenFirst }: BillsSectionProps) {
  return (
    <RevealSection sectionId="bills">
      <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
        5.1 Impact on households
      </h2>
      <div className="detail-compact">
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>
            The key question for households and small businesses is what really
            moves their power bills now.
          </li>
          <li>
            Earlier in the decade, gas price spikes were a bigger part of the
            story.
          </li>
          <li>
            Today, bills are more exposed to weather, renewable output and how
            well the grid moves power around.
          </li>
          <li>
            Gas still matters in tight moments, but it is no longer the only
            thing to watch.
          </li>
        </ul>
      </div>
      <div className="detail-detailed">
        <p>For a household or small business, the core question is simple:</p>
        <p style={{ fontStyle: "italic", marginLeft: "1rem" }}>
          “What am I actually exposed to now?”
        </p>
        <p>
          Earlier in the decade, a significant share of the risk in your
          electricity bill really was about gas. If international gas prices
          spiked, there was a good chance your power bill would feel it.
        </p>
        <p>
          Today, our analysis suggests that your bill is relatively less exposed
          to gas price shocks and more exposed to:
        </p>
        <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
          <li>weather and temperature, which drive demand,</li>
          <li>the availability of wind and solar, which shifts supply,</li>
          <li>
            and the health of transmission and interconnectors, which govern
            imports and congestion.
          </li>
        </ul>
        <p>
          This doesn’t mean gas is irrelevant – during tight supply episodes
          gas-fired plant still often sets the marginal price – but on a
          month-by-month basis, weather, renewables and network conditions now
          explain much more of the ups and downs.
        </p>
      </div>
      <BillSensitivityTable demandFirst={fevdDemandFirst} renFirst={fevdRenFirst} />
    </RevealSection>
  );
}

function PolicySection() {
  return (
    <RevealSection sectionId="policy">
      <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
        5.2 Policy and market implications
      </h2>
      <div className="detail-compact">
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>
            If prices are less tied to fuel costs, risk management has to focus
            more on weather, renewables and the grid.
          </li>
          <li>
            Gas hedging alone is no longer enough; flexible demand, storage and
            strong networks matter more.
          </li>
          <li>
            Policy that treats gas as the main villain or hero will explain less
            and less of what happens to bills.
          </li>
          <li>
            Future market design needs to reward flexibility, clean capacity and
            reliable connections as much as fuel supply.
          </li>
        </ul>
      </div>
      <div className="detail-detailed">
        <p>
          This shift has real consequences for hedging and market design. Hedging
          gas alone is no longer enough; weather, renewable generation and
          congestion risk now matter more for wholesale prices. Market
          participants increasingly need tools that manage{" "}
          <strong>scarcity and abundance risk</strong> – contracts linked to
          weather, flexible load, storage and interconnector availability, not
          just fuel.
        </p>
        <p>
          For policymakers, a weaker gas anchor means traditional fuel-cost
          narratives will explain less and less of what happens to bills.
          Pricing, reliability and transition policy need to account for a system
          where renewables, storage and networks drive scarcity events. Market
          signals should reward flexibility – storage, demand response and
          transmission – as well as fuel.
        </p>
        <p style={{ marginTop: "1rem" }}>
          The full working paper sets out the models and robustness checks in
          detail, including unit root tests, break tests and variance
          decompositions. This page is the accessible version of that story.
        </p>
      </div>
    </RevealSection>
  );
}

function LimitationsSection() {
  return (
    <RevealSection sectionId="limitations">
      <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>6. Limitations</h2>
      <div className="detail-compact">
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>We work with monthly data and cannot capture very short-lived price spikes.</li>
          <li>The models focus on a limited set of drivers and leave out detailed bidding behaviour.</li>
          <li>Results are specific to Victoria and the 2015–2025 period.</li>
        </ul>
      </div>
      <div className="detail-detailed">
        <p>
          This analysis uses monthly data, so it smooths over five-minute and half-hour
          price spikes that can matter for some market participants. Our models also
          deliberately focus on a small set of key variables – prices, gas, renewables,
          imports, demand and weather – rather than the full richness of bidding
          strategies, contract positions or plant-level constraints.
        </p>
        <p>
          The findings are specific to Victoria over 2015–2025 and rely on standard
          time-series assumptions. Different modelling choices, higher-frequency data
          or future structural changes in the market could shift the precise numbers,
          even if the broad story about weakening gas pass-through and stronger
          renewable influence remains.
        </p>
      </div>
    </RevealSection>
  );
}
