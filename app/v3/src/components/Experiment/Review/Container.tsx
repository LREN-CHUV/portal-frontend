import { APICore, APIMining, APIModel } from "@app/components/API";
import { IAlert } from "@app/components/UI/Alert";
import Model from "@app/components/UI/Model";
import Validation from "@app/components/UI/Validation";
import { MIP } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import Content from "./Content";

interface IProps extends RouteComponentProps<any> {
  apiModel: APIModel;
  apiCore: APICore;
  apiMining: APIMining;
}

let loading = false;

interface IState {
  alert?: IAlert;
  query?: MIP.API.IQuery;
  mining?: any;
}

class Container extends React.Component<IProps, IState> {
  public state: IState = {};

  public async componentDidMount() {
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { slug } = params;
    await this.loadModel({ slug });

    return this.loadData()
  }

  public async componentDidUpdate(prevProps: IProps, prevState: IState) {
    const params = this.urlParams(this.props);
    const slug = params && params.slug;
    const prevParams = this.urlParams(prevProps);
    const prevSlug = prevParams && prevParams.slug;

    if (prevSlug !== slug && slug) {
      await this.loadModel({ slug });
    }

    return this.loadData()
  }

  public render() {
    const { apiCore, apiModel, apiMining } = this.props;

    return (
      <div className="Experiment">
        <div className="content">
          <div className="sidebar">
            <Model model={apiModel.state.model} showDatasets={false} />
            <Panel className="model">
              <Panel.Body>
                <Validation
                  isPredictiveMethod={false}
                  datasets={apiCore.state.datasets}
                  query={this.state.query}
                  handleUpdateQuery={this.handleUpdateQuery}
                />
              </Panel.Body>
            </Panel>
          </div>
          <div className="results">
            <Content
              apiMining={apiMining}
              selectedDatasets={
                this.state.query && this.state.query.trainingDatasets
              }
            />
          </div>
        </div>
      </div>
    );
  }

  private loadModel = async ({ slug }: { slug: string }) => {
    const { apiModel } = this.props;
    await apiModel.one(slug);

    const model = apiModel.state.model;
    if (!model) {
      return this.setState({ alert: { message: "Fail to load model" } });
    }

    const { query } = model;
    return this.setState({ query });
  };

  private loadData = async () => {
    const { apiCore, apiMining } = this.props;
    const datasets = apiCore.state.datasets;
    const query = this.state.query;
    
    if (datasets && query && !loading) {
      loading = true;
      const payload: MIP.API.IExperimentMiningPayload = {
        covariables: query.coVariables ? query.coVariables : [],
        datasets,
        filters: query.filters,
        grouping: query.groupings ? query.groupings : [],
        variables: query.variables ? query.variables : []
      };

      await apiMining.createAll({ payload });
      return this.setState({ mining: apiMining.state.minings });
    }
  }

  private handleUpdateQuery = (query: MIP.API.IQuery): void => {
    this.setState({ query });
  };

  private urlParams = (
    props: IProps
  ):
    | {
        slug: string;
      }
    | undefined => {
    const { match } = props;
    if (!match) {
      return;
    }
    return match.params;
  };
}

export default withRouter(Container);
