import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lightning-backend-fl6y.onrender.com/', // Endereço do seu backend
});

export default api;