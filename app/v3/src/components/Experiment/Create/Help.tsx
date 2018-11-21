import * as React from "react";

const Help = () => (
  <React.Fragment>
    <p>
      An experiment is a set of algorithm(s) and their configuration applied to
      the variables already selected. You may choose same algorithms more than
      once providing that you change the configuration parameters.
    </p>
    <p>You can design your own MIP Experiment by doing the following:</p>
    <ol>
      <li>Select an algorithms on the right</li>
      <li>If required, configure parameters (e.g. "k")</li>
      <li>Give a name to the Experiment</li>
      <li>
        Select your k-fold Validation (to be applied to predictive model
        algorithms)
      </li>
      <li>Run Experiment</li>
      <li>Wait for results.</li>
    </ol>
  </React.Fragment>
);

export default Help;
