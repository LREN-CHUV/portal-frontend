const XSRFToken = (cookie: string) => {
  const tokenArray =
    cookie && cookie.match(/[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?/);
  const token = (tokenArray && tokenArray[0]) || "";

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
