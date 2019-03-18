import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d';
import HC_more from 'highcharts/highcharts-more';
import * as React from 'react';

HC_more(Highcharts);
highcharts3d(Highcharts);

export default ({ options }: { options: any }) => (
  <HighchartsReact highcharts={Highcharts} options={options} />
);
