import { APICore, APIMining, APIModel } from "@app/components/API";
import { IAlert } from "@app/components/UI/Alert";
import Model from "@app/components/UI/Model";
import Validation from "@app/components/UI/Validation";
import { MIP } from "@app/types";
import { round } from "@app/utils";
import * as React from "react";
import { Panel } from "react-bootstrap";
import { RouteComponentProps, withRouter } from "react-router-dom";
import Content from "./Content";
import Filter from "./Filter";

import "./Review.css";
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
interface IComputeMiningResult {
  minings?: any[];
  selectedDatasets?: MIP.API.IVariableEntity[];
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

    return this.createMining();
  }

  public async componentDidUpdate(prevProps: IProps, prevState: IState) {
    const params = this.urlParams(this.props);
    const slug = params && params.slug;
    const prevParams = this.urlParams(prevProps);
    const prevSlug = prevParams && prevParams.slug;

    if (prevSlug !== slug && slug) {
      await this.loadModel({ slug });
    }

    return this.createMining();
  }

  public render() {
    const { apiCore, apiModel, apiMining } = this.props;
    const tableData = this.computeMiningResultToTable({
      minings: apiMining.state && apiMining.state.minings,
      selectedDatasets: this.state.query && this.state.query.trainingDatasets
    });

    const variables = apiCore.state.variables;
    const model = apiModel.state.model;
    const query = model && model.query;

    let fields: any[] = [];
    const buildFilter = (id: string) => {
      return (
        (variables &&
          query &&
          query[id] &&
          query[id].map((v: any) => {
            const code = v.code;
            const originalVar = variables.find(
              (variable: MIP.API.IVariableEntity) => variable.code === code
            );

            const output: any = originalVar
              ? {
                  id: v.code,
                  label: originalVar.label,
                  name: v.code
                }
              : {};

            if (originalVar && originalVar.enumerations) {
              output.values = originalVar.enumerations.map((c: any) => ({
                [c.code]: c.label
              }));
              output.input = "select";
              output.operators = ["equal", "not_equal", "in", "not_in"];
            }

            const type = originalVar && originalVar.type;
            if (type === "real") {
              output.type = "double";
              output.input = "number";
              output.operators = [
                "equal",
                "not_equal",
                "less",
                "greater",
                "between",
                "not_between"
              ];
            }

            if (type === "integer") {
              output.type = "integer";
              output.input = "number";
              output.operators = [
                "equal",
                "not_equal",
                "less",
                "greater",
                "between",
                "not_between"
              ];
            }

            return output;
          })) ||
        []
      );
    };
    fields = [].concat.apply(
      [],
      ["variables", "coVariables", "groupings"].map(buildFilter)
    );

    const filters =
      this.state.query &&
      this.state.query.filters &&
      JSON.parse(this.state.query.filters);

    return (
      <div className="Experiment Review">
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
              model={apiModel.state.model}
              selectedDatasets={
                this.state.query && this.state.query.trainingDatasets
              }
              tableData={tableData}
              handleRunAnalysis={this.handleRunAnalysis}
            >
              <Panel className="filters" defaultExpanded={false}>
                <Panel.Title toggle={true}>
                  <h3>Filters</h3>
                </Panel.Title>
                <Panel.Collapse>
                  <Panel.Body collapsible={true}>
                    {filters && fields && fields.length > 0 && (
                      <Filter
                        rules={filters}
                        filters={fields}
                        handleChangeFilter={this.handleChangeFilter}
                      />
                    )}
                  </Panel.Body>
                </Panel.Collapse>
              </Panel>
            </Content>
          </div>
        </div>
      </div>
    );
  }

  private handleChangeFilter = async (filters: string): Promise<boolean> => {
    const { apiModel } = this.props;
    const model = apiModel.state.model;
    if (model) {
      model.query.filters = JSON.stringify(filters);
    }
    await apiModel.update(model);
    this.createMining();

    return Promise.resolve(true);
  };

  private handleRunAnalysis = () => {
    const params = this.urlParams(this.props);
    const slug = params && params.slug;
    const { history } = this.props;
    history.push(`/v3/experiment/${slug}`);
  };

  private computeMiningResultToTable = ({
    minings,
    selectedDatasets
  }: IComputeMiningResult): any => {
    const computedRows: any[] = [];

    if (!minings) {
      return computedRows;
    }

    const datasetDatas = minings.map(
      dataset =>
        (dataset.data &&
          dataset.data &&
          dataset.data.length &&
          dataset.data.filter((r: any) => r.group && r.group[0] === "all")) ||
        []
    );

    const indexes =
      (datasetDatas.length && datasetDatas[0].map((d: any) => d.index)) || [];

    // populate each variable data by row
    const rows: any[] = [];
    indexes.map((index: any) => {
      const row: any = {};
      datasetDatas.map((datasetData: any, i: number) => {
        const dataRow = datasetData.find((d: any) => d.index === index) || {};
        row[i] = dataRow;
      });
      rows.push(row);
    });

    // compute rows data for output
    rows.map((row: any) => {
      const computedRow: any = {};
      const polynominalRows: any[] = [];
      let polynominalRow: any;

      Object.keys(row).map((rowKey: any) => {
        const col = row[rowKey];
        computedRow.variable = col.label;

        if (col.frequency) {
          computedRow[rowKey] = row[rowKey].count;
          Object.keys(col.frequency).map((k: any) => {
            polynominalRow = polynominalRows.find(p => p.variable === k);
            if (!polynominalRow) {
              polynominalRow = {};
              polynominalRows.push(polynominalRow);
            }
            polynominalRow[rowKey] = col.frequency[k];
            polynominalRow.variable = k;
          });
        } else {
          const mean = round(row[rowKey].mean, 2);
          const min = round(row[rowKey].min, 2);
          const max = round(row[rowKey].max, 2);
          const std = round(row[rowKey].std, 2);
          computedRow[rowKey] = mean
            ? `${mean} (${min}-${max}) - std: ${std}`
            : "-";
        }
      });

      computedRows.push(computedRow);
      polynominalRows.map((p: any) => {
        computedRows.push(p);
      });
    });

    return computedRows;
  };

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

  private createMining = async () => {
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
  };

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
