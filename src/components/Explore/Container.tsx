import './Explore.css';

import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { APICore, APIMining, APIModel } from '../API';
import { VariableEntity } from '../API/Core';
import { ModelResponse, Query } from '../API/Model';
import { AppConfig } from '../App/App';
import { d3Hierarchy, VariableDatum } from './d3Hierarchy';
import CirclePack from './D3PackLayer';
import Modal from '../UI/Modal';

const diameter = 800;
const padding = 1.5;

const initialD3Model = {
  covariables: undefined,
  filters: undefined,
  variables: undefined
};

export type HierarchyCircularNode = d3.HierarchyCircularNode<VariableDatum>;

export interface D3Model {
  covariables: HierarchyCircularNode[] | undefined;
  filters: HierarchyCircularNode[] | undefined;
  variables: HierarchyCircularNode[] | undefined;
}

export enum ModelType {
  COVARIABLE,
  FILTER,
  VARIABLE
}

interface Props extends RouteComponentProps {
  apiCore: APICore;
  apiMining: APIMining;
  apiModel: APIModel;
  appConfig: AppConfig;
}

export default ({
  apiCore,
  apiMining,
  apiModel,
  appConfig,
  ...props
}: Props): JSX.Element => {
  const [d3Layout, setD3Layout] = useState<HierarchyCircularNode>();
  const [selectedNode, setSelectedNode] = useState<
    HierarchyCircularNode | undefined
  >();
  const [d3Model, setD3Model] = useState<D3Model>(initialD3Model);
  const [showPathologySwitchWarning, setShowPathologySwitchWarning] = useState(
    false
  );
  const [nextPathologyCode, setNextPathologyCode] = useState(''); // TODO: maybe there is a better way... like promise.then() ?

  // select default pathology at start
  useEffect(() => {
    const model = apiModel.state.model;
    if (!model && apiCore.state.pathologies) {
      const defaultPathology = apiCore.state.pathologies[0];
      const newModel = { query: { pathology: defaultPathology.code } };
      apiModel.setModel(newModel);
    }
  }, [apiCore.state.pathologies, apiModel]);

  // Switch datasets, variables, models based on selected pathology
  useEffect(() => {
    const model = apiModel.state.model;
    if (model) {
      const hierarchy = apiCore.hierarchyForPathology(model.query.pathology);
      if (hierarchy) {
        const node = d3Hierarchy(hierarchy);
        const bubbleLayout = d3
          .pack<VariableDatum>()
          .size([diameter, diameter])
          .padding(padding);

        const d3layout = node && bubbleLayout(node);
        setD3Layout(d3layout);
      }
    }
  }, [apiCore, apiModel.state.model]);

  const convertModelToD3Model = (
    aModel: ModelResponse,
    aD3Layout: HierarchyCircularNode
  ): D3Model => {
    const query = aModel && aModel.query;

    const filterVariables: string[] = [];
    const extractVariablesFromFilter = (filter: any) =>
      filter.rules.forEach((r: any) => {
        if (r.rules) {
          extractVariablesFromFilter(r);
        }
        if (r.id) {
          filterVariables.push(r.id);
        }
      });

    if (query && query.filters) {
      extractVariablesFromFilter(JSON.parse(query.filters));
    }

    const nextModel = {
      covariables: [
        ...((query.coVariables &&
          aD3Layout
            .descendants()
            .filter(l =>
              query.coVariables!.map(c => c.code).includes(l.data.code)
            )) ||
          []),
        ...((query.groupings &&
          aD3Layout
            .descendants()
            .filter(l =>
              query.groupings!.map(c => c.code).includes(l.data.code)
            )) ||
          [])
      ],
      filters:
        filterVariables &&
        aD3Layout
          .descendants()
          .filter(l => filterVariables.includes(l.data.code)),
      groupings: undefined,
      variables:
        (query.variables !== undefined &&
          query.variables.length > 0 &&
          aD3Layout
            .descendants()
            .filter(l =>
              query.variables!.map(c => c.code).includes(l.data.code)
            )) ||
        []
    };

    return nextModel;
  };

  // Sync selected variables and D3 Model
  useEffect(() => {
    const next = apiModel.state.model;
    if (next && d3Layout) {
      setD3Model(convertModelToD3Model(next, d3Layout));
    } else {
      setD3Model(initialD3Model);
    }
  }, [apiModel.state, d3Layout]);

  // Load Histograms for selected variable
  useEffect(() => {
    const model = apiModel.state.model;
    const datasets =
      (model && model.query && model.query.trainingDatasets) || [];
    if (selectedNode && selectedNode.data.isVariable) {
      if (appConfig.mode === 'local') {
        apiMining.histograms({
          payload: {
            datasets: datasets.map(d => ({ code: d.code })),
            variables: [{ code: selectedNode.data.code }]
          }
        });
      } else {
        apiMining.exaremeHistograms({
          datasets: datasets,
          x: selectedNode.data,
          pathology: (model && model.query && model.query.pathology) || ''
        });
      }
    }
  }, [selectedNode, apiModel.state, apiMining, appConfig]);

  const handleSelectDataset = (dataset: VariableEntity) => {
    const model = apiModel.state.model;
    const trainingDatasets =
      (model && model.query && model.query.trainingDatasets) || [];

    if (trainingDatasets) {
      const nextDatasets = trainingDatasets
        .map(d => d.code)
        .includes(dataset.code)
        ? [...trainingDatasets.filter(d => d.code !== dataset.code)]
        : [...trainingDatasets, dataset];

      if (model) {
        model.query.trainingDatasets = nextDatasets;
        apiModel.setModel(model);
      }
    }
  };

  const handleUpdateD3Model = (
    type: ModelType,
    node: HierarchyCircularNode
  ): void => {
    if (type === ModelType.VARIABLE) {
      const nextModel = d3Model.variables
        ? {
            ...d3Model,
            variables: [
              ...d3Model.variables.filter(c => !node.leaves().includes(c)),
              ...node.leaves().filter(c => !d3Model.variables!.includes(c))
            ],
            covariables: d3Model.covariables
              ? [...d3Model.covariables.filter(c => !node.leaves().includes(c))]
              : []
          }
        : {
            ...d3Model,
            variables: node.leaves(),
            covariables:
              d3Model.covariables && d3Model.covariables.filter(c => c !== node)
          };

      setD3Model(nextModel);
    }

    if (type === ModelType.COVARIABLE) {
      const nextModel = d3Model.covariables
        ? {
            ...d3Model,
            covariables: [
              ...d3Model.covariables.filter(c => !node.leaves().includes(c)),
              ...node.leaves().filter(c => !d3Model.covariables!.includes(c))
            ],
            variables: d3Model.variables
              ? [...d3Model.variables.filter(c => !node.leaves().includes(c))]
              : []
          }
        : {
            ...d3Model,
            covariables: node.leaves(),
            variables:
              d3Model.variables && d3Model.variables.filter(c => c !== node)
          };

      setD3Model(nextModel);
    }

    if (type === ModelType.FILTER) {
      const nextModel = d3Model.filters
        ? {
            ...d3Model,
            filters: [
              ...d3Model.filters.filter(c => !node.leaves().includes(c)),
              ...node.leaves().filter(c => !d3Model.filters!.includes(c))
            ]
          }
        : { ...d3Model, filters: node.leaves() };
      setD3Model(nextModel);
    }
  };

  const convertD3ModelToModel = (
    aD3Model: D3Model,
    aModel?: ModelResponse
  ): ModelResponse => {
    const model = apiModel.state.model;
    const datasets = model && model.query && model.query.trainingDatasets;

    const query: Query = {
      coVariables:
        (aD3Model.covariables &&
          aD3Model.covariables
            .filter(
              v => v.data.type !== 'polynominal' && v.data.type !== 'binominal'
            )
            .map(v => ({ code: v.data.code }))) ||
        [],
      filters: aModel ? aModel.query.filters : '',
      groupings:
        (aD3Model.covariables &&
          aD3Model.covariables
            .filter(
              v => v.data.type === 'polynominal' || v.data.type === 'binominal'
            )
            .map(v => ({ code: v.data.code }))) ||
        [],
      trainingDatasets: datasets,
      variables:
        (aD3Model.variables &&
          aD3Model.variables.map(v => ({ code: v.data.code }))) ||
        [],
      pathology: (model && model.query && model.query.pathology) || ''
    };

    if (aModel) {
      aModel.query = query;

      return aModel;
    } else {
      const draft: ModelResponse = {
        query,
        title: 'untitled'
      };

      return draft;
    }
  };

  const handleSelectModel = (nextModel?: ModelResponse): void => {
    if (nextModel && nextModel.slug) {
      apiModel.one(nextModel.slug);
    } else {
      apiModel.setModel(undefined);
    }
  };

  const handleSelectPathology = (code: string): void => {
    setNextPathologyCode(code);
    setShowPathologySwitchWarning(true);
  };

  const handleCancelSwitchPathology = () => {
    setShowPathologySwitchWarning(false);
  };

  const handleOKSwitchPathology = () => {
    setShowPathologySwitchWarning(false);
    if (apiCore.state.pathologies) {
      const newModel = { query: { pathology: nextPathologyCode } };
      apiModel.setModel(newModel);
    }
  };

  const handleGoToAnalysis = async (): Promise<void> => {
    const { history } = props;
    const nextModel = convertD3ModelToModel(d3Model, apiModel.state.model);

    await apiModel.setModel(nextModel);
    history.push(`/review`);
  };

  const nextProps = {
    apiCore,
    apiModel,
    handleGoToAnalysis,
    handleSelectDataset,
    handleSelectModel,
    handleSelectNode: setSelectedNode,
    handleSelectPathology,
    handleUpdateD3Model,
    histograms: apiMining.state.histograms,
    selectedNode
  };

  return (
    <>
      {showPathologySwitchWarning && (
        <Modal
          title="Change Pathology ?"
          body="Selecting a new pathology will reset your selection"
          handleCancel={handleCancelSwitchPathology}
          handleOK={handleOKSwitchPathology}
        />
      )}
      {d3Layout && (
        <CirclePack layout={d3Layout} d3Model={d3Model} {...nextProps} />
      )}
    </>
  );
};
