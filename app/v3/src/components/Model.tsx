import { IModelResult } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";

export default ({ model }: { model: IModelResult | undefined }) => {
  return (
    <Panel>
      <Panel.Title>
        <h3>Model {model && model.title}</h3>
      </Panel.Title>
      {model &&
        model.query && (
          <Panel.Body>
            {model.query.variables && <h5>Variables</h5>}
            {model.query.variables &&
              model.query.variables.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {model.query.coVariables && <h5>CoVariables</h5>}
            {model.query.coVariables &&
              model.query.coVariables.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {model.query.groupings &&
              model.query.groupings.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {model.query.filters && <h5>Filters</h5>}
            {model.query.filters}

            {model.query.trainingDatasets && <h5>Training datasets</h5>}
            {model.query.trainingDatasets &&
              model.query.trainingDatasets.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {model.query.validationDatasets && <h5>Validation dataset</h5>}
            {model.query.validationDatasets &&
              model.query.validationDatasets.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
          </Panel.Body>
        )}
    </Panel>
  );
};
