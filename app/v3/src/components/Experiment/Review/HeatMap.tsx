import { APIMining } from "../../API";
import Plotly from "../../Experiment/Result/formats/Plotly";
import { Alert } from "../../UI/Alert";
import Loader from "../../UI/Loader";
import { MIP } from "../../../types";
import * as React from "react";

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
    const heatmap = apiMining.state.heatmap;
    const data = heatmap && heatmap.data && heatmap.data.data;
    const error = heatmap && heatmap.error;

    return (
      <div style={{ padding: "16px" }}>
        <Loader visible={!error && !data} />
        {error && <Alert message={error} title={"Error"} />}
        {!error &&
          data &&
          data.map(
            (d: any, i: number) =>
              d && (
                <Plotly data={[d]} layout={{ margin: { l: 0 } }} key={`${i}`} />
              )
          )}
      </div>
    );
  };

  private createMining = async (query: any, datasets: any, apiMining: any) => {
    this.setState({ loading: true });
    const payload: MIP.API.IMiningPayload = {
      algorithm: {
        code: "correlationHeatmap",
        name: "Correlation heatmap",
        parameters: [],
        validation: false
      },
      covariables: query.coVariables ? query.coVariables : [],
      datasets,
      filters: query.filters,
      grouping: query.groupings ? query.groupings : [],
      variables: query.variables ? query.variables : []
    };
    await apiMining.one({ payload });
    await this.setState({
      datasets: datasets.sort(),
      loading: false
    });
  };
}

export default HeatMap;
