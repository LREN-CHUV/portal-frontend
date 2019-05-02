import * as dotenv from 'dotenv';

dotenv.config();
// const devBackendURL =
//   process.env.NODE_ENV !== "production"
//     ? process.env.REACT_APP_BACKEND_URL
//     : undefined;
// const URL = `${location.protocol}//${location.host}`;

const XSRFToken = (cookie: string) => {
  const tokenArray =
    cookie && cookie.match(/[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?/);
  const token = (tokenArray && tokenArray[0]) || '';

  return token;
};

const Cookie = `JSESSIONID=${process.env.REACT_APP_JSESSIONID}; XSRF-TOKEN=${
  process.env.REACT_APP_TOKEN
}`;

const options: RequestInit = process.env.REACT_APP_TOKEN
  ? {
      credentials: 'include',
      headers: {
        Cookie,
        'X-XSRF-TOKEN': XSRFToken(Cookie)
      }
    }
  : process.env.NODE_ENV === 'production'
  ? {
      credentials: 'include',
      headers: {
        'X-XSRF-TOKEN': XSRFToken(document.cookie)
      }
    }
  : {};
export default { options };
