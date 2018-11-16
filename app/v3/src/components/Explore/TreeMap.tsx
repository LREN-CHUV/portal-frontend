// tslint:disable:no-console
import { APICore } from "@app/components/API";
import { ResponsiveTreeMap } from "@nivo/treemap";
import React, { Component } from "react";

interface IProps {
  apiCore: APICore;
}

class TreeMap extends Component<IProps, any> {
  public state = { tree: null };
  public async componentDidMount() {
    const { apiCore } = this.props;
    await apiCore.hierarchy();
    const hierarchy = apiCore.state.hierarchy;
    if (!hierarchy) {
      return;
    }
    const iterate = (node: any): any => {
      const obj = {
        code: node.code,
        description: node.description,
        loc: Math.random() * 1000
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
      loc: 34556
    };

    this.setState({ tree });
  }

  public render() {
    const { tree } = this.state;

    if (!tree) {
      return <div>Loading</div>;
    }
    return (
      <div style={{ height: "900px", width: "900px" }}>
        <ResponsiveTreeMap
          root={tree}
          margin={{
            bottom: 20,
            left: 20,
            right: 20,
            top: 20
          }}
          identity="code"
          value="loc"
          colorBy="depth"
          innerPadding={3}
          outerPadding={3}
          // tslint:disable-next-line jsx-no-lambda
          label={(d: any) => d.id}
          labelSkipRadius={0}
          labelTextColor="inherit:darker(0.8)"
          borderWidth={2}
          borderColor="inherit:darker(0.3)"
          animate={true}
          motionStiffness={300}
          motionDamping={30}
        />
      </div>
    );
  }
}

export default TreeMap;
