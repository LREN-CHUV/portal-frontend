import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { APICore, APIMining } from '../API';
import { VariableEntity } from '../API/Core';
import { d3Hierarchy, HierarchyNode, VariableDatum } from './d3Hierarchy';
import CirclePack from './D3PackLayer';
import './Explore.css';

export type HierarchyCircularNode = d3.HierarchyCircularNode<VariableDatum>;

export interface Model {
  covariables: HierarchyCircularNode[] | undefined;
  filters: HierarchyCircularNode[] | undefined;
  groupings: HierarchyCircularNode[] | undefined;
  variable: HierarchyCircularNode | undefined;
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
  const [selectedDatasets, setSelectedDatasets] = useState<VariableEntity[]>(
    []
  );
  const [hierarchy, setHierarchy] = useState<HierarchyNode>();
  const [selectedNode, setSelectedNode] = useState<
    HierarchyCircularNode | undefined
  >();
  const [model, setModel] = useState<Model>({
    covariables: undefined,
    filters: undefined,
    groupings: undefined,
    variable: undefined
  });

  useEffect(() => {
    const d = apiCore.state.datasets;
    if (d) {
      setDatasets(d);
      setSelectedDatasets(d);
    }
  }, [apiCore.state.datasets]);

  useEffect(() => {
    const h = apiCore.state.hierarchy;
    if (h) {
      const node = d3Hierarchy(h);
      setHierarchy(node);
    }
  }, [apiCore.state.hierarchy]);

  useEffect(() => {
    if (selectedNode && selectedNode.data.isVariable && selectedDatasets) {
      const payload = {
        datasets: selectedDatasets.map(d => ({ code: d.code })),
        variables: [{ code: selectedNode.data.code }]
      };

      apiMining.histograms({ payload });
    }
  }, [selectedNode, selectedDatasets]);

  const handleSelectDataset = (dataset: VariableEntity) => {
    const nextSelection = selectedDatasets
      .map(d => d.code)
      .includes(dataset.code)
      ? [...selectedDatasets.filter(d => d.code !== dataset.code)]
      : [...selectedDatasets, dataset];
    setSelectedDatasets(nextSelection);
  };

  const handleChangeModel = (type: ModelType, node: HierarchyCircularNode) => {
    if (type === ModelType.VARIABLE) {
      const nextModel =
        model.variable === node
          ? { ...model, variable: undefined }
          : {
              ...model,
              covariables:
                model.covariables && model.covariables.filter(c => c !== node),
              variable: node
            };

      setModel(nextModel);
    }

    if (type === ModelType.COVARIABLE) {
      const nextModel = model.covariables
        ? {
            ...model,
            covariables: [
              ...model.covariables.filter(c => !node.leaves().includes(c)),
              ...node.leaves().filter(c => !model.covariables!.includes(c))
            ],
            variable:
              model.variable && node.leaves().includes(model.variable)
                ? undefined
                : model.variable
          }
        : {
            ...model,
            covariables: node.leaves(),
            variable:
              model.variable && node.leaves().includes(model.variable)
                ? undefined
                : model.variable
          };

      setModel(nextModel);
    }

    if (type === ModelType.FILTER) {
      const nextModel = model.filters
        ? {
            ...model,
            filters: [
              ...model.filters.filter(c => !node.leaves().includes(c)),
              ...node.leaves().filter(c => !model.filters!.includes(c))
            ]
          }
        : { ...model, filters: node.leaves() };
      setModel(nextModel);
    }
  };

  const props = {
    datasets,
    handleChangeModel,
    handleSelectDataset,
    handleSelectNode: setSelectedNode,
    histograms: apiMining.state.histograms,
    model,
    selectedDatasets,
    selectedNode
  };

  return hierarchy ? <CirclePack hierarchy={hierarchy} {...props} /> : null;
};
