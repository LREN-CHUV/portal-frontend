// tslint:disable:no-console
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import React, { Component } from "react";
import { ExploreContainer } from "../containers";

import "./Graph.css";

cytoscape.use(coseBilkent);

const style: cytoscape.CssStyleDeclaration = [
  {
    selector: "node",
    style: {
      "background-color": "#ad1a66",
      color: "#fff",
      label: "data(label)",
      padding: 5,
      shape: "roundrectangle",
      "text-halign": "center",
      "text-valign": "center",
      width: "label"
    }
  },
  {
    selector: "node[level = 0]",
    style: {
      "border-color": "#0",
      "border-opacity": 0.6,
      "border-width": 2
    }
  },
  {
    selector: "node[type = 0]",
    style: {
      "background-color": "#fff",
      color: "#000"
    }
  },
  {
    selector: "node[type = 1]",
    style: {
      "background-color": "#FFC72C",
      color: "#000"
    }
  },
  {
    selector: "node[type = 2]",
    style: {
      "background-color": "#CCC00F",
      color: "#fff",
      "line-color": "#ad1a66"
    }
  },
  {
    selector: "node[type = 3]",
    style: {
      "background-color": "#999558",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 4]",
    style: {
      "background-color": "#6CB3FF",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 5]",
    style: {
      "background-color": "#F23D7F",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 6]",
    style: {
      "background-color": "#C5935F",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 7]",
    style: {
      "background-color": "#FF00E2",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 8]",
    style: {
      "background-color": "#CD263D",
      color: "#fff"
    }
  },
  {
    selector: "[type = 9]",
    style: {
      "background-color": "#F2C438",
      color: "#000",
      "line-color": "#F2C438"
    }
  },
  {
    selector: "node[type = 10]",
    style: {
      "background-color": "#654B85",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 11]",
    style: {
      "background-color": "#F23D7F",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 12]",
    style: {
      "background-color": "#40A819",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 13]",
    style: {
      "background-color": "#6A64FF",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 14]",
    style: {
      "background-color": "#73B910",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 15]",
    style: {
      "background-color": "#1A535C",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 16]",
    style: {
      "background-color": "#4ECDC4",
      color: "#fff"
    }
  },
  {
    selector: "node[type = 17]",
    style: {
      "background-color": "#F7FFF7",
      color: "#000"
    }
  },
  {
    selector: "node[type = 18]",
    style: {
      "background-color": "#FF6B6B",
      color: "#fff"
    }
  },
  {
    selector: "edge",
    style: {
      "line-color": "#ad1a66",
      width: 3
    }
  },
  {
    selector: "edge[type = 0]",
    style: {
      "line-color": "#fff",
      shape: "triangle"
    }
  },
  {
    selector: "edge[type = 1]",
    style: {
      "line-color": "#FFC72C"
    }
  },
  {
    selector: "edge[type = 2]",
    style: {
      "line-color": "#CCC00F"
    }
  },
  {
    selector: "edge[type = 3]",
    style: {
      "line-color": "#999558"
    }
  },
  {
    selector: "edge[type = 4]",
    style: {
      "line-color": "#6CB3FF"
    }
  },
  {
    selector: "edge[type = 5]",
    style: {
      "line-color": "#F23D7F"
    }
  },
  {
    selector: "edge[type = 6]",
    style: {
      "line-color": "#C5935F"
    }
  },
  {
    selector: "edge[type = 7]",
    style: {
      "line-color": "#FF00E2"
    }
  },
  {
    selector: "edge[type = 8]",
    style: {
      "line-color": "#CD263D"
    }
  },
  {
    selector: "[type = 9]",
    style: {
      "line-color": "#F2C438"
    }
  },
  {
    selector: "edge[type = 10]",
    style: {
      "line-color": "#654B85"
    }
  },
  {
    selector: "edge[type = 11]",
    style: {
      "line-color": "#F23D7F"
    }
  },
  {
    selector: "edge[type = 12]",
    style: {
      "line-color": "#40A819"
    }
  },
  {
    selector: "edge[type = 13]",
    style: {
      "line-color": "#6A64FF"
    }
  },
  {
    selector: "edge[type = 14]",
    style: {
      "line-color": "#73B910"
    }
  },
  {
    selector: "edge[type = 15]",
    style: {
      "line-color": "#1A535C"
    }
  },
  {
    selector: "edge[type = 16]",
    style: {
      "line-color": "#4ECDC4"
    }
  },
  {
    selector: "edge[type = 17]",
    style: {
      "line-color": "#F7FFF7"
    }
  },
  {
    selector: "edge[type = 18]",
    style: {
      "line-color": "#FF6B6B"
    }
  }
];

const layout1 = {
  animate: true,
  componentSpacing: 100,
  coolingFactor: 0.95,
  edgeElasticity: 100,
  fit: true,
  gravity: 0,
  idealEdgeLength: 100,
  initialTemp: 1000,
  minTemp: 1.0,
  name: "cose",
  nestingFactor: 5,
  nodeOverlap: 20,
  nodeRepulsion: 4000000,
  numIter: 1000,
  padding: 50,
  randomize: false,
  refresh: 20
};

const layout2 = {
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: 'end',
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Whether to fit the network view after when done
  fit: true,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Ideal (intra-graph) edge length
  idealEdgeLength: 50,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.5,
  name: "cose-bilkent",
  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  nestingFactor: 0.1,
  // Whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 14500,
  // Maximum number of iterations to perform
  numIter: 100,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: true,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to tile disconnected nodes
  tile: false,
  // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingHorizontal: 10,
  // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingVertical: 10
};

console.log(layout1, layout2);

interface IProps {
  exploreContainer: ExploreContainer;
}

class Graph extends Component<IProps> {
  private cy: any;
  private cyRef: any;
  private createdNode: any;
  private nearestNode: any;

  public async componentDidMount() {
    const { exploreContainer } = this.props;
    await exploreContainer.load();
    const hierarchy = exploreContainer.state.hierarchy;
    if (!hierarchy) {
      return;
    }

    const nodes: any = [];
    const edges: any = [];
    const root = {
      data: {
        code: hierarchy.code,
        id: hierarchy.code,
        label: hierarchy.label,
        type: 0
      }
    };
    nodes.push(root);
    let color = 0;
    const iter = (
      groups: any,
      group: any = {},
      level: number | undefined = undefined
    ) => {
      groups.forEach((g: any) => {
        if (level === 0) {
          ++color;
        }

        if (
          group.code === "brain_anatomy" ||
          group.code === "grey_matter_volume"
        ) {
          ++color;
        }
        if (group.data) {
          group = group.data;
        }

        console.log(g.code, color);
        nodes.push({
          data: {
            code: g.code,
            id: g.code,
            label: g.label,
            level: 0,
            type: color
          }
        });
        if (group.code) {
          edges.push({
            data: {
              id: `${g.code}-${group.code}`,
              source: g.code,
              target: group.code,
              type: color
            }
          });
        }
        if (g.variables) {
          g.variables.forEach((v: any) => {
            nodes.push({
              data: { id: v.code, label: v.label, code: g.code, type: color }
            });
            edges.push({
              data: {
                id: `${v.code}-${g.code}`,
                source: v.code,
                target: g.code,
                type: color
              }
            });
          });
        }

        if (g.groups) {
          iter(g.groups, g);
        }
      });
    };
    iter(hierarchy.groups, root, 0);

    // const { groups, variables } = exploreContainer.state;

    // const vNodes = variables.map(v => ({
    //   data: { id: v.code, label: v.label, /*parent: v.group.code*/ }
    // }));
    // const gNodes: any = [];
    // const mapGroups = (group: any) => {
    //   gNodes.push({
    //     data: { id: group.code, label: group.label }
    //   });
    //   group.groups.map(mapGroups);
    // };
    // groups.groups.map(mapGroups);

    // const edges = variables.map((v: any) => ({
    //   data: {
    //     id: `${v.code}-${v.group.code}`,
    //     source: v.code,
    //     target: v.group.code
    //   }
    // }));

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
      layout: layout2,
      style
    });

    this.cy = cy;
    // cy.on("tap", (evt: any) => {
    //   this.handleTap(evt);
    // });
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
    console.log(nextProps, this.createdNode);
    const cy = this.cy;
    const id = Math.round(Math.random() * 100000);
    if (this.createdNode) {
      const position = this.createdNode.position;
      const newNode = {
        data: {
          id,
          label: nextProps.inputValue
        },
        group: "nodes",
        position
      };
      cy.add(newNode);
      cy.remove(cy.$id(this.createdNode.data.id));

      this.createdNode = newNode;
    }

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

  // private handleTap = (event: any): void => {
  //   console.log("handleTap", event.type);
  //   const cy = this.cy;
  //   const { target } = event;
  //   const id = Math.round(Math.random() * 100000);
  //   if (target === cy) {
  //     const newNode = {
  //       data: {
  //         id,
  //         label: "New task"
  //       },
  //       group: "nodes",
  //       position: event.position
  //     };
  //     cy.add(newNode);
  //     this.createdNode = newNode;
  //   } else if (target.isEdge()) {
  //     cy.remove(target);
  //   } else if (target.isNode()) {
  //     this.createdNode = target;
  //   }
  // };

  private handleDrag = (event: any) => {
    console.log("handleGrab", event.type, this.nearestNode);
    const { target, type } = event;
    const cy = this.cy;

    if (type === "free") {
      cy.removeListener("tapdrag");
      target.style({ "background-color": "gray" });
      if (this.nearestNode) {
        this.nearestNode.style({ "background-color": "gray" });
      }

      return;
    }

    target.style({ "background-color": "cornflowerblue" });
    let handled = false;
    const nodes = cy.nodes();

    const nearestNodeFrom = (p: any, max = 20) => {
      nodes.forEach((n: any) => {
        const p1 = n.position();
        const distance = Math.sqrt(
          Math.pow(p1.x - p.x, 2) + Math.pow(p1.y - p.y, 2)
        );
        n.data("distance", distance); // TODO: n.scratch
      });

      const { ele } = nodes
        .filter((n: any) => n.id() !== target.id())
        .filter(`[distance < '${max}']`)
        .min((n: any) => n.data("distance"));

      return ele;
    };

    cy.on("tapdrag", (evt: any) => {
      const tryNearestNode = nearestNodeFrom(evt.position);
      if (!tryNearestNode || handled) {
        return;
      }

      this.nearestNode = nearestNodeFrom(evt.position);
      this.nearestNode.style({ "background-color": "cornflowerblue" });
      handled = true;

      const s = target.id();
      const t = this.nearestNode.id();
      const id = `${s}${t}`;
      const edges = this.nearestNode.edgesWith(target);

      if (edges.length) {
        cy.remove(edges.shift());
      } else {
        cy.add({
          data: { id, source: s, target: t },
          group: "edges"
        });
      }
    });
  };
}

export default Graph;
