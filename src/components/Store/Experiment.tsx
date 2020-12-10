import React, { useState, useCallback } from 'react';
import Axios, { AxiosRequestConfig } from 'axios';
import { createContainer } from 'unstated-next';
import { backendURL } from '../API';
import {
  IExperiment,
  IExperimentList,
  ExperimentListQueryParameters
} from '../API/Experiment';
import config from '../API/RequestHeaders';

const baseUrl = `${backendURL}/experiments`;
const options: AxiosRequestConfig = config.options;

const useExperiment = (
  initialState = { experimentListQueryParameters: { page: 0 } }
) => {
  const [experimentList, setExperimentList] = useState<
    IExperimentList | undefined
  >(undefined);
  const [
    experimentListQueryParameters,
    setExperimentListQueryParameters
  ] = useState<ExperimentListQueryParameters>(
    initialState.experimentListQueryParameters
  );

  const list = useCallback(
    async ({ ...params }: ExperimentListQueryParameters): Promise<void> => {
      const nextQueryParameters = {
        ...experimentListQueryParameters,
        ...params
      };
      const nextParams = Object.entries(nextQueryParameters)
        .map(entry => `${entry[0]}=${entry[1]}&`)
        .join('');

      try {
        const response = await Axios.get(`${baseUrl}?${nextParams}`, options);

        const experimentList: IExperimentList = response.data;
        setExperimentList(experimentList);
        //setExperimentListQueryParameters(nextQueryParameters);
      } catch (error) {
        console.log(error);
      }
    },
    [experimentListQueryParameters]
  );

  return { experimentList, list, setExperimentListQueryParameters };
};

const Experiment = createContainer(useExperiment);

export default Experiment;
