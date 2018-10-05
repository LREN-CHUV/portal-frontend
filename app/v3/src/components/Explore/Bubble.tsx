// tslint:disable:no-console
import { ExploreContainer } from "@app/containers";
import { Bubble } from "@nivo/circle-packing";
import React, { Component } from "react";

interface IProps {
  exploreContainer: ExploreContainer;
}

const root = {
  children: [
    {
      children: [
        {
          children: [
            { color: "hsl(100, 70%, 50%)", loc: 39135, name: "chart" },
            { color: "hsl(226, 70%, 50%)", loc: 117402, name: "xAxis" },
            { color: "hsl(253, 70%, 50%)", loc: 54027, name: "yAxis" }
          ],
          color: "",
          name: "stack"
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      color: "hsl(95, 70%, 50%)",
                      loc: 103257,
                      name: "outline"
                    },
                    {
                      color: "hsl(248, 70%, 50%)",
                      loc: 162343,
                      name: "slices"
                    },
                    {
                      color: "hsl(114, 70%, 50%)",
                      loc: 75507,
                      name: "bbox"
                    }
                  ],
                  color: "hsl(122, 70%, 50%)",

                  name: "pie"
                },
                {
                  color: "hsl(151, 70%, 50%)",
                  loc: 190216,
                  name: "donut"
                },
                {
                  color: "hsl(103, 70%, 50%)",
                  loc: 28041,
                  name: "gauge"
                }
              ],
              color: "hsl(94, 70%, 50%)",
              name: "chart"
            },
            { name: "legends", color: "hsl(4, 70%, 50%)", loc: 115480 }
          ],
          color: "hsl(210, 70%, 50%)",
          name: "pie"
        }
      ],
      color: "hsl(261, 70%, 50%)",
      name: "viz"
    },
    {
      children: [
        { color: "hsl(116, 70%, 50%)", loc: 60128, name: "rgb" },
        { color: "hsl(282, 70%, 50%)", loc: 59547, name: "hsl" }
      ],
      color: "hsl(235, 70%, 50%)",
      name: "colors"
    },
    {
      children: [
        { color: "hsl(219, 70%, 50%)", loc: 139014, name: "randomize" },
        { color: "hsl(152, 70%, 50%)", loc: 99962, name: "resetClock" },
        { color: "hsl(206, 70%, 50%)", loc: 186256, name: "noop" }
      ],
      color: "hsl(68, 70%, 50%)",
      name: "utils"
    }
  ],
  color: "hsl(21, 70%, 50%)",
  name: "nivo"
};

class Circle extends Component<IProps, any> {
  public state = { tree: null };
  public async componentDidMount() {
    const { exploreContainer } = this.props;
    await exploreContainer.load();
    const hierarchy = exploreContainer.state.hierarchy;
    if (!hierarchy) {
      return;
    }
    // const iterate = ((node:any): any => {
    //   const obj = {
    //     code: "node.code",
    //     color: "hsl(317, 70%, 50%)",
    //     loc: 1234
    //   };

    //   return (node.groups || node.variables) ? ({
    //     ...obj, 
    //     children: node.groups ? iterate(node.groups) : (node.variables ? iterate(node.variables) : null)
    //   }) : obj;
    // });

    // const root = {
    //   children: (hierarchy.groups.map(n => iterate(n))),
    //   code: '/',
    //   color: "hsl(317, 70%, 50%)",
    //   loc: 34556
    // };
    // console.log(root);
    this.setState({ tree: root });
  }

  public render() {
    const { tree } = this.state;
    if (!tree) {
      return <div>Loading</div>;
    }
    return (
      <Bubble
        width={900}
        height={500}
        root={{tree}}
        identity="name"
        value="loc"
        label="name"
        labelSkipRadius={16}
      />
    );
  }
}

export default Circle;
