import { APIMining } from "@app/components/API";
import Plotly from "@app/components/Experiment/Result/formats/Plotly";
import Loader from "@app/components/UI/Loader";
import { MIP } from "@app/types";
import * as React from "react";

interface IProps {
  apiMining: APIMining;
  model?: MIP.API.IModelResponse;
}

interface IState {
  heatmap?: any;
  loading: boolean;
}

class HeatMap extends React.Component<IProps, IState> {
  public state = { loading: false, heatmap: [] };

  public componentWillReceiveProps() {
    if (this.state.heatmap.length === 0 && !this.state.loading) {
      this.createMining();
    }
  }

  public render = () => (
    <div>
      {this.state.loading && <Loader />}
      <Plotly data={this.state.heatmap} layout={{ margin: { l: 400 } }} />
    </div>
  );

  private createMining = async () => {
    const { model, apiMining } = this.props;
    const query = model && model.query;
    const datasets = query && query.trainingDatasets;

    if (datasets && query) {
      this.setState({ loading: true });
      const payload: MIP.API.IExperimentMiningPayload = {
        covariables: query.coVariables ? query.coVariables : [],
        datasets,
        filters: query.filters,
        grouping: query.groupings ? query.groupings : [],
        variables: query.variables ? query.variables : []
      };

      await apiMining.heatmap({ payload });
      await this.setState({
        heatmap: apiMining.state.heatmap,
        loading: false
      });
    }
  };
}

export default HeatMap;
