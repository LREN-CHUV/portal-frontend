const XSRFToken = (cookie: string) => {
  const tokenArray = cookie && cookie.match(/XSRF-TOKEN=(.*)/);
  const token = (tokenArray && tokenArray[1]) || "";

  return token;
};

const options: RequestInit =
  process.env.NODE_ENV === "production"
    ? {
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": XSRFToken(document.cookie)
        }
      }
    : {};

export default { options };
