import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { DropdownButton, Dropdown, Tab, Tabs } from 'react-bootstrap';
import styled from 'styled-components';

import { APIMining } from '../API';
import { VariableEntity } from '../API/Core';
import { HistogramVariable, MiningResponse } from '../API/Mining';
import { ModelResponse } from '../API/Model';
import Loading from '../UI/Loader';
import Highchart from '../UI/Visualization/Highchart';
import { HierarchyCircularNode } from '../API/Model';
import renderLifeCycle from './renderLifeCycle';

interface Props {
  apiMining: APIMining;
  handleSelectedNode: (node: HierarchyCircularNode) => void;
  histograms: MiningResponse;
  selectedNode?: HierarchyCircularNode;
  independantsVariables: VariableEntity[] | undefined;
  zoom: Function;
  model: ModelResponse | undefined;
}

const breadcrumb = (
  variable: HierarchyCircularNode,
  paths: HierarchyCircularNode[] = []
): HierarchyCircularNode[] =>
  variable && variable.parent
    ? breadcrumb(variable.parent, [...paths, variable])
    : [...paths, variable];

const Histogram = styled.div`
  min-height: 440px;
  margin-top: 8px;
`;

const Overview = styled.div`
  p {
    margin: 0;
  }
`;

const Breadcrumb = styled.span`
  p:after {
    content: ' > ';
  }
  p:last-child:after {
    content: '';
  }
  p {
    color: #007ad9;
    display: inline;
    cursor: pointer;
  }
`;

const DropDown = styled(DropdownButton)`
  margin: 0;
  padding: 0;
`;

export default (props: Props): JSX.Element => {
  const divRef = useRef(null);
  const [choosenVariables, setChoosenVariables] = useState<HistogramVariable>();
  const [selectedTab, setSelectedTab] = useState(0);
  const {
    apiMining,
    handleSelectedNode,
    histograms,
    independantsVariables,
    selectedNode,
    zoom,
    model
  } = props;

  // useEffect(() => {
  //   if (choosenVariables) {
  //     const pathology = model?.query?.pathology;
  //     if (pathology) {
  //       console.log('write', pathology)
  //       apiMining.setGroupingForPathology(pathology, choosenVariables);
  //     }
  //   }
  // }, [choosenVariables, apiMining, model]);

  useEffect(() => {
    const pathology = model?.query?.pathology;
    if (pathology) {
      const choosenHistogramVariablesByPathology = apiMining.groupingForPathology(
        pathology
      );

      if (choosenHistogramVariablesByPathology) {
        setChoosenVariables(choosenHistogramVariablesByPathology);
      }
    }
  }, [apiMining, model]);

  const handleChooseVariable = (
    index: number,
    variable: VariableEntity
  ): void => {
    const nextChoosenVariables = choosenVariables
      ? { ...choosenVariables, [index]: variable }
      : { [index]: variable };
    setChoosenVariables(nextChoosenVariables);
    const pathology = model?.query?.pathology;
    if (pathology && choosenVariables) {
      apiMining.setGroupingForPathology(pathology, nextChoosenVariables);
    }
    apiMining.refetchAlgorithms();
  };

  const handleSelectTab = (event: any): void => {
    setTimeout(() => {
      setSelectedTab(event);
    }, 300);
  };

  renderLifeCycle({
    updateRender: () => {
      if (selectedNode) {
        d3.select(divRef.current)
          .selectAll('p')
          .remove();

        d3.select(divRef.current)
          .selectAll('p')
          .data(breadcrumb(selectedNode).reverse())
          .enter()
          .append('p')
          .text(d => d.data.label)
          .on('click', d => {
            handleSelectedNode(d);
            d3.event.stopPropagation();
            zoom(d);
          });
      }
    }
  });

  const overviewChart = (node: HierarchyCircularNode): any => {
    let children = node
      .descendants()
      .filter(d => d.parent === selectedNode && !d.data.isVariable);

    children = children.length ? children : [node];
    return {
      chart: {
        type: 'column'
      },
      legend: {
        enabled: false
      },
      series: [
        {
          data: children.map(c => c.descendants().length - 1),
          dataLabels: {
            enabled: true
          }
        }
      ],
      title: {
        text: `Variables contained in ${node.data.label}`
      },
      tooltip: {
        enabled: false
      },
      xAxis: {
        categories: children.map(d => d.data.label)
      },
      yAxis: {
        allowDecimals: false
      }
    };
  };

  return (
    <>
      {selectedNode && (
        <Overview>
          <p>
            <b>Path</b>: <Breadcrumb ref={divRef} />
          </p>
          <p>
            <b>Type</b>: {selectedNode.data.type || 'group'}
          </p>
          <p>
            <b>Description</b>: {selectedNode.data.description || '-'}
          </p>
        </Overview>
      )}

      <Histogram>
        {selectedNode && selectedNode.children && (
          <Highchart options={overviewChart(selectedNode)} />
        )}
        {histograms && histograms.loading && <Loading />}
        {histograms && histograms.error && (
          <div className="error">
            <h3>An error has occured</h3>
            <p>{histograms.error}</p>
          </div>
        )}

        {histograms && histograms.warning && (
          <div className="warning">
            <p>{histograms.warning}</p>
          </div>
        )}

        {selectedNode && !selectedNode.children && (
          <Tabs
            defaultActiveKey={0}
            onSelect={handleSelectTab}
            id="uncontrolled-histogram-tabs"
          >
            {[0, 1, 2, 3].map((k, i) => {
              return i === 0 ? (
                <Tab
                  eventKey={`${i}`}
                  title={`${selectedNode && selectedNode.data.label}`}
                  key={i}
                >
                  {histograms &&
                    histograms.data &&
                    histograms.data.length > 0 && (
                      <Highchart options={histograms.data[0].highchart.data} />
                    )}
                </Tab>
              ) : (
                <Tab
                  eventKey={`${i}`}
                  title={
                    i === selectedTab ||
                    !(choosenVariables && choosenVariables[i]) ? (
                      <DropDown
                        variant="link"
                        id={`independant-dropdown-${i}`}
                        title={
                          (choosenVariables &&
                            choosenVariables[i] &&
                            choosenVariables[i].label) ||
                          'Choose'
                        }
                      >
                        {independantsVariables &&
                          independantsVariables.map((v: VariableEntity) => (
                            <Dropdown.Item
                              key={v.code}
                              onSelect={(): void => handleChooseVariable(i, v)}
                            >
                              {v.label}
                            </Dropdown.Item>
                          ))}
                      </DropDown>
                    ) : (
                      (choosenVariables &&
                        choosenVariables[i] &&
                        choosenVariables[i].label) ||
                      'Choose'
                    )
                  }
                  key={i}
                >
                  {histograms &&
                    histograms.data &&
                    histograms.data.length > i &&
                    histograms.data[i].highchart && (
                      <Highchart options={histograms.data[i].highchart.data} />
                    )}
                </Tab>
              );
            })}
          </Tabs>
        )}
      </Histogram>
    </>
  );
};
