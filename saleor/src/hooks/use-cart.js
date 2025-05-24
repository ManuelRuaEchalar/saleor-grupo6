import { useState, useCallback } from "react";
import useApi from "./use-api";
import {
  addCartItem,
  fetchCartItems,
  updateCartItem,
  removeCartItem,
} from "../services/api";

const useCart = (userId) => {
  const { data: cartItems, loading, error, execute } = useApi();
  const [cartItemsState, setCartItemsState] = useState([]);

  const fetchCart = useCallback(async () => {
    try {
      console.log("Obteniendo ítems del carrito para userId:", userId);
      const items = await execute(fetchCartItems, userId);
      console.log("Ítems obtenidos:", items);
      setCartItemsState(items || []);
    } catch (err) {
      console.error("Error al obtener el carrito:", err);
      setCartItemsState([]);
    }
  }, [userId, execute]);

  const addToCart = useCallback(
    async ({ productId, quantity }) => {
      // Llamas al endpoint y luego refrescas el carrito
      await execute(addCartItem, userId, productId, quantity);
      await fetchCart();
    },
    [execute, userId, fetchCart]
  );

  const updateCart = useCallback(
    async (itemId, quantity) => {
      try {
        await execute(updateCartItem, itemId, quantity);
        setCartItemsState((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      } catch (err) {
        // Error manejado por useApi
      }
    },
    [execute]
  );

  const removeCart = useCallback(
    async (itemId) => {
      try {
        await execute(removeCartItem, itemId);
        setCartItemsState((prev) => prev.filter((item) => item.id !== itemId));
      } catch (err) {
        // Error manejado por useApi
      }
    },
    [execute]
  );

  const cartCount = cartItemsState.reduce(
    (count, item) => count + (Number(item.quantity) || 0),
    0
  );
  const total = cartItemsState.reduce(
    (sum, item) => sum + (item.price * item.quantity || 0),
    0
  );

  return {
    cartItems: cartItemsState,
    cartCount,
    total,
    addToCart,
    fetchCart,
    updateCart,
    removeCart,
    loading,
    error,
  };
};

export default useCart;
