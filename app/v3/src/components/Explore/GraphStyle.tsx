// tslint:disable no-console
import cytoscape from "cytoscape";

const colors = ["#4bd0e3",
"#396ced",
"#4cd2c3",
"#3c62c6",
"#229689",
"#628df2",
"#47b4b5",
"#1f64b7",
"#20d8fd",
"#3c5da0",
"#1db5c7",
"#587ad3",
"#4abfe8",
"#505b8f",
"#72bae8",
"#4572ae",
"#1da4cc",
"#829ce5",
"#3585b0",
"#3295e9",
"#98aae1",
"#3ba7e5",
"#848dc5",
"#6da8ec",
"#5d8ccb"]

const clusterNodeColors = (color: string, i: number) => ({
  selector: `node[cluster = ${i}]`,
  style: {
    "background-color": color
  }
});

const clusterEdgeColors = (color: string, i: number) => ({
  selector: `edge[cluster = ${i}]`,
  style: {
    "line-color": color
  }
});

const clusters = [
  ...colors.map(clusterNodeColors),
  ...colors.map(clusterEdgeColors)
]; // .concat((colors.map(clusterColors), 'edge'))

const style: cytoscape.CssStyleDeclaration = [
  {
    selector: "node",
    style: {
      "background-color": "white",
      "border-width": 0,
      color: "#000",
      height: "label",
      label: "data(label)",
      padding: 5,
      shape: "roundrectangle",
      "text-halign": "center",
      "text-valign": "center",
      width: "label"
    }
  },
  {
    selector: `node[isGroup = 1]`,
    style: {
      color: "white",
      "font-size": "48px",
      "font-weight": "bold",
    }
  },
  {
    selector: `node[isRoot = 1]`,
    style: {
      "border-width": 2,
      color: "black",
      padding: 15,
    }
  },
  {
    selector: "edge",
    style: {
      "line-color": "#ccc",
      width: 5
    }
  },
  ...clusters,
  {
    selector: "node.dimmed",
    style: {
      "background-color": "gray",
      "background-image-opacity": 0.2,
      opacity: 0.4
    }
  },
  {
    selector: "edge.dimmed",
    style: {
      opacity: 0.1
    }
  }
];

export default style;
