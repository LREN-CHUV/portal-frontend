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
  const [selectedVariable, setSelectedVariable] = useState<
    IVariableNode | undefined
  >();
  const [model, setModel] = useState<IModel>({
    covariables: undefined,
    filters: undefined,
    groupings: undefined,
    variable: undefined
  });

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

  const handleSelectVariable = async (node: IVariableNode) => {
    setSelectedVariable(node);

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
        : selectedVariable && selectedVariable.data.isVariable
        ? { ...model, variable: selectedVariable }
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

      if (selectedVariable) {
        console.log(selectedVariable);
        const nextCovariables =
          model.covariables &&
          model.covariables.filter(
            v =>
              !selectedVariable
                .leaves()
                .map(c => c.data.code)
                .includes(v.data.code)
          );
        const nextModel = {
          ...model,
          covariables:
            nextCovariables && nextCovariables.length > 0
              ? nextCovariables
              : selectedVariable.leaves()
        };
        setModel(nextModel);
      }
    }
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
      model={model}
      handleSelectDataset={handleSelectDataset}
      handleSelectVariable={handleSelectVariable}
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
              label: v.label,
              type: node.type
            }))) ||
            [])
        ],
        code: node.code,
        description: node.description,
        label: node.label,
        type: node.type
      }
    : undefined;
