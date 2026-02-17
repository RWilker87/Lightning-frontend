import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

// Request Interceptor: injeta o token JWT em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@App:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: trata erros 401 (token expirado) e 403 (licença expirada)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expirado ou inválido — limpa sessão e redireciona para login
      localStorage.removeItem("@App:token");
      localStorage.removeItem("@App:user");

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      // Licença expirada — emite evento para o AuthContext reagir
      window.dispatchEvent(new CustomEvent('license-expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
