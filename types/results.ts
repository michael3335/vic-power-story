export type RollingBetaPoint = {
  date: string; // "YYYY-MM"
  beta: number; // gas_elasticity
  lower: number; // lower_95
  upper: number; // upper_95
  window_ren_share?: number;
};

export type FEVDFullRow = {
  horizon: number; // typically 24
  Gas: number; // share at that horizon
  Demand: number;
  Renewables: number;
  Imports: number;
  Own: number;
};

export type FEVDTrendPoint = {
  period: string; // e.g. "2020-03" (YYYY-MM)
  Gas: number;
  Demand: number;
  Renewables: number;
  Imports: number;
  Own: number;
};

export type RenSharePoint = {
  date: string; // "YYYY-MM"
  ren_share: number; // share of generation in [0,1]
};

export type ModelReadyPoint = {
  date: string; // "YYYY-MM-DD"
  price: number; // electricity price (AUD/MWh, volume weighted)
  gas: number; // gas price (AUD/GJ, volume weighted)
  ren_share: number; // share of generation in [0,1]
};

// Events/markers to annotate the rolling beta chart
export type ChartEvent =
  | {
      kind: "range";
      x1: string; // YYYY-MM
      x2: string; // YYYY-MM
      label: string;
      fill?: string;
      fillOpacity?: number;
    }
  | {
      kind: "point";
      x: string; // YYYY-MM
      label: string;
      stroke?: string;
      strokeDasharray?: string;
    };
