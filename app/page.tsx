import fs from "fs/promises";
import path from "path";
import RevealSection from "./components/RevealSection";
import RollingBetaChartClient from "./components/RollingBetaChartClient";
import FEVDNowChartTableClient from "./components/FEVDNowChartTableClient";
import FEVDTrendStrip from "./components/FEVDTrendStrip";
import BillSensitivityTable from "./components/BillSensitivityTable";
import SectionBreadcrumbs from "./components/SectionBreadcrumbs";
import ScrollCue from "./components/ScrollCue";
import RenShareSeriesChartClient from "./components/RenShareSeriesChartClient";
import { DetailModeProvider } from "./components/DetailModeContext";
import RenShareNarrative from "./components/RenShareNarrative";
import PassThroughNarrative from "./components/PassThroughNarrative";
import FEVDNowNarrative from "./components/FEVDNowNarrative";
import FEVDTrendNarrative from "./components/FEVDTrendNarrative";
import MobileDisclaimerModal from "./components/MobileDisclaimerModal";
import type { RollingBetaPoint, FEVDFullRow, FEVDTrendPoint, RenSharePoint } from "@/types/results";

const SECTION_BREADCRUMBS = [
  {
    id: "hero",
    label: "Introduction",
    aliases: ["about", "tldr"],
  },
  /* { id: "exec", label: "Executive summary" },*/
  { id: "old-story", label: "Traditional Narrative" },
  { id: "contribution", label: "Contribution" },
  { id: "background", label: "Market Context" },
  { id: "ren-share", label: "Renewables Share" },
  { id: "methods", label: "Methods" },
  {
    id: "phases",
    label: "Regime Shifts",
    aliases: ["pass-through", "fevd-now", "fevd-trend"],
  },
  { id: "bills", label: "Retail Impact" },
  { id: "policy", label: "Policy Implications" },
];

async function getWebData() {
  const base = path.join(process.cwd(), "public", "data");

  async function safeRead<T>(fileName: string): Promise<T | null> {
    try {
      const raw = await fs.readFile(path.join(base, fileName), "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  const [rollingBeta, fevdDemandFirstArr, fevdRenFirstArr, fevdTrend, renShareSeries] =
    await Promise.all([
      safeRead<RollingBetaPoint[]>("rolling_beta.json"),
      safeRead<FEVDFullRow[]>("fevd_full_demand_first.json"),
      safeRead<FEVDFullRow[]>("fevd_full_ren_first.json"),
      safeRead<FEVDTrendPoint[]>("fevd_trend.json"),
      safeRead<RenSharePoint[]>("ren_share_series.json"),
    ]);

  return {
    rollingBeta: rollingBeta ?? [],
    fevdDemandFirst: fevdDemandFirstArr?.[0] ?? null,
    fevdRenFirst: fevdRenFirstArr?.[0] ?? null,
    fevdTrend: fevdTrend ?? [],
    renShareSeries: renShareSeries ?? [],
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

function computeRollingPhaseSummaries(data: RollingBetaPoint[]): RollingPhaseSummary[] {
  const parseDate = (value: string) => {
    const [y, m] = value.split("-");
    return new Date(Number(y), Number(m) - 1, 1);
  };

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

  return phases.map((phase) => {
    const startDate = parseDate(phase.start);
    const endDate = phase.end ? parseDate(phase.end) : null;
    const points = data.filter((d) => {
      const dDate = parseDate(d.date);
      return dDate >= startDate && (!endDate || dDate <= endDate);
    });
    const avgBeta = points.length
      ? points.reduce((sum, p) => sum + p.beta, 0) / points.length
      : null;
    return { ...phase, avgBeta, count: points.length };
  });
}

export default async function Home() {
  const { rollingBeta, fevdDemandFirst, fevdRenFirst, fevdTrend, renShareSeries } =
    await getWebData();
  const rollingPhaseSummaries = computeRollingPhaseSummaries(rollingBeta);
  const maxAbsRollingPhaseBeta = Math.max(
    ...rollingPhaseSummaries.map((p) =>
      p.avgBeta !== null ? Math.abs(p.avgBeta) : 0
    ),
    0
  );
  const phase1 = rollingPhaseSummaries.find((p) => p.id === "p1");
  const phase2 = rollingPhaseSummaries.find((p) => p.id === "p2");
  const phase3 = rollingPhaseSummaries.find((p) => p.id === "p3");
  const phase1Avg = phase1?.avgBeta ?? null;
  const phase2Avg = phase2?.avgBeta ?? null;
  const phase3Avg = phase3?.avgBeta ?? null;
  const publishedDate = "30 Nov 2025";

  return (
    <DetailModeProvider>
      <MobileDisclaimerModal />
      <main style={{ scrollSnapType: "y mandatory" }}>
        <SectionBreadcrumbs sections={SECTION_BREADCRUMBS} />
        {/* HERO */}
        <RevealSection sectionId="hero">
          <p
            style={{
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
            }}
          >
            Victorian Energy Market Dynamics • Explainer
          </p>
          <p
            style={{
              marginTop: "0.35rem",
              fontSize: "0.85rem",
              color: "#666",
            }}
          >
            {publishedDate} |{" "}
            <a href="mailto:contact@michaelharrison.au?subject=Re:%20Decoupling%20from%20gas" className="contact-link">
              Michael Harrison
            </a>
          </p>
          <h1
            style={{
              fontSize: "2.4rem",
              marginTop: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            Decoupling from gas
          </h1>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 400,
              color: "#444",
              maxWidth: "36rem",
            }}
          >
            From gas-led to weather-led power pricing
          </h2>

          <p
            style={{
              marginTop: "1.25rem",
              fontSize: "0.95rem",
              color: "#555",
            }}
          >
            Using monthly data from 2015 to 2025 and standard tools from energy
            economics, we track how gas, renewables, imports and demand each
            contribute to Victorian wholesale electricity prices, and attempt to answer the question: <br /><br /><b>Does gas still anchor Victorian power prices, or has the system become weather / renewables-led?</b>
          </p>

          <div style={{ marginTop: "1.75rem" }}>
            <a href="" className="hero-cta">
              Download report (PDF)
            </a>
          </div>
          <ScrollCue />
        </RevealSection>

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
                    href="mailto:contact@michaelharrison.au?subject=Re:%20Decoupling%20from%20gas"
                    className="underline underline-offset-2"
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

              <div className="flex gap-2">
                <dt className="w-24 text-neutral-500">Data</dt>
                <dd className="flex-1">
                  <p>
                    Monthly Victorian prices, gas, renewables, imports/exports, demand and
                    weather, plus key global fuel benchmarks.
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

              <div className="flex gap-2">
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

        {/* OLD STORY */}
        <RevealSection sectionId="old-story">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            1. Traditional Narrative
          </h2>
          <div className="detail-compact">
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>For years, the simple story was that when gas goes up, power bills follow.</li>
              <li>Reports and commentary treated gas as the fuel that sets most wholesale electricity prices.</li>
              <li>That view put gas at the centre of price setting and pushed renewables and weather to the edges.</li>
            </ul>
          </div>
          <div className="detail-detailed">
            <p>
              The dominant story in Australia’s electricity debate has been simple:
            </p>
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
                “Gas and electricity prices are closely correlated because in the NEM
                the price of gas-powered electricity generation often sets the
                wholesale price of electricity.”
              </span>
            </p>
            <p>
              Earlier work from the same institute argued that linking east coast gas
              to export markets has{" "}
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
              , with a very strong historical correlation between gas and electricity
              prices.
            </p>
            <p>
              Academic work has reinforced this view. Nolan, Gilmore and Munro (2022),
              in a Griffith University working paper on the{" "}
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
              often shadow-pricing gas even when gas units were not literally setting
              the price.
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
              <b>gas still sits at the centre of price formation</b>, with renewables
              and weather playing supporting roles at the margins. The rest of this
              page tests that story directly using Victorian data from 2015–2025 —
              and shows how, in a high-renewables, interconnected system, that
              gas–power link has fundamentally changed.
            </p>
          </div>
        </RevealSection>

        {/* Contribution */}
        <RevealSection sectionId="contribution">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            2. Contribution
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
                    earlier in the decade, gas price moves and power prices tended to
                    move together; in recent years they mostly do not;
                  </li>
                  <li>
                    when prices bounce around now, <b>renewables explain much more of
                      that</b> than gas does;
                  </li>
                  <li>
                    over the decade, renewables’ role in price swings has grown, while
                    gas’s role has shrunk.
                  </li>
                </ul>
              </li>
              <li>
                Put simply: Victoria has <b>decoupled from gas</b> — monthly prices now
                lean far more on <b>weather, renewables and system conditions</b> than
                on global gas prices.
              </li>
            </ul>
          </div>

          {/* Detailed – for people who care about methods */}
          <div className="detail-detailed">
            <p>
              This work builds on that standard gas–power story, but does three things
              differently:
            </p>
            <ul>
              <li>
                <b>Victoria focus:</b> It zooms in on Victorian wholesale prices rather
                than treating the mainland NEM as one homogeneous market.
              </li>
              <li>
                <b>High-renewables period:</b> It extends the data through 2025,
                capturing the post-2022 crisis years where renewables, storage and
                interconnectors play a much larger role.
              </li>
              <li>
                <b>Time-series lens:</b> It uses cointegration tests, structural break
                tests and VAR/FEVD analysis to look at regime shifts and variance
                shares, not just simple correlations or average “heat rates”.
              </li>
            </ul>

            <p className="mt-3">
              Empirically, three findings drive the story:
            </p>
            <ul>
              <li>
                <b>Pass-through collapses:</b> rolling gas → power models show a clear
                positive relationship in 2015–19 that falls to around zero (and
                sometimes negative) in 2023–25.
              </li>
              <li>
                <b>Renewables ≫ gas in variance shares:</b> in the latest data, gas
                shocks explain only around <b>2%</b> of two-year price variance, while
                renewables explain around <b>14–15%</b>, and this result is robust to
                alternative VAR orderings.
              </li>
              <li>
                <b>A decade-long shift:</b> FEVD trends over time show renewables’
                contribution to price variation rising and gas’s contribution shrinking,
                consistent with a structural move away from gas-anchored pricing.
              </li>
            </ul>

            <p className="mt-3">
              Taken together, these results suggest that while gas historically anchored
              prices across the NEM, in Victoria&apos;s recent high-renewables regime
              wholesale prices have largely <b>decoupled from international fossil fuel
                benchmarks</b>. Geopolitical risk transmitted via global oil and gas
              prices has been replaced by <b>meteorological and system risk</b> —
              dunkelflaute, heatwaves and network conditions now sit at the centre of
              monthly price formation, with gas moving to the periphery.
            </p>
          </div>
        </RevealSection>

        {/* BACKGROUND */}
        <RevealSection sectionId="background">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            3. Market Context
          </h2>
          <div className="detail-compact">
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Victoria is part of a shared electricity market where the cheapest power needed sets the price.</li>
              <li>Big shifts like coal closures, the pandemic and global fuel shocks have changed how this market behaves.</li>
              <li>At the same time, much more wind, solar and storage have come online and links to other states have strengthened.</li>
              <li>We ask whether gas still anchors prices in this newer, more renewable and more connected system.</li>
            </ul>
          </div>
          <div className="detail-detailed">
            <p>
              Victoria sits inside the National Electricity Market (NEM), a
              multi‑region wholesale pool where generators bid every few minutes and
              the cheapest plant needed to meet demand sets the price (the
              “merit‑order”).
            </p>
            <p>
              Historically, brown coal supplied most Victorian energy, with gas
              often setting the marginal price. Several events reshaped this
              picture:
            </p>
            <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
              <li>
                the closure of Hazelwood in 2017, which removed a large coal
                station and tightened supply;
              </li>
              <li>
                Covid‑19 from 2020, which changed demand patterns and increased
                volatility;
              </li>
              <li>
                the 2022–23 global energy price shock and domestic interventions,
                following Russia’s invasion of Ukraine;
              </li>
              <li>
                a rapid build‑out of wind, solar, rooftop PV and storage, alongside
                stronger interconnection with other NEM regions.
              </li>
            </ul>
            <p>
              Our analysis sits on top of this institutional backdrop. We are not
              re‑telling the standard merit‑order story, but testing whether gas
              still anchors prices in this newer, high‑renewables, interconnected
              system.
            </p>
          </div>
        </RevealSection>

        {/* RENEWABLES SHARE */}
        <RevealSection sectionId="ren-share">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            4. Renewables share over time
          </h2>
          <div className="detail-compact">
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Victoria now gets a much larger share of its power from wind and solar than it did a decade ago.</li>
              <li>The chart shows how quickly that share has climbed since 2015.</li>
              <li>This shift helps explain why prices now respond more to weather and renewable output.</li>
            </ul>
          </div>
          <div className="detail-detailed">
            <p>
              Before we turn to the econometrics, it is useful to see how quickly
              renewables have expanded in Victoria&apos;s mix. The chart below shows
              the monthly share of generation from renewables since 2015.
            </p>
          </div>
          <RenShareNarrative />
          <div className="mt-4" style={{ maxWidth: "40rem" }}>
            <RenShareSeriesChartClient
              data={renShareSeries}
              sectionId="ren-share"
            />
          </div>
        </RevealSection>

        {/* METHODS */}
        <RevealSection sectionId="methods">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            5. Methods
          </h2>
          <div className="detail-compact">
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>We use monthly data on prices, gas, renewables, imports and demand for Victoria from 2015 to 2025.</li>
              <li>We look for long‑run links, breaks in behaviour and how much each driver explains price swings.</li>
              <li>Across these checks, no single factor tightly pins prices down over time.</li>
              <li>That fading anchor is one reason gas plays a smaller central role than it once did.</li>
            </ul>
          </div>
          <div className="detail-detailed">
            <p>
              We assembled monthly data for Victoria from early 2015 to late 2025:
            </p>
            <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
              <li>wholesale electricity prices,</li>
              <li>gas prices at the Wallumbilla gas hub,</li>
              <li>the share of generation from renewables,</li>
              <li>imports and exports between Victoria and other states,</li>
              <li>demand, temperature and key global fuel prices.</li>
            </ul>
            <p>
              On top of this, we applied well-established econometric tools: unit
              root and cointegration tests, structural break tests, rolling models,
              and vector autoregressions (VARs) with forecast error variance
              decompositions (FEVDs), plus a standard spillover index to summarise
              cross-variable connectedness.
            </p>
            <p>
              These tests first ask whether any variable provides a stable long-run
              “anchor” for the others. In our data there is{" "}
              <strong>no cointegrating relationship</strong> tying electricity
              prices tightly to gas, renewables or demand; in plain terms, power
              prices do not reliably “track” any one of these over the long run.
              Around{" "}
              <strong>a quarter</strong> of overall volatility reflects shocks
              spilling across variables rather than each series moving on its own.
              That is one early sign that the old gas anchor has weakened.
            </p>
            <p>
              You don’t need the equations to follow the story. The important part
              is that we ask the same question in several independent ways: how
              important is gas today, compared with renewables, imports and demand?
            </p>
          </div>
        </RevealSection>

        {/* PHASES */}
        <RevealSection sectionId="phases">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            6. Regime Shifts
          </h2>
          <div className="detail-compact">
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Over the decade, Victoria moves from gas‑anchored prices to a more weather‑driven pattern.</li>
              <li>Early on, gas price moves show up clearly in wholesale prices.</li>
              <li>During the crisis years, prices are buffeted by shocks and do not follow a single simple rule.</li>
              <li>By the most recent years, renewables, imports and other market forces explain much more of the action than gas alone.</li>
            </ul>
          </div>
          <div className="detail-detailed">
            <p>
              When we line up the data with the model results, Victoria’s last
              decade looks like three broad phases. Across break tests, rolling
              regressions and variance decompositions, the same pattern emerges.
            </p>

            <h3 style={{ marginTop: "1.25rem", fontSize: "1.2rem" }}>
              Phase 1: Gas-anchored prices (roughly 2015–2019)
            </h3>
            <p>
              In the early years of our sample, the old story holds. When gas
              prices move in our models, Victorian wholesale prices move with them.
              Over a two-year horizon, gas shocks explain roughly{" "}
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
              Covid, global gas shocks and market interventions make prices
              volatile. In our models, this shows up as{" "}
              <strong>a clear rejection of a single, stable gas–price
                relationship</strong> over 2015–2025. Break tests on the rolling
              gas pass-through pick out shifts clustered around 2022–23 across
              different window lengths: shorter windows see more stepping, but the
              regime change is robust.
            </p>

            <h3 style={{ marginTop: "1.25rem", fontSize: "1.2rem" }}>
              Phase 3: Weather and renewables in the driver’s seat (2023 onwards)
            </h3>
            <p>
              By the most recent years, the picture has flipped. In our variance
              decompositions, gas shocks explain only around{" "}
              <strong>2% of price variation</strong>, while renewables explain{" "}
              <strong>about 14–15%</strong> and imports a few percent more. The
              bulk – roughly four-fifths – is due to own-price shocks and other
              factors. In FEVD language, “other / own price” mostly captures shocks
              that hit electricity prices directly – policy shifts, bidding
              behaviour, outages or other market responses we haven’t modelled
              explicitly – plus the VAR’s mechanical own-shock term.
            </p>
            <p>
              In practical terms, gas hasn’t disappeared, but it has moved from the{" "}
              <em>centre</em> of price formation to the <em>periphery</em>. In a
              high-renewables, interconnected system, prices behave less like a pure
              gas market and more like a{" "}
              <strong>weather-driven, renewable-rich system</strong>.
            </p>
            <p>
              This is more than the familiar idea that “renewables push prices down”
              via the merit order. In our models, once we control for renewables,
              imports, demand and past prices, additional gas price movements
              explain only a small slice of remaining volatility – the gas–power
              link itself has weakened.
            </p>
          </div>
        </RevealSection>

        {/* VISUAL: ROLLING BETA */}
        <RevealSection sectionId="pass-through">
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
            6a. How the gas → power link weakened over time
          </h2>
          <p>
            The chart below tracks how much changes in gas prices flow through to
            power prices, month by month. Shaded bands line up with the three
            phases above. When the line hugs zero (and the shaded confidence band
            crosses zero), gas isn’t really moving electricity prices. Red dots
            mark short periods where gas and power even move in opposite
            directions. The quick read: gas clearly mattered in 2015–19, but in
            2023–25 the typical pass-through is close to zero.
          </p>
          <PassThroughNarrative
            phase1Avg={phase1Avg}
            phase2Avg={phase2Avg}
            phase3Avg={phase3Avg}
          />
          <div className="mt-4 full-bleed">
            <div className="wide-inner">
              <div className="w-full rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-4 shadow-[0_10px_40px_-32px_rgba(0,0,0,0.45)]">
                <RollingBetaChartClient
                  data={rollingBeta}
                  sectionId="pass-through"
                />
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
                  ? Math.max(10, (Math.abs(phase.avgBeta) / maxAbsRollingPhaseBeta) * 100)
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

        {/* VISUAL: FEVD NOW */}
        <RevealSection sectionId="fevd-now">
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
            6b. What actually drives prices now?
          </h2>
          <p>
            Over a two-year (24‑month) horizon in the most recent data, our FEVD
            results show that gas shocks account for only a small slice of price
            variation (around <strong>2%</strong>). Renewables explain roughly{" "}
            <strong>14–15%</strong>, imports a few percent more, and{" "}
            <span style={{ whiteSpace: "nowrap" }}>other / own price</span>{" "}
            dynamics about <strong>four‑fifths</strong>. The stacked bars make
            that plain: the big gray chunk is “other / own price”, the green slice
            is renewables, and the tiny amber slice is gas.
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

        {/* VISUAL: FEVD TREND OVER TIME */}
        <RevealSection sectionId="fevd-trend">
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
            6c. How drivers’ importance shifted
          </h2>
          <p>
            These panels show how each driver’s share of overall variance moves
            over time, not just at the two-year horizon above. Monthly FEVD
            shares for each driver show{" "}
            <span style={{ whiteSpace: "nowrap" }}>other / own price</span>{" "}
            dynamics dominating throughout, renewables rising over the decade, and
            gas small in the latest period after a mid-sample spike. The shaded
            background bands align with the three phases above. Panels run in
            story order (own-price → renewables → demand → imports → gas) and all
            share a 0–100% scale so you can compare at a glance.
          </p>
          <FEVDTrendNarrative />
          <div className="mt-4">
            <FEVDTrendStrip data={fevdTrend} sectionId="fevd-trend" />
          </div>
        </RevealSection>

        {/* BILLS */}
        <RevealSection sectionId="bills">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            7. Retail Impact
          </h2>
          <div className="detail-compact">
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>The key question for households and small businesses is what really moves their power bills now.</li>
              <li>Earlier in the decade, gas price spikes were a bigger part of the story.</li>
              <li>Today, bills are more exposed to weather, renewable output and how well the grid moves power around.</li>
              <li>Gas still matters in tight moments, but it is no longer the only thing to watch.</li>
            </ul>
          </div>
          <div className="detail-detailed">
            <p>
              For a household or small business, the core question is simple:
            </p>
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

        {/* POLICY */}
        <RevealSection sectionId="policy">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            8. Policy Implications
          </h2>
          <div className="detail-compact">
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>If prices are less tied to fuel costs, risk management has to focus more on weather, renewables and the grid.</li>
              <li>Gas hedging alone is no longer enough; flexible demand, storage and strong networks matter more.</li>
              <li>Policy that treats gas as the main villain or hero will explain less and less of what happens to bills.</li>
              <li>Future market design needs to reward flexibility, clean capacity and reliable connections as much as fuel supply.</li>
            </ul>
          </div>
          <div className="detail-detailed">
            <p>
              This shift has real consequences for hedging and market design.
              Hedging gas alone is no longer enough; weather, renewable generation
              and congestion risk now matter more for wholesale prices. Market
              participants increasingly need tools that manage{" "}
              <strong>scarcity and abundance risk</strong> – contracts linked to
              weather, flexible load, storage and interconnector availability, not
              just fuel.
            </p>
            <p>
              For policymakers, a weaker gas anchor means traditional fuel-cost
              narratives will explain less and less of what happens to bills.
              Pricing, reliability and transition policy need to account for a
              system where renewables, storage and networks drive scarcity events.
              Market signals should reward flexibility – storage, demand response
              and transmission – as well as fuel.
            </p>
            <p style={{ marginTop: "1rem" }}>
              The full working paper sets out the models and robustness checks in
              detail, including unit root tests, break tests and variance
              decompositions. This page is the accessible version of that story.
            </p>
          </div>
        </RevealSection>
      </main>
    </DetailModeProvider>
  );
}
