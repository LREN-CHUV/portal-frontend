import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { APICore, APIMining, APIModel } from '../../API';
import { VariableEntity } from '../../API/Core';
import { ModelResponse, Query } from '../../API/Model';
import { d3Hierarchy, VariableDatum } from './d3Hierarchy';
import CirclePack from './D3PackLayer';
import './Explore.css';

const diameter: number = 800;
const padding: number = 1.5;

const initialD3Model = {
  covariables: undefined,
  filters: undefined,
  variable: undefined
};

export type HierarchyCircularNode = d3.HierarchyCircularNode<VariableDatum>;

export interface D3Model {
  covariables: HierarchyCircularNode[] | undefined;
  filters: HierarchyCircularNode[] | undefined;
  variable: HierarchyCircularNode | undefined;
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
}

export default ({ apiCore, apiMining, apiModel, ...props }: Props) => {
  const [datasets, setDatasets] = useState<VariableEntity[]>();
  const [selectedDatasets, setSelectedDatasets] = useState<VariableEntity[]>(
    []
  );
  const [d3Layout, setD3Layout] = useState<HierarchyCircularNode>();
  const [selectedNode, setSelectedNode] = useState<
    HierarchyCircularNode | undefined
  >();
  const [d3Model, setD3Model] = useState<D3Model>(initialD3Model);
  const [model, setModel] = useState<ModelResponse | undefined>();

  useEffect(() => {
    const slug = props.match.params.slug;
    console.log(slug)
    if (!slug) {
      setModel(undefined);
      setD3Model(initialD3Model);

      return;
    }

    if (slug !== 'edit') {
      apiModel.one(slug);
    } else {
      const draft = apiModel.state.draft;
      console.log(draft, d3Layout)
      if (draft && d3Layout) {
        setModel(draft);
        setD3Model(convertModelToD3Model(draft, d3Layout));
      }
    }
  }, [props.match.params.slug]);

  useEffect(() => {
    const next = apiModel.state.model;
    if (next && d3Layout) {
      setModel(next);
      setD3Model(convertModelToD3Model(next, d3Layout));
    }
  }, [apiModel.state.model]);

  useEffect(() => {
    const d = apiCore.state.datasets;
    if (d) {
      setDatasets(d);
      setSelectedDatasets(d);
    }
  }, [apiCore.state.datasets]);

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

  const handleUpdateD3Model = (
    type: ModelType,
    node: HierarchyCircularNode
  ) => {
    if (type === ModelType.VARIABLE) {
      const nextModel =
        d3Model.variable === node
          ? { ...d3Model, variable: undefined }
          : {
              ...d3Model,
              covariables:
                d3Model.covariables &&
                d3Model.covariables.filter(c => c !== node),
              variable: node
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
            variable:
              d3Model.variable && node.leaves().includes(d3Model.variable)
                ? undefined
                : d3Model.variable
          }
        : {
            ...d3Model,
            covariables: node.leaves(),
            variable:
              d3Model.variable && node.leaves().includes(d3Model.variable)
                ? undefined
                : d3Model.variable
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

  const convertModelToD3Model = (
    aModel: ModelResponse,
    aD3Layout: HierarchyCircularNode
  ): D3Model => {
    const query = aModel && aModel.query;
    const nextModel = {
      covariables:
        query.coVariables &&
        aD3Layout
          .descendants()
          .filter(l =>
            query.coVariables!.map(c => c.code).includes(l.data.code)
          ),
      filters: undefined,
      groupings: undefined,
      variable:
        query.variables &&
        aD3Layout
          .descendants()
          .find(l => l.data.code === query.variables![0].code)
    };
    return nextModel;
  };

  const convertD3ModelToModel = (
    aD3Model: D3Model,
    aModel?: ModelResponse
  ): ModelResponse => {
    const query: Query = {
      coVariables:
        aD3Model.covariables && aD3Model.covariables.map(v => v.data),
      // filterVariables: aD3Model.filters && aD3Model.filters.map(v => v.data),
      filters: '',
      groupings: undefined,
      trainingDatasets: selectedDatasets,
      variables: aD3Model.variable && [aD3Model.variable.data]
    };

    if (aModel) {
      aModel.parentSlug = aModel.slug;
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

  const handleSelectModel = (newModel?: ModelResponse) => {
    const { history } = props;
    if (newModel && newModel.slug) {
      history.push(`/v3/explore/${newModel.slug}`);
    } else {
      history.push(`/v3/explore`);
    }
  };

  const handleGoToAnalysis = async () => {
    const { history } = props;

    const slug = props.match.params.slug;
    const nextModel = convertD3ModelToModel(d3Model, model);

    if (slug) {
      await apiModel.update({ model: nextModel });
      history.push(`/v3/review/${slug}`);
    } else {
      await apiModel.setDraft(nextModel);
      history.push(`/v3/review/edit`);
    }
  };

  const nextProps = {
    apiModel,
    d3Model,
    datasets,
    handleGoToAnalysis,
    handleSelectDataset,
    handleSelectModel,
    handleSelectNode: setSelectedNode,
    handleUpdateD3Model,
    histograms: apiMining.state.histograms,
    selectedDatasets,
    selectedNode
  };

  return d3Layout ? <CirclePack layout={d3Layout} {...nextProps} /> : null;
};
