const fs = require("fs");
const data = fs.readFileSync("oldvariables.json", "utf8");
const json = JSON.parse(data);

let newJson;

const randomDatasets = datasets =>
  [...Array(parseInt(Math.random() * datasets.length + 1)).keys()]
    .map(() => datasets[parseInt(Math.random() * datasets.length)])
    .filter((v, index, self) => self.indexOf(v) === index);

if (process.argv[2] === "random") {
  // all random variables and datasets with uniques values
  const datasets = ["CHUV1", "CHUV2", "CHUV3", "CHUV4", "CHUV5"];
  newJson = json.map(o => ({ ...o, datasets: [...randomDatasets(datasets)] }));
} else {
  // 1st dataset - all variables
  newJson = json.map(o => ({ ...o, datasets: ["CHUV1"] }));

  // 2nd dataset - all expect some identified variables
  const notInDataset2 = [
    "rightsmcsupplementarymotorcortex",
    "leftsmcsupplementarymotorcortex",
    "righttrifgtriangularpartoftheinferiorfrontalgyrus",
    "leftpinsposteriorinsula",
    "rightventraldc"
  ];
  newJson = newJson.map(o => ({
    ...o,
    datasets: notInDataset2.includes(o.code)
      ? o.datasets
      : o.datasets.concat("CHUV2")
  }));

  // 3rd dataset - 2nd - some identifed vars
  const notInDataset3 = [
    "alzheimerbroadcategory",
    "parkinsonbroadcategory",
    "neurogenerativescategories",
    "adnicategory",
    "edsdcategory"
  ].concat(notInDataset2);

  newJson = newJson.map(o => ({
    ...o,
    datasets: notInDataset3.includes(o.code)
      ? o.datasets
      : o.datasets.concat("CHUV3")
  }));

  // 4th = 2nd - 2 vars + 3rd - 1 var
  const addInDataset4 = [
    "rightsmcsupplementarymotorcortex",
    "leftsmcsupplementarymotorcortex",
    "neurogenerativescategories"
  ];

  newJson = newJson.map(o => ({
    ...o,
    datasets: (o.datasets.includes("CHUV2") && o.datasets.includes("CHUV3")) ||
      !addInDataset4.includes(o.code)
      ? o.datasets.concat("CHUV4")
      : o.datasets
  }));

  // 5 random
  newJson = newJson.map(o => ({
    ...o,
    datasets: Math.random() > 0.5 ? o.datasets.concat("CHUV5") : o.datasets
  }));
}

fs.writeFileSync(
  "../app/scripts/app/mock/variables.json",
  JSON.stringify(newJson),
  "utf8"
);
