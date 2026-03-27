import axios from "axios";

axios.interceptors.response.use(null, error => {
  const errorcode = error.response && error.response.status >= 400 && error.response.status <= 500;

  if (!errorcode) {
    console.log("Something went wrong");
  }

  return Promise.reject(error);
});

export default {
  get: (url, options = {}) => {
    return axios.get(url, options);
  }
};
