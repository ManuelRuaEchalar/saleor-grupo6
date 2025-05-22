export const fetchCartItems = async (userId) => {
  const response = await fetch(`http://localhost:4000/api/cart-items/user/${userId}`);
  if (!response.ok) throw new Error(`Error al obtener el carrito: ${response.status}`);
  return response.json();
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await fetch(`http://localhost:4000/api/cart-items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error(`Error al actualizar el carrito: ${response.status}`);
  return response.json();
};

export const removeCartItem = async (itemId) => {
  const response = await fetch(`http://localhost:4000/api/cart-items/${itemId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Error al eliminar el item: ${response.status}`);
  return response.json();
};

export const searchProducts = async (query) => {
  const response = await fetch(`http://localhost:4000/api/products/name/${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`Error al buscar productos: ${response.status}`);
  const data = await response.json();
  return data.products || [];
};

export const createOrder = async (orderData) => {
  const response = await fetch('http://localhost:4000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error((await response.json()).message || `Error al crear el pedido: ${response.status}`);
  return response.json();
};

export const clearCart = async (userId) => {
  const response = await fetch(`http://localhost:4000/api/cart-items/clear/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Error al limpiar el carrito: ${response.status}`);
  return response.json();
};

export const fetchWelcomeMessage = async () => {
  const response = await fetch('http://localhost:4000/api/welcome');
  if (!response.ok) throw new Error(`Error al obtener el mensaje de bienvenida: ${response.status}`);
  return response.json();
};

export const updateWelcomeMessage = async (message) => {
  const response = await fetch('http://localhost:4000/api/welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error(`Error al actualizar el mensaje de bienvenida: ${response.status}`);
  return response.json();
};