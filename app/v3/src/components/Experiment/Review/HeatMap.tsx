import { access } from 'fs';
import * as React from 'react';
import { MIP } from '../../../types';
import { APIMining } from '../../API';
import { Alert } from '../../UI/Alert';
import Loader from '../../UI/Loader';
import { PlotlyHeatmap } from '../Result/formats/';

interface IProps {
  apiMining: APIMining;
  model?: MIP.API.IModelResponse;
}

interface IState {
  loading: boolean;
  datasets?: any;
}

class HeatMap extends React.Component<IProps, IState> {
  public state: IState;

  constructor(props: IProps) {
    super(props);
    this.state = { loading: false };
  }

  public componentWillReceiveProps() {
    const { model, apiMining } = this.props;
    const query = model && model.query;
    const datasets =
      query && query.trainingDatasets && query.trainingDatasets.sort();
    const previousDatasets = this.state.datasets;

    if (
      !this.state.loading &&
      datasets &&
      query &&
      JSON.stringify(datasets) !== JSON.stringify(previousDatasets)
    ) {
      this.createMining(query, datasets, apiMining);
    }
  }

  public render = () => {
    const { apiMining } = this.props;
    const heatmaps = apiMining.state.heatmaps;
    const error = apiMining.state.error;
    const loading =
      error !== undefined &&
      heatmaps !== undefined &&
      heatmaps.map(h => h.data).includes(undefined);

    return (
      <div style={{ padding: '8px' }}>
        <Loader visible={loading} />
        {error && <Alert message={error} title={'Error'} />}
        {heatmaps &&
          heatmaps.map((h: MIP.Store.IMiningResponseShape, i: number) => {
            return (
              <div className='heatmap' key={i}>
                <h3>{heatmaps.length > 1 && h.dataset && h.dataset.code}</h3>
                <PlotlyHeatmap
                  data={h.data}
                  layout={{
                    autosize: true,
                    height: 400,
                    margin: {
                      l: 0
                    },
                    width: 600
                  }}
                  key={`${i}`}
                />
              </div>
            );
          })}
      </div>
    );
  };

  private createMining = async (query: any, datasets: any, apiMining: any) => {
    this.setState({ loading: true });
    const payload: MIP.API.IMiningPayload = {
      covariables: query.coVariables ? query.coVariables : [],
      datasets,
      filters: query.filters,
      grouping: query.groupings ? query.groupings : [],
      variables: query.variables ? query.variables : []
    };
    await apiMining.heatmaps({ payload });
    await this.setState({
      datasets: datasets.sort(),
      loading: false
    });
  };
}

export default HeatMap;
