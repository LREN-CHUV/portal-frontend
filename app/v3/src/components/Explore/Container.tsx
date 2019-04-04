import './Explore.css';

import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';

import { MIP } from '../../types';
import { APICore, APIMining } from '../API';
import Explore from './Explore';

interface IProps {
  apiCore: APICore;
  apiMining: APIMining;
}

export default ({ apiCore, apiMining }: IProps) => {
  const [selectedDatasets, setSelectedDatasets] = useState<
    MIP.API.IVariableEntity[]
  >([]);
  useEffect(() => {
    if (!apiCore.state.hierarchy) {
      apiCore.hierarchy();
    }

    if (!apiCore.state.datasets) {
      apiCore.datasets();
    } else {
      setSelectedDatasets(apiCore.state.datasets);
    }
  }, [apiCore.state.datasets]);

  const handleSelectVariable = async (
    node: d3.HierarchyNode<MIP.Internal.IVariableDatum>
  ) => {
    if (node.data.isVariable && apiCore.state.datasets) {
      const payload = {
        datasets: selectedDatasets.map(d => ({ code: d.code })),
        variables: [{ code: node.data.code }]
      };

      apiMining.histograms({ payload });
    }
  };

  const handleSelectDataset = (dataset: MIP.API.IVariableEntity) => {
    const nextSelection = selectedDatasets
      .map(d => d.code)
      .includes(dataset.code)
      ? [...selectedDatasets.filter(d => d.code !== dataset.code)]
      : [...selectedDatasets, dataset];

    setSelectedDatasets(nextSelection);
  };

  const root = d3Hierarchy(apiCore.state.hierarchy);
  const hierarchyNode = root
    ? d3
        .hierarchy(root)
        .sum((d: any) => (d.label ? d.label.length : 1))
        .sort((a: any, b: any) => b.value - a.value)
    : undefined;

  return (
    <Explore
      datasets={apiCore.state.datasets}
      selectedDatasets={selectedDatasets}
      hierarchyNode={hierarchyNode}
      histograms={apiMining.state.histograms}
      handleSelectDataset={handleSelectDataset}
      handleSelectVariable={handleSelectVariable}
    />
  );
};

const d3Hierarchy = (node: any): MIP.Internal.IVariableDatum | undefined =>
  node
    ? {
        children: [
          ...((node.groups && node.groups.map(d3Hierarchy)) || []),
          ...((node.variables &&
            node.variables.map((v: any) => ({
              code: v.code,
              description: v.description,
              isVariable: true,
              label: v.label
            }))) ||
            [])
        ],
        code: node.code,
        description: node.description,
        label: node.label
      }
    : undefined;
