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

interface IState {
  alert?: IAlert;
  query?: MIP.API.IQuery;
}

class Container extends React.Component<IProps, IState> {
  public state: IState = {};

  public async componentDidMount() {
    const params = this.urlParams(this.props);
    if (!params) {
      return;
    }
    const { slug } = params;
    const { apiModel, apiMining } = this.props;

    await apiModel.one(slug);

    const model = apiModel.state.model;
    if (model) {
      const { query } = model;
      const payload: MIP.API.IExperimentMiningPayload = {
        covariables: query.coVariables ? query.coVariables : [],
        datasets: query.trainingDatasets ? query.trainingDatasets : [],
        filters: query.filters,
        grouping: query.groupings ? query.groupings : [],
        variables: query.variables ? query.variables : []
      };

      return apiMining.createAll({ payload });
    }

    return this.setState({ alert: { message: "Fail" } });
  }

  public render() {
    const { apiCore, apiModel, apiMining } = this.props;

    return (
      <div className="Experiment">
        <div className="content">
          <div className="sidebar">
            <Model model={apiModel.state.model} />
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
            <Content apiMining={apiMining} />
          </div>
        </div>
      </div>
    );
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
