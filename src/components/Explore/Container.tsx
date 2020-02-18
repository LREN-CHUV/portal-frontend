import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { APICore, APIMining, APIModel } from '../API';
import { VariableEntity } from '../API/Core';
import { ModelResponse, Query } from '../API/Model';
import { AppConfig } from '../App/App';
import Modal from '../UI/Modal';
import CirclePack from './D3CirclePackLayer';
import { d3Hierarchy, VariableDatum } from './d3Hierarchy';


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
  const [selectedNode, setSelectedNode] = useState<
    HierarchyCircularNode | undefined
  >();

  // D3Model is used to expose D3 data and interact with the D3 Layout.
  const [d3Model, setD3Model] = useState<D3Model>(initialD3Model);
  const [d3Layout, setD3Layout] = useState<HierarchyCircularNode>();
  const [formulaString, setFormulaString] = useState<string>('');

  const [showPathologySwitchWarning, setShowPathologySwitchWarning] = useState(
    false
  );
  const [nextPathologyCode, setNextPathologyCode] = useState(''); // TODO: maybe there is a better way... like promise.then() ?

  // select default pathology at start
  useEffect(() => {
    const model = apiModel.state.model;
    if (!model && apiCore.state.pathologies) {
      const defaultPathology = apiCore.state.pathologies[0];
      const datasets = apiCore.datasetsForPathology(defaultPathology.code);
      const newModel = {
        query: { pathology: defaultPathology.code, trainingDatasets: datasets }
      };
      apiModel.setModel(newModel);
    }
  }, [apiCore, apiCore.state.pathologies, apiModel]);

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

  // Utility to convert variables to D3 model
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
  const trainingDatasets =
    apiModel.state.model && apiModel.state.model.query.trainingDatasets;
  useEffect(() => {
    const model = apiModel.state.model;
    const datasets =
      (model && model.query && model.query.trainingDatasets) || [];
    if (selectedNode && selectedNode.data.isVariable) {
      apiMining.multipleHistograms({
        datasets: datasets,
        y: selectedNode.data,
        pathology: (model && model.query && model.query.pathology) || ''
      });
    }
  }, [
    selectedNode,
    apiMining,
    appConfig.mode,
    apiModel.state.model,
    apiMining.state.refetchAlgorithms,
    trainingDatasets
  ]);

  const handleSelectDataset = (dataset: VariableEntity): void => {
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

  // Utility to convert  D3 model to variables
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

  // Update D3 data from interaction with D3 widgets (PackLayer, Model, breadcrumb, search bar)
  const handleUpdateD3Model = (
    type?: ModelType,
    node?: HierarchyCircularNode
  ): void => {
    if (node === undefined) {
      return;
    }
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
            covariables:
              d3Model.covariables &&
              d3Model.covariables.filter(c => c !== node),
            variables: node.leaves()
          };

      setD3Model(nextModel);
      apiModel.setModel(convertD3ModelToModel(nextModel, apiModel.state.model));
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
      apiModel.setModel(convertD3ModelToModel(nextModel, apiModel.state.model));
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
      apiModel.setModel(convertD3ModelToModel(nextModel, apiModel.state.model));
    }
  };

  const handleSelectModel = (nextModel?: ModelResponse): void => {
    if (nextModel && nextModel.slug) {
      apiModel.one(nextModel.slug);
    } else {
      const model = apiModel.state.model;
      if (model) {
        const newModel = { query: { pathology: model.query.pathology } };
        apiModel.setModel(newModel);
      }
    }
  };

  const handleSelectPathology = (code: string): void => {
    setNextPathologyCode(code);
    setShowPathologySwitchWarning(true);
  };

  const handleCancelSwitchPathology = (): void => {
    setShowPathologySwitchWarning(false);
  };

  const handleOKSwitchPathology = (): void => {
    setShowPathologySwitchWarning(false);
    if (apiCore.state.pathologies) {
      const newModel = { query: { pathology: nextPathologyCode } };
      apiModel.setModel(newModel);
    }
  };

  const handleGoToAnalysis = async (): Promise<void> => {
    const { history } = props;
    const nextModel = convertD3ModelToModel(d3Model, apiModel.state.model);
    apiMining.abortMiningRequests();

    const model = {
      ...nextModel,
      query: { ...nextModel.query, formulaString }
    };
    await apiModel.setModel(model);
    history.push(`/review`);
  };

  const nextProps = {
    apiCore,
    apiModel,
    apiMining,
    handleGoToAnalysis,
    handleSelectDataset,
    handleSelectModel,
    handleSelectNode: setSelectedNode,
    handleSelectPathology,
    handleUpdateD3Model,
    histograms: apiMining.state.histograms,
    selectedNode,
    setFormulaString
  };

  return (
    <section>
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
    </section>
  );
};
