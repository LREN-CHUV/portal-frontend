import './Explore.css';

import { HierarchyCircularNode } from 'd3';
import React, { useEffect, useState } from 'react';

import { MIP } from '../../types';
import { APICore } from '../API';
import Explore from './Explore';

interface IProps {
  apiCore: APICore;
}

const handleSelectVariable = (
  node: HierarchyCircularNode<MIP.Internal.IVariableDatum>
) => {
  console.log('handleSelectVariable', node);
};

export default ({ apiCore }: IProps) => {
  const [hierarchy, setHierarchy] = useState<
    MIP.Internal.IVariableDatum | undefined
  >(undefined);
  const d3Hierarchy = (node: any) => ({
    children: [
      ...((node.groups && node.groups.map(d3Hierarchy)) || []),
      ...((node.variables &&
        node.variables.map((v: any) => ({
          code: v.code,
          description: v.description,
          label: v.label
        }))) ||
        [])
    ],
    code: node.code,
    description: node.description,
    label: node.label
  });

  useEffect(() => {
    (async () => {
      await apiCore.hierarchy();
      setHierarchy(d3Hierarchy(apiCore.state.hierarchy));
    })();
  }, []);

  return (
    <Explore
      hierarchy={hierarchy}
      handleSelectVariable={handleSelectVariable}
    />
  );
};
