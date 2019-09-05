import * as dotenv from 'dotenv';

dotenv.config();
const devBackendURL =
  process.env.NODE_ENV !== 'production'
    ? process.env.REACT_APP_BACKEND_URL
    : undefined;
const URL = `${window.location.protocol}//${window.location.host}`;

export const webURL = URL;
export const backendURL = devBackendURL
  ? `${devBackendURL}/services`
  : `${URL}/services`;
