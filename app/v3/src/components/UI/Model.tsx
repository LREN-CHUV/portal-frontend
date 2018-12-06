import { MIP } from "@app/types";
import * as React from "react";
import { Panel } from "react-bootstrap";

import "./Model.css";

const ruleOperator = (operator: string) => {
  switch (operator) {
    case "greater":
      return ">";
      break;

    case "less":
      return "<";
      break;

    case "equal":
      return "=";
      break;

    case "not equal":
      return "!=";
      break;

    default:
      return operator;
      break;
  }
};

const formatFilter = (filter: any) => {
  // TODO: refactor
  const json = JSON.parse(filter);
  const humanRules: any = [];

  let level = 0;
  const stringifyRules = (data: any) => {
    data.rules.forEach((rule: any, index: number) => {
      if (rule.condition) {
        stringifyRules(rule);
        return;
      }

      humanRules.push({
        data: `${rule.field} ${ruleOperator(rule.operator)} ${rule.value}`,
        level
      });
      if (index < data.rules.length - 1) {
        humanRules.push({
          data: `${data.condition}`,
          level
        });
      }

      level++;
    });
  };
  stringifyRules(json);

  return humanRules.map((box: any, index: number) => {
    return (
      <div key={index} className={`level-${box.level}`}>
        {box.data}
      </div>
    );
  });
};

export default ({ model }: { model: MIP.API.IModelResult | undefined }) => {
  const query = model && model.query;
  return (
    <Panel className="model">
      <Panel.Title>
        <h3>
          Model <strong>{model && model.title}</strong>
        </h3>
      </Panel.Title>
      <Panel.Body>
        {query && (
          <React.Fragment>
            {query.variables && <h5>Variables</h5>}
            {query.variables &&
              query.variables.map((v: any) => <var key={v.code}>{v.code}</var>)}
            {query.coVariables && <h5>CoVariables</h5>}
            {query.coVariables &&
              query.coVariables.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {query.groupings &&
              query.groupings.map((v: any) => <var key={v.code}>{v.code}</var>)}
            {query.filters && <h5>Filters</h5>}
            {query.filters && formatFilter(query.filters)}

            {query.trainingDatasets && query.trainingDatasets.length > 0 && (
              <h5>Training datasets</h5>
            )}
            {query.trainingDatasets &&
              query.trainingDatasets.map((v: any) => (
                <var key={v.code}>{v.code}</var>
              ))}
            {query.validationDatasets &&
              query.validationDatasets.length > 0 && (
                <h5>Validation dataset</h5>
              )}
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
