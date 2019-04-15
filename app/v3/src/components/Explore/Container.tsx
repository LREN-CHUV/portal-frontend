import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { MIP } from '../../types';
import { APICore, APIMining } from '../API';
import d3Hierarchy from './d3Hierarchy';
import Explore from './Explore';
import './Explore.css';

interface IProps {
  apiCore: APICore;
  apiMining: APIMining;
}

export type IVariableNode = d3.HierarchyNode<MIP.Internal.IVariableDatum>;

export interface IModel {
  covariables: IVariableNode[] | undefined;
  filters: IVariableNode[] | undefined;
  groupings: IVariableNode[] | undefined;
  variable: IVariableNode | undefined;
}

export enum ModelType {
  COVARIABLE,
  FILTER,
  VARIABLE
}

export default ({ apiCore, apiMining }: IProps) => {
  const [selectedDatasets, setSelectedDatasets] = useState<
    MIP.API.IVariableEntity[]
  >([]);
  const [selectedNode, setSelectedNode] = useState<
    d3.HierarchyCircularNode<MIP.Internal.IVariableDatum> | undefined
  >();
  const [model, setModel] = useState<IModel>({
    covariables: undefined,
    filters: undefined,
    groupings: undefined,
    variable: undefined
  });

  const diameter = 800;
  const padding = 1.5;

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

  const handleSelectNode = async (
    node: d3.HierarchyCircularNode<MIP.Internal.IVariableDatum>
  ) => {
    setSelectedNode(node);

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

  const handleChangeModel = (
    type: ModelType,
    node: IVariableNode | undefined = undefined,
    remove: boolean = false
  ) => {
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
            (model.covariables &&
              model.covariables.filter(c => c.data.code !== node.data.code)) ||
            undefined
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
          covariables:
            nextCovariables && nextCovariables.length > 0
              ? nextCovariables
              : selectedNode.leaves()
        };
        setModel(nextModel);
      }
    }
  };

  const hierarchy = d3Hierarchy(apiCore.state.hierarchy);
  const bubbleLayout = d3
    .pack<MIP.Internal.IVariableDatum>()
    .size([diameter, diameter])
    .padding(padding);
  const circlePack = hierarchy && bubbleLayout(hierarchy);

  return (
    <Explore
      datasets={apiCore.state.datasets}
      selectedDatasets={selectedDatasets}
      selectedNode={selectedNode}
      circlePack={circlePack}
      histograms={apiMining.state.histograms}
      model={model}
      handleSelectDataset={handleSelectDataset}
      handleSelectNode={handleSelectNode}
      handleChangeModel={handleChangeModel}
    />
  );
};

// const variableType = (type: string)  => {
//   switch(type) {
//     case 'integer':
//     return MIP.Internal.IVariableType.Integer;

//     case 'real':
//     return MIP.Internal.IVariableType.Real;

//     case 'binominal':
//     return MIP.Internal.IVariableType.Binominal;

//     case 'polynominal':
//     return MIP.Internal.IVariableType.Polynominal;

//     default:
//     return undefined;
//   }
// }
