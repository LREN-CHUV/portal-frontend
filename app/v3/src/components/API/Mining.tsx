import { MIP } from "@app/types";
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";

dotenv.config();

// const d1 = {name: "adni", "jobId":"46841d96-53e2-40c0-805d-2f40d4cc1fe8","node":"local","function":"python-summary-statistics","shape":"application/vnd.dataresource+json","timestamp":"Dec 11, 2018 8:49:01 AM","data":{"schema":{"fields":[{"name":"group_variables","type":"array"},{"name":"group","type":"array"},{"name":"index","type":"string"},{"name":"label","type":"string"},{"name":"type","type":"string"},{"name":"count","type":"integer"},{"name":"null_count","type":"integer"},{"name":"unique","type":"integer"},{"name":"top","type":"string"},{"name":"frequency","type":"any"},{"name":"mean","type":"number"},{"name":"std","type":"number"},{"name":"EX^2","type":"number"},{"name":"min","type":"number"},{"name":"max","type":"number"},{"name":"25%","type":"number"},{"name":"50%","type":"number"},{"name":"75%","type":"number"}]},"data":[{"count":766,"group_variables":["Gender"],"75%":3.436725,"label":"Left Hippocampus","mean":3.1841100653,"min":0.62911,"null_count":0,"std":0.3682147746,"25%":2.98045,"max":4.0687,"50%":3.20455,"EX^2":10.2739620279,"type":"real","group":["M"],"index":"lefthippocampus"},{"count":766,"group_variables":["Gender"],"label":"Total proteines g","null_count":766,"type":"real","group":["M"],"unique":0,"index":"proteinestotglcr"},{"count":766,"group_variables":["Gender"],"75%":70.0,"label":"Age Years","mean":57.9686684073,"min":20.0,"null_count":0,"std":15.8912664814,"25%":46.0,"max":92.0,"50%":60.0,"EX^2":3612.5691906005,"type":"integer","group":["M"],"index":"subjectageyears"},{"count":766,"group_variables":["Gender"],"label":"Gender","null_count":0,"frequency":{"M":766,"F":0},"type":"binominal","top":"M","group":["M"],"unique":1,"index":"gender"},{"count":1194,"group_variables":["Gender"],"75%":3.069875,"label":"Left Hippocampus","mean":2.8464355946,"min":0.58376,"null_count":0,"std":0.328859427,"25%":2.64485,"max":3.904,"50%":2.88635,"EX^2":8.2102535405,"type":"real","group":["F"],"index":"lefthippocampus"},{"count":1194,"group_variables":["Gender"],"label":"Total proteines g","null_count":1194,"type":"real","group":["F"],"unique":0,"index":"proteinestotglcr"},{"count":1194,"group_variables":["Gender"],"75%":73.0,"label":"Age Years","mean":58.4489112228,"min":20.0,"null_count":0,"std":17.8818274105,"25%":43.0,"max":92.0,"50%":62.0,"EX^2":3735.7671691792,"type":"integer","group":["F"],"index":"subjectageyears"},{"count":1194,"group_variables":["Gender"],"label":"Gender","null_count":0,"frequency":{"F":1194,"M":0},"type":"binominal","top":"F","group":["F"],"unique":1,"index":"gender"},{"count":1960,"group_variables":[],"75%":3.217625,"label":"Left Hippocampus","mean":2.9784042908,"min":0.58376,"null_count":0,"std":0.3820561004,"25%":2.74965,"max":4.0687,"50%":2.9942,"EX^2":9.0167845106,"type":"real","group":["all"],"index":"lefthippocampus"},{"count":1960,"group_variables":[],"label":"Total proteines g","null_count":1960,"type":"real","group":["all"],"unique":0,"index":"proteinestotglcr"},{"count":1960,"group_variables":[],"75%":72.0,"label":"Age Years","mean":58.2612244898,"min":20.0,"null_count":0,"std":17.1288879374,"25%":44.0,"max":92.0,"50%":61.5,"EX^2":3687.6193877551,"type":"integer","group":["all"],"index":"subjectageyears"},{"count":1960,"group_variables":[],"label":"Gender","null_count":0,"frequency":{"F":1194,"M":766},"type":"binominal","top":"F","group":["all"],"unique":2,"index":"gender"}]}}
// const d2 = {name: "clm", "jobId":"4872ed76-80a2-4173-9e98-35dd7f03d5f8","node":"local","function":"python-summary-statistics","shape":"application/vnd.dataresource+json","timestamp":"Dec 11, 2018 8:49:03 AM","data":{"schema":{"fields":[{"name":"group_variables","type":"array"},{"name":"group","type":"array"},{"name":"index","type":"string"},{"name":"label","type":"string"},{"name":"type","type":"string"},{"name":"count","type":"integer"},{"name":"null_count","type":"integer"},{"name":"unique","type":"integer"},{"name":"top","type":"string"},{"name":"frequency","type":"any"},{"name":"mean","type":"number"},{"name":"std","type":"number"},{"name":"EX^2","type":"number"},{"name":"min","type":"number"},{"name":"max","type":"number"},{"name":"25%","type":"number"},{"name":"50%","type":"number"},{"name":"75%","type":"number"}]},"data":[{"count":581,"group_variables":["Gender"],"75%":3.281877,"label":"Left Hippocampus","mean":3.060603974,"min":2.2406311,"null_count":0,"std":0.320754505,"25%":2.8456454,"max":3.9712582,"50%":3.0724523,"EX^2":9.4700030582,"type":"real","group":["M"],"index":"lefthippocampus"},{"count":581,"group_variables":["Gender"],"label":"Total proteines g","null_count":581,"type":"real","group":["M"],"unique":0,"index":"proteinestotglcr"},{"count":581,"group_variables":["Gender"],"75%":79.0,"label":"Age Years","mean":74.1755593804,"min":55.0,"null_count":0,"std":7.3004597096,"25%":70.0,"max":89.0,"50%":74.0,"EX^2":5555.2185886403,"type":"integer","group":["M"],"index":"subjectageyears"},{"count":581,"group_variables":["Gender"],"label":"Gender","null_count":0,"frequency":{"M":581,"F":0},"type":"binominal","top":"M","group":["M"],"unique":1,"index":"gender"},{"count":485,"group_variables":["Gender"],"75%":3.0006001,"label":"Left Hippocampus","mean":2.77583408,"min":1.8229287,"null_count":0,"std":0.3255200298,"25%":2.5282497,"max":3.7079077,"50%":2.7800596,"EX^2":7.8109996485,"type":"real","group":["F"],"index":"lefthippocampus"},{"count":485,"group_variables":["Gender"],"label":"Total proteines g","null_count":485,"type":"real","group":["F"],"unique":0,"index":"proteinestotglcr"},{"count":485,"group_variables":["Gender"],"75%":77.0,"label":"Age Years","mean":72.1649484536,"min":55.0,"null_count":0,"std":7.2927004322,"25%":68.0,"max":90.0,"50%":72.0,"EX^2":5260.8536082474,"type":"integer","group":["F"],"index":"subjectageyears"},{"count":485,"group_variables":["Gender"],"label":"Gender","null_count":0,"frequency":{"F":485,"M":0},"type":"binominal","top":"F","group":["F"],"unique":1,"index":"gender"},{"count":1066,"group_variables":[],"75%":3.1713087,"label":"Left Hippocampus","mean":2.9310416864,"min":1.8229287,"null_count":0,"std":0.3525825374,"25%":2.6864237,"max":3.9712582,"50%":2.9482663,"EX^2":8.7152031954,"type":"real","group":["all"],"index":"lefthippocampus"},{"count":1066,"group_variables":[],"label":"Total proteines g","null_count":1066,"type":"real","group":["all"],"unique":0,"index":"proteinestotglcr"},{"count":1066,"group_variables":[],"75%":78.0,"label":"Age Years","mean":73.2607879925,"min":55.0,"null_count":0,"std":7.361969331,"25%":69.0,"max":90.0,"50%":73.0,"EX^2":5421.2908067542,"type":"integer","group":["all"],"index":"subjectageyears"},{"count":1066,"group_variables":[],"label":"Gender","null_count":0,"frequency":{"M":581,"F":485},"type":"binominal","top":"M","group":["all"],"unique":2,"index":"gender"}]}}
// const d3 = {name: "brescia", "jobId":"e8b5aa1b-b438-4c0f-ac20-3346a504782b","node":"local","function":"python-summary-statistics","shape":"application/vnd.dataresource+json","timestamp":"Dec 11, 2018 8:49:01 AM","data":{"schema":{"fields":[{"name":"group_variables","type":"array"},{"name":"group","type":"array"},{"name":"index","type":"string"},{"name":"label","type":"string"},{"name":"type","type":"string"},{"name":"count","type":"integer"},{"name":"null_count","type":"integer"},{"name":"unique","type":"integer"},{"name":"top","type":"string"},{"name":"frequency","type":"any"},{"name":"mean","type":"number"},{"name":"std","type":"number"},{"name":"EX^2","type":"number"},{"name":"min","type":"number"},{"name":"max","type":"number"},{"name":"25%","type":"number"},{"name":"50%","type":"number"},{"name":"75%","type":"number"}]},"data":[{"count":0,"group_variables":["Gender"],"label":"Left Hippocampus","null_count":0,"type":"real","group":["M"],"index":"lefthippocampus"},{"count":0,"group_variables":["Gender"],"label":"Total proteines g","null_count":0,"type":"real","group":["M"],"index":"proteinestotglcr"},{"count":0,"group_variables":["Gender"],"label":"Age Years","null_count":0,"type":"integer","group":["M"],"index":"subjectageyears"},{"count":0,"group_variables":["Gender"],"label":"Gender","null_count":0,"frequency":{"F":0,"M":0},"type":"binominal","group":["M"],"unique":0,"index":"gender"},{"count":0,"group_variables":["Gender"],"label":"Left Hippocampus","null_count":0,"type":"real","group":["F"],"index":"lefthippocampus"},{"count":0,"group_variables":["Gender"],"label":"Total proteines g","null_count":0,"type":"real","group":["F"],"index":"proteinestotglcr"},{"count":0,"group_variables":["Gender"],"label":"Age Years","null_count":0,"type":"integer","group":["F"],"index":"subjectageyears"},{"count":0,"group_variables":["Gender"],"label":"Gender","null_count":0,"frequency":{"F":0,"M":0},"type":"binominal","group":["F"],"unique":0,"index":"gender"},{"count":0,"group_variables":[],"label":"Left Hippocampus","null_count":0,"type":"real","group":["all"],"index":"lefthippocampus"},{"count":0,"group_variables":[],"label":"Total proteines g","null_count":0,"type":"real","group":["all"],"index":"proteinestotglcr"},{"count":0,"group_variables":[],"label":"Age Years","null_count":0,"type":"integer","group":["all"],"index":"subjectageyears"},{"count":0,"group_variables":[],"label":"Gender","null_count":0,"frequency":{"F":0,"M":0},"type":"binominal","group":["all"],"unique":0,"index":"gender"}]}}

class Mining extends Container<MIP.Store.IMiningState> {
  public state: MIP.Store.IMiningState = { heatmap: {}, minings: [] };

  public loaded = this.state.minings !== undefined;

  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${config.baseUrl}`;
  }

  public heatmap = async ({
    payload
  }: {
    payload: MIP.API.IExperimentMiningPayload;
  }) => {
    const pl = {
      algorithm: {
        code: "correlationHeatmap",
        name: "Correlation heatmap",
        parameters: [],
        validation: false
      },
      ...payload
    };
    try {
      const data = await request({
        body: JSON.stringify(pl),
        headers: {
          ...this.options.headers,
          "Content-Type": "application/json;charset=UTF-8"
        },
        method: "POST",
        uri: `${this.baseUrl}/mining`
      });

      const json = JSON.parse(data).data;

      return await this.setState((prevState: any) => ({
        error: prevState.error,
        heatmap: json,
        minings: prevState.minings
      }));
    } catch (error) {
      return await this.setState((prevState: any) => ({
        error: error.message,
        minings: prevState.minings
      }));
    }
  };

  public createAll = async ({
    payload
  }: {
    payload: MIP.API.IExperimentMiningPayload;
  }) => {
    const payloads = payload.datasets.map(dataset => ({
      algorithm: {
        code: "statisticsSummary",
        name: "statisticsSummary",
        parameters: [],
        validation: false
      },
      ...payload,
      datasets: [dataset]
    }));

    payloads.map(async pl => {
      try {
        const data = await request({
          body: JSON.stringify(pl),
          headers: {
            ...this.options.headers,
            "Content-Type": "application/json;charset=UTF-8"
          },
          method: "POST",
          uri: `${this.baseUrl}/mining`
        });

        const json = JSON.parse(data).data;

        return await this.setState((prevState: any) => ({
          error: prevState.error,
          minings: [...prevState.minings, ...json]
        }));
      } catch (error) {
        return await this.setState((prevState: any) => ({
          error: error.message,
          minings: prevState.minings
        }));
      }
    });
  };
}

export default Mining;
