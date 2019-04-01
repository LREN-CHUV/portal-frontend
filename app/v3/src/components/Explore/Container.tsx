import './Explore.css';

import { HierarchyCircularNode } from 'd3';
import React, { useEffect, useState } from 'react';

import { MIP } from '../../types';
import { APICore, APIMining } from '../API';
import Explore from './Explore';

interface IProps {
  apiCore: APICore;
  apiMining: APIMining;
}

const fetchHistograms = async ({
  code,
  apiMining
}: {
  code: string;
  apiMining: APIMining;
}) => {
  const datasets = [
    { code: 'ppmi' },
    { code: 'adni' },
    { code: 'edsd' },
    { code: 'clm' }
  ];
  if (code) {
    const payload: {
      datasets: MIP.API.IVariableEntity[];
      variables: MIP.API.IVariableEntity[];
    } = {
      datasets,
      variables: [{ code }]
    };

    await apiMining.histograms({ payload });

    return apiMining.state;
  }
};

const d3Hierarchy = (node: any) => ({
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
});

export default ({ apiCore, apiMining }: IProps) => {
  const [hierarchy, setHierarchy] = useState<
    MIP.Internal.IVariableDatum | undefined
  >(undefined);
  const [histograms, setHistograms] = useState(undefined)  

  useEffect(() => {
    (async () => {
      await apiCore.hierarchy();
      setHierarchy(d3Hierarchy(apiCore.state.hierarchy));
    })();
  }, []);

  const handleSelectVariable = async ({
    node
  }: {
    node: HierarchyCircularNode<MIP.Internal.IVariableDatum>;
  }) => {
    if (node.data.isVariable) {
      const state = await fetchHistograms({ code: node.data.code, apiMining });
      console.log(state);
    }
  };

  return (
    <Explore
      hierarchy={hierarchy}
      histograms={histograms}
      handleSelectVariable={handleSelectVariable}
    />
  );
};
