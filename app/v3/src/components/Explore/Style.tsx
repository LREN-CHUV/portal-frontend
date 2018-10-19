// tslint:disable no-console
import cytoscape from "cytoscape";

const colors = [
  "#e63864",
  "#5dc330",
  "#894adb",
  "#6ac25a",
  "#d144ca",
  "#42c280",
  "#db3890",
  "#4a8a2e",
  "#6d5ec7",
  "#abb83a",
  "#5381e2",
  "#d9a539",
  "#c97bdc",
  "#91811f",
  "#a33e8e",
  "#e0833b",
  "#df659a",
  "#e2462a",
  "#c84450",
  "#b5522c",
  "#ff462a",
  "#ff4450",
  "#ff522c",
  "#ff3864",
  "#ffc330",
  "#ff4adb",
  "#ffc25a",

];

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
      "border-color": "#000",
      "border-opacity": 0.6,
      "border-width": 0,
      color: "#000",
      height: "label",

      label: "data(label)",

      padding: 5,
      shape: "rectangle",
      "text-halign": "center",
      "text-valign": "center",
      width: "label"
    }
  },
  {
    selector: `node[group = 1]`,
    style: {
      color: "white",
      "font-size": "48px",
      "font-weight": "bold",
      height: "label",
      shape: "rectangle",
      "text-halign": "center",
      "text-valign": "center",
      width: "label"
    }
  },

  {
    selector: "node[cluster = 0]",
    style: {
      // "background-color": "#6B6A68",
      "background-color": "darkslateblue",
      color: "white",
      "font-size": "32px",
      "font-weight": "bold",
      height: "88px",
      padding: "10px",
      "text-background-opacity": 0,
      "text-halign": "center",
      "text-valign": "center",
      width: "88px"
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
