import axios from "axios";

const _axios = axios.create();

// _axios.interceptors.request.use((config) => {
//   return config;
// });

_axios.interceptors.response.use((res) => res.data);

export default _axios;
