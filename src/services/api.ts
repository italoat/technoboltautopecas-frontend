import axios from 'axios';

// Detecta se está rodando local ou em produção
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://technoboltautopecas-backend.onrender.com',
});

export default api;
