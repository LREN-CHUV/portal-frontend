import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import addHighchartsMore from 'highcharts/highcharts-more';
import * as React from 'react';

import { MIP } from '../../../types';
import { VariableEntity } from '../../API/Core';
import { MiningResponseShape } from '../../API/Mining';
import { Alert } from '../../UI/Alert';
import Loader from '../../UI/Loader';

addHighchartsMore(Highcharts);

interface Props {
  miningState?: MIP.Store.IMiningState;
  selectedDatasets?: VariableEntity[];
}

const Boxplot = ({ miningState }: Props) => {
  const minings = (miningState && miningState.summaryStatistics) || [];
  const loading = minings.map(m => !m.error && !m.data).every(m => m);
  const error = minings.map(m => m.error);
  const filtered = minings.reduce(
    (acc: MiningResponseShape[], m: MiningResponseShape) => [
      ...acc,
      ...((m.data &&
        m.data.data &&
        m.data.data
          .filter(
            (r: any) =>
              r.group &&
              r.count !== 0 &&
              r.type !== 'polynominal' &&
              r.type !== 'binominal' &&
              (r.group[0] === 'all' || r.group[0] !== 'all')
          )
          .map((e: any) => ({ ...e, dataset: m.dataset && m.dataset.code }))) ||
        [])
    ],
    []
  );

  const uniqueVariables =
    filtered && Array.from(new Set(filtered.map((f: any) => f.index)));

  const highchartsOptions: any[] = uniqueVariables.map((v: any) => {
    const uniqueMinings = filtered.filter((f: any) => f.index === v);
    const data = uniqueMinings.map((u: any) => [
      u.min,
      u['25%'],
      u['50%'],
      u['75%'],
      u.max
    ]);
    const categories = uniqueMinings.map(
      (u: any, i: number) => `${u.dataset}-${u.group.join('-')}`
    );
    const name = Array.from(new Set(uniqueMinings.map((f: any) => f.label)))[0];
    return {
      chart: {
        type: 'boxplot'
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
      <Loader />
      {error &&
        error.map((e, i) => <Alert message={e} title={'Error'} key={`${i}`} />)}
      {highchartsOptions.map((options: any, k: number) => (
        <HighchartsReact highcharts={Highcharts} options={options} key={k} />
      ))}
    </div>
  );
};
export default Boxplot;
