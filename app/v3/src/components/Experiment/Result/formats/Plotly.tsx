import Plotly from 'plotly.js/dist/plotly-basic';
import * as React from 'react';
import createPlotlyComponent from 'react-plotlyjs';
const PlotlyComponent = createPlotlyComponent(Plotly);

export default ({ data, layout }: { data: any; layout: any }) => (
  <PlotlyComponent data={data} layout={layout} />
);
