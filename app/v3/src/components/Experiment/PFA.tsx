// tslint:disable:no-console

import { IMethod } from "@app/types";
import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { SCORES } from "../../constants";
import { Highchart } from "./";

const makeChart = (validation: any) => ({
  chart: {
    type: "column"
  },
  series: [
    {
      data: Object.keys(validation).map(key => validation[key]),
      name: validation.type
    }
  ],
  title: {
    text: ""
  },
  xAxis: { categories: Object.keys(validation).map(v => SCORES[v].label) },
  yAxis: { min: 0, max: 1, title: { text: "scores" } }
});

export default ({ method }: { method: IMethod }) => {
  return (
    (method &&
    method.data && ( // FIXME: should iterate
        <Tabs defaultActiveKey={0} id="pfa-method">
          {method.data[0].crossValidation && (
            <Tab eventKey={0} title={"Cross Validation"}>
              <Highchart options={makeChart(method.data[0].crossValidation)} />
            </Tab>
          )}
          {method.data[0].remoteValidations && (
            <Tab eventKey={1} title={"Remote Validation"}>
              <Highchart
                options={makeChart(method.data[0].remoteValidations)}
              />
            </Tab>
          )}
        </Tabs>
      )) ||
    null
  );
};
