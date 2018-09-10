// tslint:disable:no-console

import {
  IMethod,
  IPolynomialClassificationScore,
  IRegressionScore
} from "@app/types";
import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { SCORES } from "../../constants";
import { Highchart } from "./";

import "./JSON.css"

const makeChart = (
  validation: IRegressionScore | IPolynomialClassificationScore
) => ({
  chart: {
    type: "column"
  },
  series: [
    {
      data: Object.keys(validation).map(key => validation[key])
    }
  ],
  title: {
    text: ""
  },
  xAxis: {
    categories: Object.keys(validation).map(v => SCORES[v] && SCORES[v].label)
  },
  yAxis: { min: 0, max: 1, title: { text: "scores" } }
});

export default ({ method }: { method: IMethod }) => {
  return (
    (method &&
    method.data && ( // FIXME: should iterate
        <Tabs
          defaultActiveKey={0}
          id="pfa-method"
          style={{ marginTop: "16px" }}
        >
          {method.data[0].crossValidation && (
            <Tab eventKey={0} title={"Cross Validation"}>
              {console.log("crossValidation", method.data[0].crossValidation)}
              <Highchart options={makeChart(method.data[0].crossValidation)} />
              <pre>
                {JSON.stringify(method.data[0].crossValidation.confusionMatrix, null, 4)}
              </pre>

              <table className="greyGridTable">
                <tr>
                  <th />
                  <th ng-repeat="elem in labels" ng-bind="elem + '*'" />
                </tr>
                <tr ng-repeat="row in values">
                  <th ng-bind="labels[$index]" />
                  <td
                    ng-repeat="elem in row track by $index"
                    ng-bind="elem.toFixed()"
                  />
                </tr>
              </table>

            </Tab>
          )}
          {method.data[0].remoteValidation && (
            <Tab eventKey={1} title={"Remote Validation"}>
              {console.log(
                "remoteValidations",
                method.data[0].remoteValidation
              )}

              <Highchart options={makeChart(method.data[0].remoteValidation)} />
              <pre>
                {JSON.stringify(method.data[0].crossValidation, null, 4)}
              </pre>
            </Tab>
          )}
        </Tabs>
      )) ||
    null
  );
};
