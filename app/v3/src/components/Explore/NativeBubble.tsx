import * as d3 from "d3";
import React, { Component } from "react";

class NativeBubble extends Component<any> {
  public state = { tree: null };

  private rootNode: any;
  public async componentDidMount() {
    const { apiCore } = this.props;
    await apiCore.load();
    const hierarchy = apiCore.state.hierarchy;
    if (!hierarchy) {
      return;
    }

    const iterate = (node: any): any => {
      //   const r = (Math.random * 600);
      const obj = {
        code: node.code,
        loc: Math.random(),
        r: 1,
        x: 0,
        y: 0
      };

      return node.groups || node.variables
        ? {
            ...obj,
            children: node.groups
              ? node.groups.map((n: any) => iterate(n))
              : node.variables
              ? node.variables.map((n: any) => iterate(n))
              : null
          }
        : obj;
    };

    const tree = {
      children: hierarchy.groups.map((n: any) => iterate(n)),
      code: "/",
      loc: Math.random()
    };

    this.svg(tree);
    this.setState({ tree });
  }

  public render = () => {
    return (
      // tslint:disable jsx-no-lambda
      <div
        ref={(r: any) => {
          this.rootNode = r;
        }}
        style={{ height: "600px", width: "600px" }}
      >
        <svg>
          <g />
        </svg>
      </div>
    );
  };

  private svg = (tree: any) => {
    const root = d3.hierarchy(tree);

    const packLayout = d3.pack();
    packLayout.size([600, 600]);

    root.sum((d: any) => d.value);
    packLayout(root);

    d3.select(this.rootNode)
      .selectAll("circle")
      .data(root.descendants())
      .enter()
      .append("circle")
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y)
      .attr("r", (d: any) => d.r);
  };
}

export default NativeBubble;
