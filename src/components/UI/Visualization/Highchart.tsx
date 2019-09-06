// FIXME: implement Code Splitting https://facebook.github.io/create-react-app/docs/code-splitting
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d';
import HCMore from 'highcharts/highcharts-more';
import Exporting from 'highcharts/modules/exporting.js';
import Heatmap from 'highcharts/modules/heatmap.js';
import SeriesLabel from 'highcharts/modules/series-label.js';
import * as React from 'react';

HCMore(Highcharts);
Heatmap(Highcharts);
highcharts3d(Highcharts);
Exporting(Highcharts);
SeriesLabel(Highcharts);

export default ({ options }: { options: any }) => (
  <HighchartsReact highcharts={Highcharts} options={options} />
);
