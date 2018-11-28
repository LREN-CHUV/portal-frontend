import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as React from "react";

export default ({ options }: { options: any }) => (
  <HighchartsReact highcharts={Highcharts} options={options} />
);
