import * as d3 from 'd3';

export interface VariableDatum {
  code: string;
  description?: string;
  label: string;
  isVariable?: boolean;
  children?: VariableDatum[];
  type?: string;
}

export type HierarchyNode = d3.HierarchyNode<VariableDatum>;

const hierarchyTransform = (node: any): VariableDatum | undefined =>
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

export const d3Hierarchy = (hierarchy: any): HierarchyNode | undefined => {
  const root = hierarchyTransform(hierarchy);
  const hierarchyNode = root
    ? d3
        .hierarchy(root)
        .sum((d: any) => d.label.length)
        .sort((a: any, b: any) => b.value - a.value)
    : undefined;

  return hierarchyNode;
};
