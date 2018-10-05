import ResponsiveBubble from "@nivo/circle-packing";
import React, { Component } from "react";
import data from "./data";

class Bubble extends Component<any> {
  public render() {
    return (
      <ResponsiveBubble
        data={data}
        margin={{
          bottom: 20,
          left: 20,
          right: 20,
          top: 20
        }}
        identity="name"
        value="loc"
        colors="nivo"
        colorBy="depth"
        padding={6}
        labelTextColor="inherit:darker(0.8)"
        borderWidth={2}
        defs={[
          {
            background: "none",
            color: "inherit",
            id: "lines",
            lineWidth: 5,
            rotation: -45,
            spacing: 8,
            type: "patternLines"
          }
        ]}
        fill={[
          {
            id: "lines",
            match: {
              depth: 1
            }
          }
        ]}
        animate={true}
        motionStiffness={90}
        motionDamping={12}
      />
    );
  }
}

export default Bubble;
