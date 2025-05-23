import axios from 'axios';

// Base URL configurable via environment variables
const BASE_URL = 'http://localhost:4000';

export const fetchCartItems = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/cart-items/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el carrito:', error.message);
    throw new Error(`Error al obtener el carrito: ${error.response?.status || error.message}`);
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/cart-items/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el carrito:', error.message);
    throw new Error(`Error al actualizar el carrito: ${error.response?.status || error.message}`);
  }
};

// services/api.js
export const addCartItem = async (userId, productId, quantity) => {
  const response = await axios.post(`${BASE_URL}/api/cart-items`, {
    userId, productId, quantity
  });
  return response.data;
};


export const removeCartItem = async (itemId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/cart-items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el item:', error.message);
    throw new Error(`Error al eliminar el item: ${error.response?.status || error.message}`);
  }
};

export const fetchProducts = async ({ name, minPrice, maxPrice } = {}) => {
  try {
    if (name) {
      const response = await axios.get(`${BASE_URL}/api/products/name/${encodeURIComponent(name)}`);
      console.log('fetchProducts search response:', response.data);
      return response.data.success ? response.data.products : [];
    }
    const params = new URLSearchParams();
    if (minPrice !== undefined) params.append('minPrice', minPrice);
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice);
    const response = await axios.get(`${BASE_URL}/api/products`, { params });
    console.log('fetchProducts response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    throw new Error(`Error al obtener productos: ${error.response?.status || error.message}`);
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el pedido:', error.message);
    throw new Error(error.response?.data?.message || `Error al crear el pedido: ${error.response?.status || error.message}`);
  }
};

export const clearCart = async (userId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/cart-items/clear/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al limpiar el carrito:', error.message);
    throw new Error(`Error al limpiar el carrito: ${error.response?.status || error.message}`);
  }
};

export const fetchWelcomeMessage = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/welcome`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el mensaje de bienvenida:', error.message);
    throw new Error(`Error al obtener el mensaje de bienvenida: ${error.response?.status || error.message}`);
  }
};

export const updateWelcomeMessage = async (message) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/welcome`, { message });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el mensaje de bienvenida:', error.message);
    throw new Error(`Error al actualizar el mensaje de bienvenida: ${error.response?.status || error.message}`);
  }
};

export const fetchCustomers = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await axios.get(`${BASE_URL}/api/customers?${query}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error.message);
    throw new Error(`Error al obtener clientes: ${error.response?.status || error.message}`);
  }
};

export const fetchTags = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/tags`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener etiquetas:', error.message);
    throw new Error(`Error al obtener etiquetas: ${error.response?.status || error.message}`);
  }
};

export const fetchProductTags = async (productId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/tags/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener etiquetas del producto:', error.message);
    throw new Error(`Error al obtener etiquetas del producto: ${error.response?.status || error.message}`);
  }
};

export const addTagToProduct = async (productId, tagId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/tags/product/${productId}/tag/${tagId}`);
    return response.data;
  } catch (error) {
    console.error('Error al añadir etiqueta al producto:', error.message);
    throw new Error(`Error al añadir etiqueta al producto: ${error.response?.status || error.message}`);
  }
};

export const fetchDeliveryEstimate = async (productId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/delivery-estimate/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estimación de entrega:', error.message);
    // Fallback to random estimate
    const randomDays = Math.floor(Math.random() * 5) + 3;
    return { minDays: randomDays, maxDays: randomDays + 2, available: true };
  }
};

export const fetchProductById = async (productId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener producto:', error.message);
    throw new Error(`Error al obtener producto: ${error.response?.status || error.message}`);
  }
};