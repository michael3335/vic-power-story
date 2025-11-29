// app/page.tsx
import RevealSection from "./components/RevealSection";

export default function Home() {
  return (
    <main>
      {/* Hero / title */}
      <RevealSection>
        <p style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.18em" }}>
          Victoria · Wholesale Electricity · 2015–2025
        </p>
        <h1 style={{ fontSize: "2.4rem", marginTop: "1rem", marginBottom: "0.5rem" }}>
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

        <p style={{ marginTop: "1.25rem", fontSize: "0.95rem", color: "#555" }}>
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

      {/* The old story */}
      <RevealSection className="mt-16">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          1. The old story: gas in the driver’s seat
        </h2>
        <p>
          For years, the conventional wisdom in Australia’s electricity market
          was simple:
        </p>
        <p style={{ fontStyle: "italic", marginLeft: "1rem" }}>
          “If gas prices jump, electricity prices follow.”
        </p>
        <p>
          That view isn’t just folklore. Reputable outlets like the ABC and
          Guardian Australia, and official budget documents, routinely describe
          gas as the fuel that “sets the price” in the National Electricity
          Market. When gas sneezes, power prices catch a cold.
        </p>
        <p>
          Economically, this made sense. When demand was high and the grid
          needed extra supply, gas-fired generators were often the last, most
          expensive units dispatched. Because everyone is paid the price of
          that marginal unit, higher gas prices pushed up the wholesale
          electricity price.
        </p>
      </RevealSection>

      {/* What we did */}
      <RevealSection className="mt-12">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          2. What we did: follow the data, month by month
        </h2>
        <p>
          We assembled monthly data for Victoria from early 2015 to late 2025:
        </p>
        <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
          <li>wholesale electricity prices</li>
          <li>gas prices at the Wallumbilla gas hub</li>
          <li>the share of generation from renewables</li>
          <li>imports and exports between Victoria and other states</li>
          <li>demand, temperature and key global fuel prices</li>
        </ul>
        <p>
          On top of this, we applied well-established econometric tools:
        </p>
        <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
          <li>
            structural break tests to see if key relationships change over time,
          </li>
          <li>
            rolling models that track how the gas–electricity pass-through
            evolves month by month, and
          </li>
          <li>
            variance decompositions that attribute movements in prices to shocks
            in gas, renewables, imports and demand.
          </li>
        </ul>
        <p>
          You don’t need the equations to follow the story. The important part
          is that we ask the same question in several different, independent
          ways.
        </p>
      </RevealSection>

      {/* Three phases */}
      <RevealSection className="mt-12">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          3. Three phases of Victoria’s power market
        </h2>
        <p>
          When we line up the data with the model results, Victoria’s last
          decade looks like three broad phases.
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
          Renewables are growing, but in statistical terms they still explain
          only a modest share of price variation. Gas is central to price
          formation; renewables are supporting actors.
        </p>

        <h3 style={{ marginTop: "1.25rem", fontSize: "1.2rem" }}>
          Phase 2: Crisis and transition (around 2020–2022)
        </h3>
        <p>
          Then the world gets messy. Covid shifts demand patterns. Global gas
          markets tighten. The war in Ukraine and supply disruptions trigger a
          spike in international energy prices. The NEM goes through a period of
          extreme stress and market intervention.
        </p>
        <p>
          In our models, this shows up as{" "}
          <strong>clear structural breaks</strong> in the gas–price
          relationship. Formal tests reject the idea that the gas–electricity
          link is stable from 2015 to 2025. When we track the gas pass-through
          in rolling windows, we see it change noticeably around 2022–23.
        </p>

        <h3 style={{ marginTop: "1.25rem", fontSize: "1.2rem" }}>
          Phase 3: Weather and renewables in the driver’s seat (2023 onwards)
        </h3>
        <p>
          By the most recent years, the picture has flipped. In our variance
          decompositions, gas shocks explain only around{" "}
          <strong>2% of price variation</strong>, while renewables explain about{" "}
          <strong>14–15%</strong> and imports a few percent more. The bulk –
          roughly four-fifths – is due to own-price shocks and other factors.
        </p>
        <p>
          In practical terms: gas hasn’t disappeared, but it has moved from the{" "}
          <em>centre</em> of price formation to the{" "}
          <em>periphery</em>. In a high-renewables, interconnected system,
          prices behave less like a pure gas market and more like a{" "}
          <strong>weather-driven, renewable-rich system</strong>.
        </p>
      </RevealSection>

      {/* What this means for bills */}
      <RevealSection className="mt-12">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          4. What this means for bills
        </h2>
        <p>
          For a household or small business, the core question is simple:
          <br />
          <span style={{ fontStyle: "italic" }}>
            “What am I actually exposed to now?”
          </span>
        </p>
        <p>
          Earlier in the decade, a significant share of the risk in your
          electricity bill really was about gas. If international gas prices
          spiked, there was a good chance your power bill would feel it.
        </p>
        <p>
          Today, our analysis suggests that your bill is relatively{" "}
          <em>less</em> exposed to gas price shocks and{" "}
          <em>more</em> exposed to:
        </p>
        <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
          <li>weather and temperature, which drive demand,</li>
          <li>
            the availability of wind and solar, which shifts the supply curve,
          </li>
          <li>
            and the health of transmission and interconnectors, which govern
            imports and congestion.
          </li>
        </ul>
        <p>
          Gas still matters, especially for firming and peak periods, but the
          direct line from gas hubs to your power bill is weaker than it used to
          be.
        </p>
      </RevealSection>

      {/* Policy / risk management */}
      <RevealSection className="mt-12 mb-16">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          5. Policy, risk and the road ahead
        </h2>
        <p>
          This shift has real consequences for how we design markets and manage
          risk:
        </p>
        <ul style={{ marginLeft: "1.2rem", paddingLeft: 0 }}>
          <li>
            <strong>Hedging strategies need to evolve.</strong> Hedging gas
            prices alone is no longer enough. Weather risk, renewable generation
            risk and congestion risk now matter more for wholesale prices.
          </li>
          <li>
            <strong>Market signals must reward flexibility.</strong> In a
            system where prices swing between scarcity and abundance, storage,
            flexible demand and transmission are just as important as fuel.
          </li>
          <li>
            <strong>Public debate should catch up.</strong> We still often talk
            as if gas is always in the driver’s seat. The data suggest a more
            nuanced story: gas is now one actor in a larger ensemble that
            includes weather, renewables and the grid itself.
          </li>
        </ul>
        <p style={{ marginTop: "1rem" }}>
          The full working paper sets out the models and robustness checks in
          detail, including unit root tests, break tests and variance
          decompositions. This page is the accessible version of that story.
        </p>
      </RevealSection>
    </main>
  );
}