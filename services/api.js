import axios from 'axios';

const api = axios.create({
  baseURL: 'https://savorly-sever.vercel.app/', // Replace with your server URL
});

export default api;
