import { MIP } from "@app/types";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import addHighchartsMore from "highcharts/highcharts-more";
import * as React from "react";

addHighchartsMore(Highcharts);

interface IProps {
  miningState?: MIP.Store.IMiningState;
  selectedDatasets?: MIP.API.IVariableEntity[];
}

const Boxplot = ({ miningState, selectedDatasets }: IProps) => {
  const minings = (miningState && miningState.minings) || [];
  const filteredByGroupAll = minings.map((mining: any) =>
    mining.data.filter((d: any) => d.mean && d.group[0] === "all")
  );
  const flattened: any = [].concat.apply([], filteredByGroupAll);
  const uniqueVariables = Array.from(
    new Set(flattened.map((f: any) => f.index))
  );

  const highchartsOptions = uniqueVariables.map((v: any) => {
    const uniqueMinings = flattened.filter((f: any) => f.index === v);
    const data = uniqueMinings.map((u: any) => [
      u.min,
      u["25%"],
      u["50%"],
      u["75%"],
      u.max
    ]);
    const name = Array.from(
      new Set(uniqueMinings.map((f: any) => f.label))
    )[0];
    return {
      chart: {
        type: "boxplot"
      },
      series: [
        {
          data,
          name
        }
      ],
      title: null,
      xAxis: {
        categories: data,
        title: null
      },
      yAxis: {
        title: null
      }
    };
  });

  return (
    <div>
      {highchartsOptions.map((options: any, k: number) => (
        <HighchartsReact highcharts={Highcharts} options={options} key={k}/>
      ))}
    </div>
  );
};
export default Boxplot;
