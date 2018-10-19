// tslint:disable:no-console
import { ExploreContainer } from "@app/containers";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import React, { Component } from "react";
import style from "./Style";

import "./Graph.css";

cytoscape.use(coseBilkent);

const layout = {
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: false,
  // Divisor to compute edge forces
  edgeElasticity: 0.15,
  // Whether to fit the network view after when done
  fit: true,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity force (constant) for compounds
  gravityCompound: 2.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Ideal (intra-graph) edge length
  idealEdgeLength: 50,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.9,
  name: "cose-bilkent",
  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  nestingFactor: 0.5,
  // Whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 15000,
  // Maximum number of iterations to perform
  numIter: 1000,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: false,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to tile disconnected nodes
  tile: false,
  // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingHorizontal: 10,
  // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingVertical: 10
};

interface IProps {
  exploreContainer: ExploreContainer;
}

class Graph extends Component<IProps> {
  private cy: cytoscape.Core;
  private cyRef: any;
  private currentTargetPosition: cytoscape.Position;
  private selectedTarget: cytoscape.NodeDefinition | undefined;

  public async componentDidMount() {
    const { exploreContainer } = this.props;
    await exploreContainer.load();
    const hierarchy = exploreContainer.state.hierarchy;
    if (!hierarchy) {
      return;
    }

    const nodes: any = [];
    const edges: any = [];
    let cluster = 0

    // const root = {
    //   data: {
    //     cluster,
    //     code: hierarchy.code,
    //     id: hierarchy.code,
    //     label: hierarchy.label
    //   }
    // };
    // nodes.push(root);
    
    const iter = (
      groups: any,
      parentGroup: any = {},
    ) => {
      groups.forEach((group: any) => {
        ++cluster;
        parentGroup.cluster = cluster;

        if (parentGroup.data) {
          parentGroup = parentGroup.data;
        }

        nodes.push({
          data: {
            cluster,
            code: group.code,
            group: 1,
            id: group.code,
            label: group.label
          }
        });

        if (parentGroup.code) {
          edges.push({
            data: {
              cluster: parentGroup.cluster || 0,
              id: `${parentGroup.code}-${group.code}`,
              source: parentGroup.code,
              target: group.code
            }
          });
        }

        if (group.variables) {
          group.variables.forEach((v: any) => {
            nodes.push({
              data: {
                cluster,
                code: group.code,
                id: v.code,
                label: v.label
              }
            });
            edges.push({
              data: {
                cluster,
                id: `${v.code}-${group.code}`,
                source: v.code,
                target: group.code
              }
            });
          });
        }

        if (group.groups) {
          iter(group.groups, group);
        }
      });
    };
    nodes.push(iter(hierarchy.groups));

    // console.log(gNodes, vNodes);
    const elements = {
      edges,
      nodes
    };

    const cy = cytoscape({
      autounselectify: true,
      boxSelectionEnabled: false,
      container: this.cyRef,
      elements,
      layout,
      style
    });

    this.cy = cy;
    cy.on("tap", (evt: any) => {
      this.handleTap(evt);
    });
    cy.on("grabon", (evt: any) => {
      this.handleDrag(evt);
    });
    cy.on("free", (evt: any) => {
      this.handleDrag(evt);
    });
  }

  public componentWillUnmount() {
    if (this.cy) {
      this.cy.destroy();
    }
  }

  public shouldComponentUpdate(nextProps: any, nextState: any) {
    return false;
  }

  public render() {
    return (
      <div>
        <div
          className="graph"
          ref={(cy: any) => {
            this.cyRef = cy;
          }}
          style={{
            display: "block",
            height: "100%",
            width: "100%"
          }}
        />
      </div>
    );
  }
  private handleTap = (event: any): void => {
    // console.log("handleTap", event.type);
    const { target } = event;
    const cy = this.cy;

    if (target === this.cy || target === this.selectedTarget) {
      this.selectedTarget = undefined;
      cy.elements().removeClass("dimmed");

      return;
    }

    if (target.isNode()) {
      this.selectedTarget = target;

      const selectChildsElements = (t: any) =>
        t.id() === "/"
          ? cy
              .elements()
              .difference(
                t.connectedEdges().union(t.connectedEdges().connectedNodes())
              )
          : cy
              .elements()
              .difference(t.successors().union(t.predecessors()))
              .difference(t);

      const selectedChilds = selectChildsElements(target);
      cy.elements().removeClass("dimmed");
      selectedChilds.addClass("dimmed");
    }
    // console.log(this.foldedNodes);
  };

  private handleDrag = (event: any) => {
    // console.log("handleGrab", event.type);
    const { target, type } = event;
    const cy = this.cy;

    if (type === "free") {
      cy.removeListener("tapdrag");

      return;
    }

    if (target === this.cy) {
      return;
    }

    this.currentTargetPosition = event.position;
    const collection = target.successors();
    collection.map((c: any) => {
      c.scratch()._x = c.position().x;
      c.scratch()._y = c.position().y;

      return c;
    });

    cy.on("tapdrag", (evt: any) => {
      const moveX = evt.position.x - this.currentTargetPosition.x;
      const moveY = evt.position.y - this.currentTargetPosition.y;

      collection.positions((c: any) => {
        const x = c.scratch()._x + moveX;
        const y = c.scratch()._y + moveY;

        return { x, y };
      });
    });
  };
}

export default Graph;
