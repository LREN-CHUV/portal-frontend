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
interface Params {
  slug: string;
}
interface Props extends RouteComponentProps<Params> {
  apiCore: APICore;
  apiMining: APIMining;
  apiModel: APIModel;
  appConfig: AppConfig;
}

export const editPath = 'edit';

export default ({
  apiCore,
  apiMining,
  apiModel,
  appConfig,
  ...props
}: Props): JSX.Element => {
  const [selectedDatasets, setSelectedDatasets] = useState<VariableEntity[]>(
    []
  );
  const [d3Layout, setD3Layout] = useState<HierarchyCircularNode>();
  const [selectedNode, setSelectedNode] = useState<
    HierarchyCircularNode | undefined
  >();
  const [d3Model, setD3Model] = useState<D3Model>(initialD3Model);
  const [model, setModel] = useState<ModelResponse | undefined>();

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

  useEffect(() => {
    const slug = props.match.params.slug;
    let draft;
    switch (slug) {
      case undefined:
        setModel(undefined);
        setD3Model(initialD3Model);
        break;

      case editPath:
        draft = apiModel.state.draft;
        if (draft && d3Layout) {
          setModel(draft);
          setD3Model(convertModelToD3Model(draft, d3Layout));
          if (draft.query.trainingDatasets) {
            setSelectedDatasets(draft.query.trainingDatasets);
          }
          if (draft.query.pathology) {
            apiCore.setPathology(draft.query.pathology);
          }
        }
        break;

      default:
        apiModel.one(slug);
        break;
    }
  }, [props.match.params.slug, d3Layout, apiModel]);

  useEffect(() => {
    const next = apiModel.state.model;
    if (next && d3Layout) {
      setModel(next);
      setD3Model(convertModelToD3Model(next, d3Layout));
      if (next.query.trainingDatasets) {
        setSelectedDatasets(next.query.trainingDatasets);
      }
      if (next.query.pathology) {
        apiCore.setPathology(next.query.pathology);
      }
    }
  }, [apiModel.state.model, d3Layout]);

  useEffect(() => {
    const hierarchy = apiCore.state.hierarchy;
    if (hierarchy) {
      const node = d3Hierarchy(hierarchy);
      const bubbleLayout = d3
        .pack<VariableDatum>()
        .size([diameter, diameter])
        .padding(padding);

      const d3layout = node && bubbleLayout(node);
      setD3Layout(d3layout);
    }
  }, [apiCore.state.hierarchy]);

  useEffect(() => {
    if (selectedNode && selectedNode.data.isVariable && selectedDatasets) {
      if (appConfig.mode === 'local') {
        apiMining.histograms({
          payload: {
            datasets: selectedDatasets.map(d => ({ code: d.code })),
            variables: [{ code: selectedNode.data.code }]
          }
        });
      } else {
        apiMining.exaremeHistograms({
          datasets: selectedDatasets,
          x: selectedNode.data,
          pathology: apiCore.state.pathology || ''
        });
      }
    }
  }, [selectedNode, selectedDatasets, apiMining, appConfig]);

  const handleSelectDataset = (dataset: VariableEntity) => {
    const nextSelection = selectedDatasets
      .map(d => d.code)
      .includes(dataset.code)
      ? [...selectedDatasets.filter(d => d.code !== dataset.code)]
      : [...selectedDatasets, dataset];
    setSelectedDatasets(nextSelection);
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
      trainingDatasets: selectedDatasets,
      variables:
        (aD3Model.variables &&
          aD3Model.variables.map(v => ({ code: v.data.code }))) ||
        []
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

  // useEffect(() => console.log(selectedDatasets), [selectedDatasets]);

  const handleSelectModel = (newModel?: ModelResponse) => {
    const { history } = props;
    if (newModel && newModel.slug) {
      history.push(`/explore/${newModel.slug}`);
    } else {
      history.push(`/explore`);
    }
  };

  const handleSelectPathology = async (code: string) => {
    // FIXME: handle that smoothly
    // FIXME: display warning to the user
    // const { history } = props;
    // history.push(`/explore`);
    await apiCore.setPathology(code);
    // await setSelectedDatasets([]);
    // await setModel(undefined);
    // await setD3Model(initialD3Model);
  };

  const handleGoToAnalysis = async () => {
    const { history } = props;
    const nextModel = convertD3ModelToModel(d3Model, model);

    await apiModel.setDraft(nextModel);
    history.push(`/review/${editPath}`);
  };

  const nextProps = {
    apiCore,
    apiModel,
    datasets: apiCore.state.datasets,
    handleGoToAnalysis,
    handleSelectDataset,
    handleSelectModel,
    handleSelectNode: setSelectedNode,
    handleSelectPathology,
    handleUpdateD3Model,
    histograms: apiMining.state.histograms,
    selectedDatasets,
    selectedNode,
    selectedPathology: apiCore.state.pathology
  };

  return (
    <>
      {d3Layout && (
        <CirclePack layout={d3Layout} d3Model={d3Model} {...nextProps} />
      )}
    </>
  );
};
