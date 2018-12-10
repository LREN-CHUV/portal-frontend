import * as dotenv from "dotenv";

dotenv.config();

const baseUrl = process.env.REACT_APP_BACKEND_URL;
const fileCookie = process.env.REACT_APP_COOKIE;
const Authorization = process.env.REACT_APP_AUTHORIZATION!;

const XSRFToken = (cookie: string) =>
  (cookie && cookie.match(/XSRF-TOKEN=(.*)/)![1]) || "";

const options: RequestInit =
  process.env.NODE_ENV === "production"
    ? {
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": XSRFToken(document.cookie)
        }
      }
    : fileCookie
    ? {
        headers: {
          Authorization,
          Cookie: fileCookie,
          "X-XSRF-TOKEN": XSRFToken(fileCookie)
        }
      }
    : {};

export default { options, baseUrl };
