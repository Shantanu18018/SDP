import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true, // browser will send cookies to server
});

export default axiosInstance;