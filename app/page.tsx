import fs from "fs/promises";
import path from "path";
import RevealSection from "./components/RevealSection";
import RollingBetaChartClient from "./components/RollingBetaChartClient";
import FEVDNowChartTableClient from "./components/FEVDNowChartTableClient";
import FEVDTrendStrip from "./components/FEVDTrendStrip";
import BillSensitivityTable from "./components/BillSensitivityTable";
import type { RollingBetaPoint, FEVDFullRow, FEVDTrendPoint } from "@/types/results";

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

  const [rollingBeta, fevdDemandFirstArr, fevdRenFirstArr, fevdTrend] =
    await Promise.all([
      safeRead<RollingBetaPoint[]>("rolling_beta.json"),
      safeRead<FEVDFullRow[]>("fevd_full_demand_first.json"),
      safeRead<FEVDFullRow[]>("fevd_full_ren_first.json"),
      safeRead<FEVDTrendPoint[]>("fevd_trend.json"),
    ]);

  return {
    rollingBeta: rollingBeta ?? [],
    fevdDemandFirst: fevdDemandFirstArr?.[0] ?? null,
    fevdRenFirst: fevdRenFirstArr?.[0] ?? null,
    fevdTrend: fevdTrend ?? [],
  };
}

export default async function Home() {
  const { rollingBeta, fevdDemandFirst, fevdRenFirst, fevdTrend } =
    await getWebData();
  const publishedDate = "30 Nov 2025";

  return (
    <main>
      {/* HERO */}
      <RevealSection>
        <p
          style={{
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
          }}
        >
          Victoria · Wholesale Electricity · 2015–2025
        </p>
        <p
          style={{
            marginTop: "0.35rem",
            fontSize: "0.85rem",
            color: "#666",
          }}
        >
          {publishedDate}
        </p>
        <h1
          style={{
            fontSize: "2.4rem",
            marginTop: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          When gas sneezes, power prices catch a cold.
        </h1>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 400,
            color: "#444",
            maxWidth: "36rem",
          }}
        >
          This used to be the story of Victoria’s power market. Our data shows
          that story is breaking down.
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
          contribute to Victorian wholesale electricity prices, and how that
          mix has changed over time.
        </p>

        <div style={{ marginTop: "1.75rem" }}>
          <a
            href="https://example.com/working-paper.pdf" // TODO: replace with real link
            style={{
              display: "inline-block",
              padding: "0.75rem 1.25rem",
              borderRadius: "999px",
              border: "1px solid #111",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Download full working paper (PDF)
          </a>
        </div>
      </RevealSection>

      {/* EXEC SUMMARY */}
      <RevealSection>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          Executive summary: what changed?
        </h2>
        <p>
          For most of the last decade, Victorian wholesale electricity prices
          largely mirrored fossil fuel input costs, especially gas at the
          margin. This work asks whether that link has structurally weakened as
          renewables, storage and interconnection have grown.
        </p>
        <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
          <li>
            Across structural break tests, rolling models and VAR/FEVD analysis,
            we find a clear regime shift: gas has moved from the{" "}
            <em>centre</em> of price formation towards the <em>periphery</em>.
          </li>
          <li>
            In early years (2015–2019), gas shocks explain a meaningful share of
            wholesale price variation; in the most recent data, at a two-year
            (24‑month) horizon they explain only around <strong>2%</strong> of
            price variance, while renewables explain <strong>~14–15%</strong>,
            imports a few percent more, and &ldquo;other / own price&rdquo;
            dynamics around <strong>four‑fifths</strong>.
          </li>
          <li>
            Weather and extreme events matter on both the demand side
            (heatwaves, cold snaps) and the supply side (wind and solar output,
            outages and congestion). These drivers now shape bills more than
            global gas, coal or oil shocks.
          </li>
          <li>
            Econometrically, we see no stable long-run cointegrating
            relationship tying electricity prices tightly to gas, renewables or
            demand, and robust shifts in the gas → power pass-through around
            2022–23.
          </li>
          <li>
            The market has moved from a{" "}
            <strong>fuel-cost regime</strong> (“what does gas cost?”) to a{" "}
            <strong>scarcity and abundance regime</strong> (“how tight is the
            system given weather, renewables and transmission?”).
          </li>
        </ul>
        <p>
          The sections below unpack this story for a general policy audience.
          The working paper provides the full econometric detail for specialists.
        </p>
      </RevealSection>

      {/* OLD STORY */}
      <RevealSection>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          1. The old story: gas in the driver’s seat
        </h2>
        <p>
          For most of the last decade, the dominant story in Australia’s
          electricity debate has been simple:
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
          Independent analysts make the same connection. In a widely cited
          piece on high power bills, IEEFA notes that{" "}
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
          Put together, these sources reinforce a clear, current picture: in the
          standard narrative, <b>gas still sits at the centre of price
            formation</b>, with renewables and weather playing supporting roles at
          the margins. The rest of this page tests that story directly using
          Victorian data from 2015–2025 — and shows how, in a high-renewables,
          interconnected system, that gas–power link has fundamentally changed.
        </p>
      </RevealSection>

      {/* BACKGROUND */}
      <RevealSection>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          2. Victoria’s market in brief
        </h2>
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
      </RevealSection>

      {/* METHODS */}
      <RevealSection>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          3. What we did: follow the data, month by month
        </h2>
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
      </RevealSection>

      {/* PHASES */}
      <RevealSection>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          4. Three phases of Victoria’s power market
        </h2>
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
          factors.
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
      </RevealSection>

      {/* VISUAL: ROLLING BETA */}
      <RevealSection>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
          4a. How the gas → power link weakened over time
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
        <div className="mt-4 full-bleed">
          <div className="wide-inner">
            <RollingBetaChartClient data={rollingBeta} />
          </div>
        </div>
      </RevealSection>

      {/* VISUAL: FEVD NOW */}
      <RevealSection>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
          4b. What actually drives prices now?
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
        <div className="mt-4 full-bleed">
          <div className="wide-inner">
            <FEVDNowChartTableClient
              demandFirst={fevdDemandFirst}
              renFirst={fevdRenFirst}
            />
          </div>
        </div>
      </RevealSection>

      {/* VISUAL: FEVD TREND OVER TIME */}
      <RevealSection>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
          4c. How drivers’ importance shifted
        </h2>
        <p>
          Monthly FEVD shares for each driver show{" "}
          <span style={{ whiteSpace: "nowrap" }}>other / own price</span>{" "}
          dynamics dominating throughout, renewables rising over the decade, and
          gas small in the latest period after a mid‑sample spike. The shaded
          background bands align with the three phases above. Panels run in
          story order (own-price → renewables → demand → imports → gas) and all
          share a 0–100% scale so you can compare at a glance.
        </p>
        <div className="mt-4 full-bleed">
          <div className="wide-inner">
            <FEVDTrendStrip data={fevdTrend} />
          </div>
        </div>
      </RevealSection>

      {/* BILLS */}
      <RevealSection>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          5. What this means for bills
        </h2>
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
        <BillSensitivityTable demandFirst={fevdDemandFirst} renFirst={fevdRenFirst} />
      </RevealSection>

      {/* POLICY */}
      <RevealSection>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          6. Policy, risk and the road ahead
        </h2>
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
      </RevealSection>
    </main>
  );
}
