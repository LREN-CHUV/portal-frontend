import { Variable, VariableEntity } from './components/API/Core';
import { MiningResponseShape } from './components/API/Mining';

export declare namespace MIP {
  export interface IError {
    error?: string;
  }
}

export declare namespace MIP.Store {


  export interface IMiningState extends IError {
    summaryStatistics?: MiningResponseShape[];
    heatmaps?: MiningResponseShape[];
    histograms?: MiningResponseShape;
  }
}

export declare namespace MIP.API {


  export interface IMiningResponse {
    jobId: string;
    node: string;
    function: string;
    shape: string;
    timestamp: string;
    data: any;
  }

  export interface IMiningPayload {
    algorithm?: MIP.API.IMethod;
    variables: VariableEntity[];
    grouping?: VariableEntity[];
    covariables?: VariableEntity[];
    datasets: VariableEntity[];
    filters: string;
  }









}
