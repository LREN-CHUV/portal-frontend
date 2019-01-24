import * as dotenv from "dotenv";

dotenv.config();

const devBackendURL = process.env.REACT_APP_BACKEND_URL;
const URL = `${location.protocol}//${location.host}`;

export const webURL = URL;
export const backendURL = devBackendURL
  ? `${devBackendURL}/services`
  : `${URL}/services`;
