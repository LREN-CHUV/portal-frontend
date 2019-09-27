import * as React from 'react';
import ReactGA from 'react-ga';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import { Provider, Subscribe } from 'unstated';

// import UNSTATED from 'unstated-debug';
import {
  APICore,
  APIExperiment,
  APIMining,
  APIModel,
  APIUser,
  webURL
} from '../API'; // as interfaces
import config from '../API/RequestHeaders';
import App, { AppConfig, InstanceMode } from '../App/App';
import Splash from '../UI/Splash';

// UNSTATED.logStateChanges = process.env.NODE_ENV === "development";

interface State {
  appConfig: AppConfig;
}

class AppContainer extends React.Component<any, State> {
  public state: State = { appConfig: {} };
  private apiExperiment = new APIExperiment(config);
  private apiModel = new APIModel(config);
  private apiCore = new APICore(config);
  private apiMining = new APIMining(config);
  private apiUser = new APIUser(config);

  private intervalId: any; // FIXME: NodeJS.Timer | undefined;

  public async componentDidMount(): Promise<
    [void, void, void, void, void, void] | void
  > {
    if (process.env.NODE_ENV === 'production') {
      this.intervalId = setInterval(() => this.apiExperiment.all(), 10 * 1000);
    }

    // Conf written by dockerize
    const response = await fetch(`${webURL}/static/config.json`);
    try {
      const config = await response.json();
      const appConfig = {
        ...config,
        mode:
          config.mode === 'federation'
            ? InstanceMode.Federation
            : InstanceMode.Local
      };
      this.setState({ appConfig });

      if (appConfig.ga) {
        ReactGA.initialize(appConfig.ga);
      }
    } catch (e) {
      const appConfig: AppConfig = {
        instanceName: 'MIP DEV',
        mode: InstanceMode.Federation,
        version: 'alpha',
        galaxyAPIUrl: '',
        galaxyApacheUrl: 'http://ch.ch'
      };

      this.setState({ appConfig });
    }

    await this.apiUser.user();
    if (this.apiUser.state.authenticated) {
      return await Promise.all([
        this.apiExperiment.all(),
        this.apiCore.fetchPathologies(),
        this.apiCore.algorithms(
          this.state.appConfig.mode === InstanceMode.Local
        ),
        this.apiCore.stats(),
        this.apiCore.articles(),
        this.apiModel.all()
      ]);
    }

    return Promise.resolve();
  }

  public componentWillUnmount(): void {
    clearInterval(this.intervalId);
  }

  public render(): JSX.Element {
    return (
      <Router>
        <Provider
          inject={[
            this.apiExperiment,
            this.apiCore,
            this.apiModel,
            this.apiMining,
            this.apiUser
          ]}
        >
          <Subscribe
            to={[APIExperiment, APICore, APIModel, APIMining, APIUser]}
          >
            {(
              apiExperiment: APIExperiment,
              apiCore: APICore,
              apiModel: APIModel,
              apiMining: APIMining,
              apiUser: APIUser
            ): JSX.Element => {
              return (
                <>
                  <Route
                    // Callback from the auth server, redirected to the API
                    path="/services/login/hbp"
                    // tslint:disable-next-line jsx-no-lambda
                    render={(props): JSX.Element => {
                      const {
                        location: { search }
                      } = props;
                      apiUser.login(search);

                      return <div />;
                    }}
                  />
                  {!apiUser.state.authenticated && <Splash />}
                  {apiUser.state.authenticated && (
                    <App
                      appConfig={this.state.appConfig}
                      apiExperiment={apiExperiment}
                      apiCore={apiCore}
                      apiModel={apiModel}
                      apiMining={apiMining}
                      apiUser={apiUser}
                    />
                  )}
                </>
              );
            }}
          </Subscribe>
        </Provider>
      </Router>
    );
  }
}

export default AppContainer;
