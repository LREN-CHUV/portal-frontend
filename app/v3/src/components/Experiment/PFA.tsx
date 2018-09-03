// tslint:disable:no-console

import { IMethod } from "@app/types";
import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Highchart } from "./";

const makeChart = (validation: any) => ({
  chart: {
    type: "column"
  },
  series: [{
    data: Object.keys(validation).map(key => validation[key]),
    name: "linear Regression",
  }],
  title: {
    text: "linear Regression"
  },
  xAxis: { categories: Object.keys(validation) },
  yAxis: { min: 0, max: 1, title: { text: "rating" } }
});

export default ({ method }: { method: IMethod }) => {
  return (
    (method &&
      method.data && (
        <Tabs defaultActiveKey={0} id="pfa-method">
          <Tab eventKey={0} title={"Cross Validation"}>
            <Highchart options={makeChart(method.data[0].crossValidation)} />
          </Tab>
          <Tab eventKey={1} title={"Remote Validation"}>
          <Highchart options={makeChart(method.data[0].remoteValidations)} />
          </Tab>
        </Tabs>
      )) ||
    null
  );
};
