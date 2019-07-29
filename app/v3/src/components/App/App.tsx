import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

import * as React from 'react';
import { Route } from 'react-router-dom';

import { APICore, APIExperiment, APIMining, APIModel, APIUser } from '../API';
import Article from '../Article/Container';
import ExperimentCreate from '../Create/Container';
import Explore from '../Explore/Container';
import Home from '../Home/Home';
import ExperimentResult from '../Result/Container';
import ExperimentReview from '../Review/Container';
import Footer from '../UI/Footer';
import Navigation from '../UI/Navigation';
import User from '../User/Container';

interface Props {
  appConfig: any;
  apiExperiment: APIExperiment;
  apiCore: APICore;
  apiModel: APIModel;
  apiMining: APIMining;
  apiUser: APIUser;
}

const App = ({
  appConfig,
  apiExperiment,
  apiCore,
  apiModel,
  apiMining,
  apiUser
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
        path='/v3/home'
        // tslint:disable-next-line jsx-no-lambda
        render={props => (
          <Home
            apiCore={apiCore}
            apiModel={apiModel}
            apiExperiment={apiExperiment}
            apiUser={apiUser}
            {...props}
          />
        )}
      />
      <Route
        path='/v3/profile'
        // tslint:disable-next-line jsx-no-lambda
        render={props => <User apiUser={apiUser} {...props} />}
      />
      <Route
        path={['/v3/explore/:slug', '/v3/explore']}
        // tslint:disable-next-line jsx-no-lambda
        render={props => (
          <Explore
            apiCore={apiCore}
            apiMining={apiMining}
            apiModel={apiModel}
            appConfig={appConfig}
            {...props}
          />
        )}
      />
      <Route
        path={['/v3/review/:slug', '/v3/review']}
        // tslint:disable-next-line jsx-no-lambda
        render={props => (
          <ExperimentReview
            apiMining={apiMining}
            apiModel={apiModel}
            apiCore={apiCore}
            {...props}
          />
        )}
      />
      <Route
        path='/v3/experiment/:slug/:uuid'
        // tslint:disable-next-line jsx-no-lambda
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
        // tslint:disable-next-line jsx-no-lambda
        render={() => (
          <ExperimentCreate
            apiExperiment={apiExperiment}
            apiCore={apiCore}
            apiModel={apiModel}
            appConfig={appConfig}
          />
        )}
      />
      <Route
        exact={true}
        path='/v3/articles/'
        // tslint:disable-next-line jsx-no-lambda
        render={() => (
          <Article
          // apiExperiment={apiExperiment}
          // apiCore={apiCore}
          // apiModel={apiModel}
          // appConfig={appConfig}
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
