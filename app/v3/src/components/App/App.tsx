import 'bootstrap/dist/css/bootstrap.css';
// tslint:disable jsx-no-lambda
import * as React from 'react';
import { Route } from 'react-router-dom';
import { APICore, APIExperiment, APIMining, APIModel } from '../API';
import ExperimentCreate from '../Experiment/Create/Container';
import ExperimentResult from '../Experiment/Result/Container';
import Explore from '../Model/Explore/Container';
import ExperimentReview from '../Model/Review/Container';
import Footer from '../UI/Footer';
import Navigation from '../UI/Navigation';
import './App.css';

interface Props {
  appConfig: any;
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  apiMining: APIMining;
}

const App = ({
  appConfig,
  apiExperiment,
  apiCore,
  apiModel,
  apiMining
}: Props) => (
  <div className='App'>
    <header>
      <Navigation
        apiExperiment={apiExperiment}
        apiModel={apiModel}
        appConfig={appConfig}
      />
    </header>
    <section className='main-content'>
      <Route
        path={['/v3/explore/:slug', '/v3/explore']}
        render={() => (
          <Explore
            apiCore={apiCore}
            apiMining={apiMining}
            apiModel={apiModel}
          />
        )}
      />
      <Route
        path='/v3/review'
        render={() => (
          <ExperimentReview
            apiMining={apiMining}
            apiModel={apiModel}
            apiCore={apiCore}
          />
        )}
      />
      <Route
        path='/v3/experiment/:slug/:uuid'
        render={() => (
          <ExperimentResult
            apiExperiment={apiExperiment}
            apiModel={apiModel}
            apiCore={apiCore}
          />
        )}
      />
      <Route
        exact={true}
        path='/v3/experiment/:slug'
        render={() => (
          <ExperimentCreate
            apiExperiment={apiExperiment}
            apiCore={apiCore}
            apiModel={apiModel}
            appConfig={appConfig}
          />
        )}
      />
    </section>
    <footer id='footer'>
      <Footer appConfig={appConfig} />
    </footer>
  </div>
);

export default App;
