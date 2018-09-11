// tslint:disable:no-console

import {
  IConfusionMatrix,
  IMethod,
  IPolynomialClassificationScore,
  IRegressionScore
} from "@app/types";
import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { SCORES } from "../../constants";
import { round } from "../../utils";
import { Highchart } from "./";

import "./JSON.css";
import "./PFA.css";

const removeKey = (obj: any, key: string = "confusionMatrix") => {
  const newObj = { ...obj };
  newObj[key] = undefined;
  return JSON.parse(JSON.stringify(newObj));
};

const buildChart = (
  validation: IRegressionScore | IPolynomialClassificationScore
) => ({
  chart: {
    type: "column"
  },
  series: [
    {
      data: Object.keys(validation).map(key => validation[key]),
      name: "Scores"
    }
  ],
  title: {
    text: ""
  },
  xAxis: {
    categories: Object.keys(validation).map(v => SCORES[v] && SCORES[v].label)
  },
  yAxis: { min: 0, max: 1, title: { text: "Value" } }
});

const buildTableValue = (
  validation: IRegressionScore | IPolynomialClassificationScore
) =>
  (validation && (
    <ul className="pfa-table">
      {Object.keys(validation).map((key, k) => (
        <li key={k}>
          <strong>{SCORES[key] && SCORES[key].label}</strong>:{" "}
          {round(validation[key])}
        </li>
      ))}
    </ul>
  )) ||
  null;

const buildConfusionMatrix = (matrix: IConfusionMatrix) =>
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
export default ({ method, data }: { method: IMethod; data: any }) => {
  return (
    (data && (
      <Tabs defaultActiveKey={0} id="pfa-method" style={{ marginTop: "16px" }}>
        {data &&
          data.error && (
            <div>
              <h3>An error has occured</h3>
              <p>{data.error}</p>
            </div>
          )}

        {data.crossValidation && (
          <Tab eventKey={0} title={"Cross Validation"}>
            <Highchart options={buildChart(removeKey(data.crossValidation))} />
            {buildTableValue(removeKey(data.crossValidation))}
            {buildConfusionMatrix(data.crossValidation.confusionMatrix)}
          </Tab>
        )}
        {data.remoteValidation && (
          <Tab eventKey={1} title={"Remote Validation"}>
            <Highchart options={buildChart(removeKey(data.remoteValidation))} />
            {buildTableValue(removeKey(data.remoteValidation))}
            {buildConfusionMatrix(data.remoteValidation.confusionMatrix)}
          </Tab>
        )}
      </Tabs>
    )) ||
    null
  );
};
