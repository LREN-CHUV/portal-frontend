import * as dotenv from "dotenv";

dotenv.config();

const baseUrl = process.env.REACT_APP_BACKEND_URL;
const Authorization = process.env.REACT_APP_AUTHORIZATION!;

const XSRFToken = (cookie: string) => {
  const token = cookie && cookie.match(/XSRF-TOKEN=(.*)/);

  return (token && token[1]) || "";
};

const options: RequestInit =
  process.env.NODE_ENV === "production"
    ? {
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": XSRFToken(document.cookie)
        }
      }
    : {
        headers: {
          Authorization
        }
      };

export default { options, baseUrl };
