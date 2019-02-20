const models = [
  {
    slug: "regression1",
    title: "regression1",
    valid: true,
    createdAt: 1540561037000,
    query: {
      filters: "",
      variables: [{ code: "lefthippocampus" }],
      coVariables: [{ code: "alzheimerbroadcategory" }],
      groupings: [],
      trainingDatasets: [{ code: "fbf" }, { code: "adni" }, { code: "clm" }],
      testingDatasets: [],
      validationDatasets: [{ code: "ppmi" }, { code: "edsd" }]
    },
    dataset: {
      code: "DS1540825503020",
      header: [],
      grouping: [],
      variable: [],
      data: {}
    },
    config: {
      type: null,
      height: null,
      yAxisVariables: [],
      xAxisVariable: null,
      hasXAxis: null,
      title: { text: "regression1" }
    },
    createdBy: {
      username: "anonymous",
      fullname: "anonymous",
      picture: "images/users/default_user.png",
      languages: [],
      roles: [],
      votedApps: []
    }
  },
  {
    slug: "regression2",
    title: "regression2",
    valid: true,
    createdAt: 1540561037000,
    query: {
      filters: "",
      variables: [{ code: "subjectageyears" }],
      coVariables: [{ code: "lefthippocampus" }, { code: "righthippocampus" }],
      groupings: [],
      trainingDatasets: [{ code: "fbf" }, { code: "adni" }, { code: "clm" }],
      testingDatasets: [],
      validationDatasets: [{ code: "ppmi" }, { code: "edsd" }]
    },
    dataset: {
      code: "DS1540825503020",
      header: [],
      grouping: [],
      variable: [],
      data: {}
    },
    config: {
      type: null,
      height: null,
      yAxisVariables: [],
      xAxisVariable: null,
      hasXAxis: null,
      title: { text: "regression2" }
    },
    createdBy: {
      username: "anonymous",
      fullname: "anonymous",
      picture: "images/users/default_user.png",
      languages: [],
      roles: [],
      votedApps: []
    }
  },
  {
    slug: "classification1",
    title: "classification1",
    valid: true,
    createdAt: 1540561037000,
    query: {
      filters: "",
      variables: [{ code: "alzheimerbroadcategory" }],
      coVariables: [{ code: "lefthippocampus" }],
      groupings: [],
      trainingDatasets: [{ code: "fbf" }, { code: "adni" }, { code: "clm" }],
      testingDatasets: [],
      validationDatasets: [{ code: "ppmi" }, { code: "edsd" }]
    },
    dataset: {
      code: "DS1540825503020",
      header: [],
      grouping: [],
      variable: [],
      data: {}
    },
    config: {
      type: null,
      height: null,
      yAxisVariables: [],
      xAxisVariable: null,
      hasXAxis: null,
      title: { text: "classification1" }
    },
    createdBy: {
      username: "anonymous",
      fullname: "anonymous",
      picture: "images/users/default_user.png",
      languages: [],
      roles: [],
      votedApps: []
    }
  },
  {
    slug: "regression3",
    title: "regression3",
    valid: true,
    createdAt: 1540561037000,
    query: {
      filters:
        '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"50"},{"condition":"OR","rules":[{"id":"alzheimerbroadcategory","field":"alzheimerbroadcategory","type":"string","input":"select","operator":"equal","value":"AD"},{"id":"alzheimerbroadcategory","field":"alzheimerbroadcategory","type":"string","input":"select","operator":"equal","value":"CN"}]}],"valid":true}',
      variables: [{ code: "righthippocampus" }],
      coVariables: [{ code: "subjectageyears" }],
      groupings: [{ code: "alzheimerbroadcategory" }],
      trainingDatasets: [{ code: "fbf" }, { code: "adni" }, { code: "clm" }],
      testingDatasets: [],
      validationDatasets: []
    },
    dataset: {
      code: "DS1540825503020",
      header: [],
      grouping: [],
      variable: [],
      data: {}
    },
    config: {
      type: null,
      height: null,
      yAxisVariables: [],
      xAxisVariable: null,
      hasXAxis: null,
      title: { text: "regression3" }
    },
    createdBy: {
      username: "anonymous",
      fullname: "anonymous",
      picture: "images/users/default_user.png",
      languages: [],
      roles: [],
      votedApps: []
    }
  },
  {
    slug: "histogram1",
    title: "histogram1",
    valid: true,
    createdAt: 1540561037000,
    query: {
      filters: "",
      variables: [{ code: "lefthippocampus" }],
      coVariables: [{ code: "subjectageyears" }],
      groupings: [{ code: "gender" }, { code: "alzheimerbroadcategory" }],
      trainingDatasets: [{ code: "fbf" }, { code: "clm" }],
      testingDatasets: [],
      validationDatasets: []
    },
    dataset: {
      code: "DS1540825503020",
      header: [],
      grouping: [],
      variable: [],
      data: {}
    },
    config: {
      type: null,
      height: null,
      yAxisVariables: [],
      xAxisVariable: null,
      hasXAxis: null,
      title: { text: "histogram1" }
    },
    createdBy: {
      username: "anonymous",
      fullname: "anonymous",
      picture: "images/users/default_user.png",
      languages: [],
      roles: [],
      votedApps: []
    }
  },
  {
    slug: "classification2",
    title: "classification2",
    valid: true,
    createdAt: 1540561037000,
    query: {
      filters:
        '{"condition":"AND","rules":[{"id":"subjectageyears","field":"subjectageyears","type":"integer","input":"number","operator":"greater","value":"50"},{"condition":"OR","rules":[{"id":"alzheimerbroadcategory","field":"alzheimerbroadcategory","type":"string","input":"select","operator":"equal","value":"AD"},{"id":"alzheimerbroadcategory","field":"alzheimerbroadcategory","type":"string","input":"select","operator":"equal","value":"CN"}]}],"valid":true}',
      variables: [
        { code: "righthippocampus" },
        { code: "rightententorhinalarea" }
      ],
      coVariables: [{ code: "subjectageyears" }],
      groupings: [{ code: "alzheimerbroadcategory" }],
      trainingDatasets: [{ code: "fbf" }, { code: "adni" }, { code: "clm" }],
      testingDatasets: [],
      validationDatasets: []
    },
    dataset: {
      code: "DS1540825503020",
      header: [],
      grouping: [],
      variable: [],
      data: {}
    },
    config: {
      type: null,
      height: null,
      yAxisVariables: [],
      xAxisVariable: null,
      hasXAxis: null,
      title: { text: "classification2" }
    },
    createdBy: {
      username: "anonymous",
      fullname: "anonymous",
      picture: "images/users/default_user.png",
      languages: [],
      roles: [],
      votedApps: []
    }
  },
  {
    slug: "test-18",
    title: "test-18",
    valid: true,
    createdAt: 1549893383000,
    query: {
      filters: "",
      variables: [{ code: "subjectageyears" }],
      coVariables: [{ code: "lefthippocampus" }, { code: "righthippocampus" }],
      groupings: [],
      trainingDatasets: [
        { code: "fbf" },
        { code: "adni" },
        { code: "ppmi" },
        { code: "clm" },
        { code: "edsd" }
      ],
      testingDatasets: [],
      validationDatasets: [{ code: "chru_lille" }]
    },
    dataset: {
      code: "DS1540825503020",
      header: [],
      grouping: [],
      variable: [],
      data: {}
    },
    config: {
      type: null,
      height: null,
      yAxisVariables: [],
      xAxisVariable: null,
      hasXAxis: null,
      title: { text: "test-18" }
    },
    createdBy: {
      username: "anonymous",
      fullname: "anonymous",
      picture: "images/users/default_user.png",
      languages: [],
      roles: [],
      votedApps: []
    }
  }
];

export default class MockModel {
  state = {};
  // constructor() {
  //   console.log("Mock Model constructor");
  // }

  public one = (slug: any): void => {
    const model = models.find(m => m.slug === slug) || {};
    this.state = { model };
  };
}
