import * as dotenv from 'dotenv';

dotenv.config();

const XSRFToken = (cookie: string) => {
  const tokenArray =
    cookie &&
    cookie.match(/XSRF-TOKEN=([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)/);
  const token = (tokenArray && tokenArray[1]) || '';

  return token;
};

const options: RequestInit = process.env.REACT_APP_TOKEN
  ? {
      headers: {
        Authorization: process.env.REACT_APP_AUTHORIZATION!,
        Cookie: `JSESSIONID=${process.env.REACT_APP_JSESSIONID}; XSRF-TOKEN=${process.env.REACT_APP_TOKEN}`,
        'X-XSRF-TOKEN': process.env.REACT_APP_TOKEN
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
