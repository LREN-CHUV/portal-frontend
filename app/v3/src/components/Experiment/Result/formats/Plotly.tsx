import * as React from "react";
import Plot from "react-plotly.js";

export default ({ data, layout }: { data: any; layout: any }) => (
  <Plot data={data} layout={layout} />
);
