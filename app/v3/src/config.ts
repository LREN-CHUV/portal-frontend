import * as dotenv from "dotenv";

dotenv.config();

// const trainingDatasetsValue = process.env.REACT_APP_TRAININGDATASETS;
// const trainingDatasets: string[] = trainingDatasetsValue
//   ? trainingDatasetsValue.split(",")
//   : [];
// const validationDatasetsValue = process.env.REACT_APP_VALIDATIONDATASETS;
// const validationDatasets: string[] = validationDatasetsValue
//   ? validationDatasetsValue.split(",")
//   : [];
const Cookie = process.env.REACT_APP_COOKIE;

const options: RequestInit =
  process.env.NODE_ENV === "production"
    ? {
        credentials: "same-origin"
      }
    : Cookie
      ? {
          headers: {
            Authorization: process.env.REACT_APP_AUTHORIZATION!,
            Cookie,
            "X-XSRF-TOKEN": Cookie.match(/XSRF-TOKEN=(.*)/)![1] || ""
          }
        }
      : {};

const baseUrl = `${process.env.REACT_APP_BACKEND_URL}`;

export default  { options, baseUrl };
