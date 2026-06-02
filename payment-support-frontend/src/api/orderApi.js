import axios from 'axios';

const BASE = 'http://localhost:8080/api';

export const getOrders = () => axios.get(`${BASE}/orders`);
export const getOrder = (id) => axios.get(`${BASE}/orders/${id}`);
export const createOrder = (data) => axios.post(`${BASE}/orders`, data);
export const simulatePayment = (id, mode) =>
  axios.post(`${BASE}/orders/${id}/pay?mode=${mode}`);