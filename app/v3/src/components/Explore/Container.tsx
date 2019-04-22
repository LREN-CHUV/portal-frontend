import './Explore.css';

import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';

import { APICore, APIMining } from '../API';
import { VariableEntity } from '../API/Core';
import { d3Hierarchy, HierarchyNode, VariableDatum } from './d3Hierarchy';
import Explore from './Explore';

export type HierarchyCircularNode = d3.HierarchyCircularNode<VariableDatum>;

export interface Model {
  covariables: HierarchyNode[] | undefined;
  filters: HierarchyNode[] | undefined;
  groupings: HierarchyNode[] | undefined;
  variable: HierarchyNode | undefined;
}

export enum ModelType {
  COVARIABLE,
  FILTER,
  VARIABLE
}
interface Props {
  apiCore: APICore;
  apiMining: APIMining;
}

export default ({ apiCore, apiMining }: Props) => {
  const [datasets, setDatasets] = useState<VariableEntity[]>();
  const [selectedDatasets, setSelectedDatasets] = useState<VariableEntity[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyNode>();
  const [selectedNode, setSelectedNode] = useState<HierarchyCircularNode | undefined>();
  const [model, setModel] = useState<Model>({
    covariables: undefined,
    filters: undefined,
    groupings: undefined,
    variable: undefined
  });

  useEffect(() => {
    const datasets = apiCore.state.datasets;
    if (datasets) {
      setDatasets(datasets);
      setSelectedDatasets(datasets);
    }
  }, [apiCore.state.datasets]);

  useEffect(() => {
    const hierarchy = apiCore.state.hierarchy;
    if (hierarchy) {
      setHierarchy(d3Hierarchy(hierarchy));
    }
  }, [apiCore.state.hierarchy])

  const handleSelectNode = async (node: HierarchyCircularNode) => {
    setSelectedNode(node);

    if (node.data.isVariable && datasets) {
      const payload = {
        datasets: selectedDatasets.map(d => ({ code: d.code })),
        variables: [{ code: node.data.code }]
      };

      apiMining.histograms({ payload });
    }
  };

  const handleSelectDataset = (dataset: VariableEntity) => {
    const nextSelection = selectedDatasets.map(d => d.code).includes(dataset.code)
      ? [...selectedDatasets.filter(d => d.code !== dataset.code)]
      : [...selectedDatasets, dataset];
    setSelectedDatasets(nextSelection);
  };

  const handleChangeModel = (type: ModelType, node: HierarchyNode | undefined = undefined, remove: boolean = false) => {
    if (type === ModelType.VARIABLE) {
      const nextModel = remove
        ? { ...model, variable: undefined }
        : selectedNode && selectedNode.data.isVariable
        ? { ...model, variable: selectedNode }
        : { ...model };
      setModel(nextModel);
    }

    if (type === ModelType.COVARIABLE) {
      if (remove && node) {
        const nextModel = {
          ...model,
          covariables:
            (model.covariables && model.covariables.filter(c => c && c.data.code !== node.data.code)) || undefined
        };
        setModel(nextModel);
        return;
      }

      if (selectedNode) {
        const nextCovariables =
          model.covariables &&
          model.covariables.filter(
            v =>
              !selectedNode
                .leaves()
                .map(c => c.data.code)
                .includes(v.data.code)
          );
        const nextModel = {
          ...model,
          covariables: nextCovariables && nextCovariables.length > 0 ? nextCovariables : selectedNode.leaves()
        };
        setModel(nextModel);
      }
    }
  };


  return (
    <Explore
      datasets={datasets}
      selectedDatasets={selectedDatasets}
      selectedNode={selectedNode}
      hierarchy={hierarchy}
      histograms={apiMining.state.histograms}
      model={model}
      handleSelectDataset={handleSelectDataset}
      handleSelectNode={handleSelectNode}
      handleChangeModel={handleChangeModel}
    />
  );
};
