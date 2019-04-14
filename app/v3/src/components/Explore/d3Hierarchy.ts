import * as d3 from 'd3';
import { MIP } from '../../types';

const hierarchyTransform = (node: any): MIP.Internal.IVariableDatum | undefined =>
  node
    ? {
        children: [
          ...((node.groups && node.groups.map(hierarchyTransform)) || []),
          ...((node.variables &&
            node.variables.map((v: any) => ({
              code: v.code,
              description: v.description,
              isVariable: true,
              label: v.label,
              type: v.type
            }))) ||
            [])
        ],
        code: node.code,
        description: node.description,
        label: node.label,
        type: node.type
      }
    : undefined;

export default (hierarchy: any) => {
  const root = hierarchyTransform(hierarchy);
  const hierarchyNode = root
    ? d3
        .hierarchy(root)
        .sum((d: any) =>
          d.label ? Math.round(Math.random() * 3) + d.label.length : 1
        )
        .sort((a: any, b: any) => b.value - a.value)
    : undefined;

  return hierarchyNode;
};
