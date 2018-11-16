import { IModelResult } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";

import './Model.css'

export default ({ model }: { model: IModelResult | undefined }) => {
  const query = model && model.query;
  return (
    <Panel className="panel-model">
      <Panel.Title> <h3>Model <strong>{model && model.title}</strong></h3></Panel.Title>
      <Panel.Body>
        {query && (
            <React.Fragment>
              {query.variables && <h5>Variables</h5>}
              {query.variables &&
                query.variables.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
              {query.coVariables && <h5>CoVariables</h5>}
              {query.coVariables &&
                query.coVariables.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
              {query.groupings &&
                query.groupings.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
              {query.filters && <h5>Filters</h5>}
              {query.filters}

              {query.trainingDatasets && query.trainingDatasets.length > 0 && <h5>Training datasets</h5>}
              {query.trainingDatasets &&
                query.trainingDatasets.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
              {query.validationDatasets && query.validationDatasets.length > 0 && <h5>Validation dataset</h5>}
              {query.validationDatasets &&
                query.validationDatasets.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
            </React.Fragment>
          )}
      </Panel.Body>
    </Panel>
  );
};
