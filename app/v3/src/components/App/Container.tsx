import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import request from 'request-promise-native';
import { Provider, Subscribe } from 'unstated';

// import UNSTATED from 'unstated-debug';
import { APICore, APIExperiment, APIMining, APIModel, webURL } from '../API'; // as interfaces
import { Pathology } from '../API/Core';
import config from '../API/RequestHeaders';
import App from '../App/App';

// UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

interface State {
  appConfig: any;
}

class AppContainer extends React.Component<any, State> {
  public state: State = { appConfig: {} };
  private apiExperiment = new APIExperiment(config);
  private apiModel = new APIModel(config);
  private apiCore = new APICore(config);
  private apiMining = new APIMining(config);

  private intervalId: any; // FIXME: NodeJS.Timer | undefined;

  public async componentDidMount() {
    this.intervalId = setInterval(() => this.apiExperiment.all(), 10 * 1000);

    // Conf written by dockerize
    const json = await request.get(`${webURL}/scripts/app/config.json`);
    try {
      const appConfig = JSON.parse(json);
      this.setState({ appConfig });
    } catch (e) {
      const appConfig = {
        instanceName: 'MIP LOCAL',
        mode: 'local',
        theme: 'mip',
        version: 'alpha'
      };
      this.setState({ appConfig });
      console.log("Couldn't read config");
    }

    console.log(this.state.appConfig.mode);

    return await Promise.all([
      this.apiExperiment.all(),
      this.apiCore.datasets(),
      this.apiCore.setPathology(Pathology.DEG),
      this.apiCore.algorithms(this.state.appConfig.mode === 'local'),
      this.apiCore.stats(),
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
          ]}>
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
