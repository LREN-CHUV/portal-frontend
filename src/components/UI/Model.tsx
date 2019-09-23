import './Model.css';

import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';

import { VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';
import DropdownModel from './DropdownModel';
import Loading from './Loader';

const Body = styled(Panel.Body)`
  padding: 0 16px 16px 16px;
`;

const Title = styled.h3`
  margin: 16px 0 0 0;
`;

const Subtitle = styled.h5`
  margin-bottom: 4px;
`;

interface Props {
  model?: ModelResponse;
  selectedSlug?: string;
  showDatasets?: boolean;
  variables?: VariableEntity[];
  items?: ModelResponse[];
  handleSelectModel?: (model?: ModelResponse) => void;
}

class Model extends React.Component<Props> {
  public render() {
    const {
      items,
      handleSelectModel,
      model,
      selectedSlug,
      showDatasets,
      variables
    } = this.props;
    const query = model && model.query;

    return (
      <Panel className="model">
        <Panel.Title>
          <Title>
            Model <strong>{(model && model.title) || selectedSlug}</strong>
          </Title>
          <div>
            {handleSelectModel && (
              <DropdownModel
                items={items}
                selectedSlug={selectedSlug}
                showClear={false}
                handleSelect={handleSelectModel}
              />
            )}
          </div>
        </Panel.Title>
        <Body>
          {!model && <Loading />}
          {query && variables && (
            <React.Fragment>
              {query.variables && <Subtitle>Variables</Subtitle>}
              {query.variables &&
                query.variables.map((v: any) => (
                  <var key={v.code}>{this.lookup(v.code)}</var>
                ))}
              {query.coVariables && query.coVariables.length > 0 && (
                <Subtitle>CoVariables</Subtitle>
              )}
              {query.coVariables &&
                query.coVariables.length > 0 &&
                query.coVariables.map((v: any) => (
                  <var key={v.code}>{this.lookup(v.code)}</var>
                ))}
              {query.groupings && query.groupings.length > 0 && (
                <Subtitle>Groupings</Subtitle>
              )}
              {query.groupings &&
                query.groupings.length > 0 &&
                query.groupings.map((v: any) => (
                  <var key={v.code}>{this.lookup(v.code)}</var>
                ))}
              {query.filters && <Subtitle>Filters</Subtitle>}
              {query.filters && this.formatFilter(query.filters)}

              {showDatasets &&
                query.trainingDatasets &&
                query.trainingDatasets.length > 0 && (
                  <Subtitle>Training datasets</Subtitle>
                )}
              {showDatasets &&
                query.trainingDatasets &&
                query.trainingDatasets.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
              {showDatasets &&
                query.validationDatasets &&
                query.validationDatasets.length > 0 && (
                  <Subtitle>Validation dataset</Subtitle>
                )}
              {showDatasets &&
                query.validationDatasets &&
                query.validationDatasets.map((v: any) => (
                  <var key={v.code}>{v.code}</var>
                ))}
            </React.Fragment>
          )}
        </Body>
      </Panel>
    );
  }

  // FIXME: model should a least carry the label of the variable
  private lookup = (code: string): string => {
    const { variables } = this.props;
    const originalVar =
      variables && variables.find(variable => variable.code === code);

    return (
      (originalVar && `${originalVar.label} (${originalVar.type})`) || code
    );
  };
  private ruleOperator = (operator: string) => {
    switch (operator) {
      case 'greater':
        return '>';

      case 'less':
        return '<';

      case 'equal':
        return '=';

      case 'not equal':
        return '!=';

      default:
        return operator;
    }
  };

  private formatFilter = (filter: any) => {
    // TODO: refactor
    const humanRules: any = [];
    try {
      const json = JSON.parse(filter);

      let level = 0;
      const stringifyRules = (data: any) => {
        data.rules.forEach((rule: any, index: number) => {
          if (rule.condition) {
            stringifyRules(rule);
            return;
          }

          humanRules.push({
            data: `${this.lookup(rule.field)} ${this.ruleOperator(
              rule.operator
            )} ${rule.value}`,
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
    } catch (e) {
      console.log(e);
    }

    return humanRules.map((box: any, index: number) => {
      return (
        <div key={index} className={`level-${box.level}`}>
          {box.data}
        </div>
      );
    });
  };
}

export default Model;
