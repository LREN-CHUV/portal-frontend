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
  const datasets = ["chuv", "brescia", "plovdiv", "adni", "ppmi"];
  newJson = json.map(o => ({ ...o, datasets: [...randomDatasets(datasets)] }));
} else {
  // 1st dataset - all variables
  newJson = json.map(o => ({ ...o, datasets: ["chuv"] }));

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
      : o.datasets.concat("brescia")
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
      : o.datasets.concat("plovdiv")
  }));

  // 4th = 2nd - 2 vars + 3rd - 1 var
  const addInDataset4 = [
    "rightsmcsupplementarymotorcortex",
    "leftsmcsupplementarymotorcortex",
    "neurogenerativescategories"
  ];

  newJson = newJson.map(o => ({
    ...o,
    datasets: (o.datasets.includes("adni") && o.datasets.includes("chuv")) ||
      !addInDataset4.includes(o.code)
      ? o.datasets.concat("adni")
      : o.datasets
  }));

  // 5 random
  newJson = newJson.map(o => ({
    ...o,
    datasets: Math.random() > 0.5 ? o.datasets.concat("ppmi") : o.datasets
  }));
}

fs.writeFileSync(
  "../app/scripts/app/mock/variables.json",
  JSON.stringify(newJson),
  "utf8"
);
