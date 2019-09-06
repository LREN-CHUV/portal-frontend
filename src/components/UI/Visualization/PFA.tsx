import './JSON.css';
import './PFA.css';

import * as React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import {
  ConfusionMatrix,
  KfoldValidationScore,
  PolynomialClassificationScore,
  ValidationScore
} from '../../API/Experiment';
import { SCORES } from '../../constants';
import { round } from '../../utils';
import { Highchart } from './';

const removeKeys = (
  obj: any,
  keys: string[] = ['confusionMatrix', 'type', 'node']
) => {
  const newObj = { ...obj };
  keys.forEach(key => {
    delete newObj[key];
  });

  return { ...newObj };
};

const buildChart = (
  validation:
    | KfoldValidationScore
    | ValidationScore
    | PolynomialClassificationScore
) => {
  return {
    chart: {
      type: 'column',
      width: 600
    },
    series: [
      {
        data: Object.keys(validation).map(key => validation[key]),
        name: 'Scores'
      }
    ],
    title: {
      text: ''
    },
    xAxis: {
      categories: Object.keys(validation).map(v => SCORES[v] && SCORES[v].label)
    },
    yAxis: {
      title: {
        text: 'Value'
      }
    }
  };
};

const buildTableValue = (
  validation:
    | KfoldValidationScore
    | ValidationScore
    | PolynomialClassificationScore
) =>
  (validation && (
    <ul className="pfa-table">
      {Object.keys(validation).map((key, k) => (
        <li key={k}>
          <strong>{SCORES[key] && SCORES[key].label}</strong>:{' '}
          {round(validation[key])}
        </li>
      ))}
    </ul>
  )) ||
  null;

const buildConfusionMatrix = (matrix: ConfusionMatrix) =>
  matrix &&
  ((
    <table className="greyGridTable">
      <caption>
        <strong>Confusion matrix</strong>
      </caption>
      <thead>
        <tr>
          <th />
          {matrix.labels.map((label: string, k: number) => (
            <th key={k}>{label}*</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.values.map((values: number[], k: number) => (
          <tr key={k}>
            <th>{matrix.labels[k]}</th>
            {values.map((value, l) => (
              <td key={l}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ) ||
    null);

export default ({ data }: { data: any }) => {
  return (
    (data && (
      <Tabs defaultActiveKey={0} id="pfa-method" style={{ marginTop: '16px' }}>
        {data && data.error && (
          <div className="error">
            <h3>An error has occured</h3>
            <p>{data.error}</p>
          </div>
        )}

        {data.crossValidation && (
          <Tab eventKey={0} title={'Cross Validation'}>
            <Highchart options={buildChart(removeKeys(data.crossValidation))} />
            {buildTableValue(removeKeys(data.crossValidation))}
            {buildConfusionMatrix(data.crossValidation.confusionMatrix)}
          </Tab>
        )}
        {data.remoteValidation && (
          <Tab eventKey={1} title={'Remote Validation'}>
            <Highchart
              options={buildChart(removeKeys(data.remoteValidation))}
            />
            {buildTableValue(removeKeys(data.remoteValidation))}
            {buildConfusionMatrix(data.remoteValidation.confusionMatrix)}
          </Tab>
        )}
      </Tabs>
    )) ||
    null
  );
};
