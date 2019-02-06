import {
  APICore,
  APIExperiment,
  APIMining,
  APIModel
} from "@app/components/API"; // as interfaces
import { webURL } from "@app/components/API";
import config from "@app/components/API/RequestHeaders";
import App from "@app/components/App/App";
import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import request from "request-promise-native";
import { Provider, Subscribe } from "unstated";

// import UNSTATED from "unstated-debug";

// UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

interface IState {
  appConfig: any;
}

class AppContainer extends React.Component<any, IState> {
  public state: IState = { appConfig: {} };
  private apiExperiment = new APIExperiment(config);
  private apiModel = new APIModel(config);
  private apiCore = new APICore(config);
  private apiMining = new APIMining(config);

  private intervalId: NodeJS.Timer;

  public async componentWillMount() {
    this.intervalId = setInterval(() => this.apiExperiment.all(), 10 * 1000);

    // Conf written by dockerize
    const json = await request.get(`${webURL}/scripts/app/config.json`);
    try {
      const appConfig = JSON.parse(json);
      this.setState({ appConfig });
    } catch (e) {
      this.setState({
        appConfig: {
          instanceName: "MIP"
        }
      });
    }

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
        <Provider
          inject={[
            this.apiExperiment,
            this.apiCore,
            this.apiModel,
            this.apiMining
          ]}
        >
          <Subscribe to={[APIExperiment, APICore, APIModel, APIMining]}>
            {(
              apiExperiment: APIExperiment,
              apiCore: APICore,
              apiModel: APIModel,
              apiMining: APIMining
            ) => {
              return (
                <App
                  appConfig={this.state.appConfig}
                  apiExperiment={apiExperiment}
                  apiCore={apiCore}
                  apiModel={apiModel}
                  apiMining={apiMining}
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
