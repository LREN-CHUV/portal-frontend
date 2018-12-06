import { APICore, APIExperiment, APIModel } from "@app/components/API"; // as interfaces
import App from "@app/components/App/App";
import config from "@app/config";
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider, Subscribe } from "unstated";
import UNSTATED from "unstated-debug";

UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

class AppContainer extends React.Component {
  private apiExperiment = new APIExperiment(config);
  private apiModel = new APIModel(config);
  private apiCore = new APICore(config);

  private intervalId: NodeJS.Timer;

  public async componentWillMount() {
    this.intervalId = setInterval(() => this.apiExperiment.all(), 10 * 1000);

    return await Promise.all([
      this.apiExperiment.all(),
      this.apiCore.variables(),
      this.apiCore.datasets(),
      this.apiCore.methods(),
      this.apiModel.all()
    ]);
  }

  public componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  public render() {
    return (
      <Router>
        <Provider inject={[this.apiExperiment, this.apiCore, this.apiModel]}>
          <Subscribe to={[APIExperiment, APICore, APIModel]}>
            {(
              apiExperiment: APIExperiment,
              apiCore: APICore,
              apiModel: APIModel
            ) => {
              return (
                <App
                  apiExperiment={apiExperiment}
                  apiCore={apiCore}
                  apiModel={apiModel}
                />
              );
            }}
          </Subscribe>
        </Provider>
      </Router>
    );
  }
}

export default AppContainer;
