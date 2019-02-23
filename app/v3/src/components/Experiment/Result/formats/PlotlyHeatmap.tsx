import Plotly from 'plotly.js/lib/core';
import heatmap from 'plotly.js/lib/heatmap';
import * as React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

Plotly.register([heatmap]);
const PlotlyComponent = createPlotlyComponent(Plotly);

export default ({ data, layout }: { data: any; layout: any }) => (
  <PlotlyComponent data={data} layout={layout} />
);
