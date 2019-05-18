import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { APICore, APIMining, APIModel } from '../../API';
import { VariableEntity } from '../../API/Core';
import { ModelResponse } from '../../API/Model';
import { d3Hierarchy, VariableDatum } from './d3Hierarchy';
import CirclePack from './D3PackLayer';
import './Explore.css';

const diameter: number = 800;
const padding: number = 1.5;

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

interface Params { slug: string };

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
  const [d3Model, setD3Model] = useState<D3Model>({
    covariables: undefined,
    filters: undefined,
    variable: undefined
  });
  const [model, setModel] = useState<ModelResponse>();

  useEffect(() => {
    const qs = document.location.pathname;
    const slug = qs.split('/').pop();
    if (slug) {
      const m =
        apiModel.state &&
        apiModel.state.models &&
        apiModel.state.models.find(m => m.slug === slug);
      if (m && d3Layout) {
        modelToD3Model(m, d3Layout);
      }
    }
  }, [apiModel.state.models, d3Layout, model]);

  useEffect(() => {
    if (model && d3Layout) {
      modelToD3Model(model, d3Layout);
    }
  }, [d3Layout, model]);

  const modelToD3Model = (
    aModel: ModelResponse,
    aD3Layout: HierarchyCircularNode
  ) => {
    const query = aModel && aModel.query;
    if (query && aD3Layout) {
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
      setD3Model(nextModel);
    }
  };

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

  const handleD3ChangeModel = (
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

  const handleGoToAnalysis = () => {
    const { history } = props;
    const slug = props.match.params.slug;
    if (!slug) {
      history.push(`/v3/review`);
      return;
    }
    history.push(`/v3/review/${slug}`);
  };

  const nextProps = {
    apiModel,
    d3Model,
    datasets,
    handleD3ChangeModel,
    handleGoToAnalysis,
    handleSelectDataset,
    handleSelectModel: setModel,
    handleSelectNode: setSelectedNode,
    histograms: apiMining.state.histograms,
    selectedDatasets,
    selectedNode,
  };

  return d3Layout ? <CirclePack layout={d3Layout} {...nextProps} /> : null;
};
