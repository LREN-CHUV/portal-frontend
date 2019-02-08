import Loader from "@app/components/UI/Loader";
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

const Boxplot = ({ miningState }: IProps) => {
  const minings = (miningState && miningState.minings) || [];
  const loading = minings.map(m => !m.error && !m.data).every(m => m);
  const error = minings.map(m => m.error);

  const findData = (miningz: MIP.Store.IMiningResponseShape[]) => {
    const data: any[] = [];
    miningz.forEach(m => {
      const d =
        m.data &&
        m.data.data &&
        m.data.data.filter(
          (r: any) =>
            r.group &&
            r.count !== 0 &&
            r.type !== "polynominal" && 
            (r.group[0] === "all" || r.group[0] !== "all")
        );
      // tslint:disable

      d &&
        d.forEach((e: any) => {
          e.dataset = m.dataset.code;
          data.push(e);
        });
      // tslint:enable
    });

    return data;
  };

  const filtered = findData(minings);
  const flattened = filtered.reduce((a, i) => [...a, ...i], []);
  const uniqueVariables =
    flattened && Array.from(new Set(flattened.map((f: any) => f.index)));

  const highchartsOptions: any[] = uniqueVariables.map((v: any) => {
    const uniqueMinings = flattened.filter((f: any) => f.index === v);
    const data = uniqueMinings.map((u: any) => [
      u.min,
      u["25%"],
      u["50%"],
      u["75%"],
      u.max
    ]);
    const categories = uniqueMinings.map(
      (u: any, i: number) => `${u.dataset}-${u.group.join("-")}`
    );
    const name = Array.from(new Set(uniqueMinings.map((f: any) => f.label)))[0];
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
        categories,
        title: null
      },
      yAxis: {
        title: null
      }
    };
  });

  return (
    <div>
      {loading && <Loader />}
      {error && <div>{error}</div>}
      {highchartsOptions.map((options: any, k: number) => (
        <HighchartsReact highcharts={Highcharts} options={options} key={k} />
      ))}
    </div>
  );
};
export default Boxplot;
