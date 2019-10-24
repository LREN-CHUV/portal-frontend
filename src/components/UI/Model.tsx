import * as React from 'react';
import { Panel } from 'react-bootstrap';
import styled from 'styled-components';
import { VariableEntity } from '../API/Core';
import { ModelResponse } from '../API/Model';
import DropdownModel from './DropdownModel';
import './Model.css';

const Body = styled(Panel.Body)`
  padding: 0 16px 16px 16px;

  var {
    display: block;
  }
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
  items?: ModelResponse[];
  handleSelectModel?: (model?: ModelResponse) => void;
  lookup: (code: string) => VariableEntity;
}

class Model extends React.Component<Props> {
  public render(): JSX.Element {
    const {
      items,
      handleSelectModel,
      model,
      selectedSlug,
      lookup
    } = this.props;

    const query = model && model.query;

    return (
      <Panel className="model">
        <Panel.Title>
          {!handleSelectModel && (
            <Title>{(model && model.title) || selectedSlug}</Title>
          )}
          <Title>
            {handleSelectModel && (
              <DropdownModel
                items={items}
                selectedSlug={selectedSlug}
                reset={false}
                handleSelect={handleSelectModel}
              />
            )}
          </Title>
        </Panel.Title>
        <Body>
          {/* {!model && (
            <div style={{ marginTop: '8px' }}>
              <Loading />
            </div>
          )} */}
          {query && (
            <>
              {query.variables && <Subtitle>Variables</Subtitle>}
              {query.variables &&
                query.variables.map((v: any) => (
                  <var key={v.code}>{lookup(v.code).info}</var>
                ))}
              {((query.coVariables && query.coVariables.length > 0) ||
                (query.groupings && query.groupings.length > 0)) && (
                <Subtitle>CoVariables</Subtitle>
              )}
              {query.coVariables &&
                query.coVariables.length > 0 &&
                query.coVariables.map((v: any) => (
                  <var key={v.code}>{lookup(v.code).info}</var>
                ))}
              {query.groupings &&
                query.groupings.length > 0 &&
                query.groupings.map((v: any) => (
                  <var key={v.code}>{lookup(v.code).info}</var>
                ))}
              {query.filters && <Subtitle>Filters</Subtitle>}
              {query.filters && this.formatFilter(query.filters)}
            </>
          )}
        </Body>
      </Panel>
    );
  }

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
    const { lookup } = this.props;
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
            data: `${lookup(rule.field).label} ${this.ruleOperator(
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
