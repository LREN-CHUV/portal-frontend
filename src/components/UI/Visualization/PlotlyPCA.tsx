import bar from 'plotly.js/lib/bar';
import Plotly from 'plotly.js/lib/core';
import scatter from 'plotly.js/lib/scatter';
import * as React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

Plotly.register([scatter, bar]);
const PlotlyComponent = createPlotlyComponent(Plotly);

export default ({ data }: { data: any; layout: any }): JSX.Element =>
  data.map((d: any, i: number) => (
    <PlotlyComponent data={d.data} layout={d.layout} key={i} />
  ));
