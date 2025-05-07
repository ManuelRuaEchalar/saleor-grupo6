import React from 'react';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Check } from 'lucide-react'; // Añadido Check
import AddedProduct from './AddedProduct';
import FormPago from './FormPago';

export default function Nav({ onSearch }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
  // Usuario por defecto para pruebas
  const defaultUser = {
    id: 1,
    email: "usuario@test.com",
    createdAt: "2025-04-30T02:26:35.000Z",
    updatedAt: "2025-04-30T02:26:35.000Z"
  };
  
  const categories = [
    "Ropa", 
    "Accesorios", 
    "Electrónica", 
    "Hogar", 
    "Belleza"
  ];

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim()) {
        try {
          const response = await fetch(
            `http://localhost:4000/api/products/name/${encodeURIComponent(searchQuery)}`
          );
          const data = await response.json();
          if (data.success && onSearch) {
            onSearch(data.products);
          }
        } catch (err) {
          console.error('Error buscando productos:', err);
        }
      } else if (onSearch) {
        onSearch([]); // Limpiar resultados
      }
    };

    const debounceTimer = setTimeout(searchProducts, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);
  
  // Cargar los productos del carrito al montar el componente
  useEffect(() => {
    fetchCartItems();
  }, []);
  
  // Función para abrir/cerrar el menú móvil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isCartOpen) setIsCartOpen(false);
  };
  
  // Función para abrir/cerrar el carrito
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    if (isMenuOpen) setIsMenuOpen(false);
    
    // Cargar los productos del carrito cuando se abre
    if (!isCartOpen) {
      fetchCartItems();
    }
  };
  
  // Función para obtener los productos del carrito
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/cart-items/user/${defaultUser.id}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setCartItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('No se pudieron cargar los productos del carrito.');
      // Establecer array vacío para cartItems en caso de error
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para actualizar la cantidad de un producto en el carrito
  const updateCartItem = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`http://localhost:4000/api/cart-items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Actualiza el estado local para reflejar el cambio
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('No se pudo actualizar el producto.');
    }
  };
  
  // Función para eliminar un producto del carrito
  const removeCartItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/cart-items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Elimina el item del estado local
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing cart item:', err);
      setError('No se pudo eliminar el producto del carrito.');
    }
  };
  
  // Calcular el total del carrito
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };
  
  // Calcular la cantidad total de productos en el carrito
  // Asegurar que sea un número válido y no NaN
  const cartCount = cartItems && cartItems.length > 0 
    ? cartItems.reduce((count, item) => count + (Number(item.quantity) || 0), 0)
    : 0;
  
  // Función para proceder al pago
  const handleProceedToCheckout = () => {
    setShowPaymentForm(true);
    setIsCartOpen(false);
  };
  
  // Función para manejar el éxito de la orden
  const handleOrderSuccess = (orderData) => {
    setOrderSuccess(true);
    setShowPaymentForm(false);
    
    // Vaciar el carrito local
    setCartItems([]);
    
    // Mostrar notificación de éxito
    setTimeout(() => {
      setOrderSuccess(false);
    }, 5000);
  };
  
  // Función para cerrar el formulario de pago
  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
  };

  return (
    <nav className="navbar">
      {/* Desktop Navigation */}
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <div
            className="logo-container"
            onClick={() => window.location.reload()}
            style={{ cursor: 'pointer' }}
          >
            <img
              className="logo"
              src="https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_e78d43ef1b69dc49a9a6e5c87a6cb0d5/saleor-commerce.png"
              alt="Saleor"
            />
          </div>
          
          {/* Navigation Links - Desktop */}
          <div className="desktop-nav">
            <div className="nav-links">
              {categories.map((category) => (
                <a 
                  key={category} 
                  href="#" 
                  className="nav-link"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
          
          {/* Search and Icons */}
          <div className="desktop-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-button">
                <Search size={20} />
              </button>
            </div>
            
            <a href="#" className="action-icon">
              <User size={24} />
            </a>
            
            <button onClick={toggleCart} className="action-icon cart-icon">
              <ShoppingCart size={24} />
              <span className="cart-count">
                {cartCount || 0}
              </span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="mobile-actions">
            <button onClick={toggleCart} className="action-icon cart-icon">
              <ShoppingCart size={24} />
              <span className="cart-count">
                {cartCount || 0}
              </span>
            </button>
            
            <button
              onClick={toggleMenu}
              className="menu-button"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <div className="mobile-search">
              <input
                type="text"
                placeholder="Buscar..."
                className="search-input-mobile"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-button-mobile">
                <Search size={20} />
              </button>
            </div>
            
            <a href="#" className="mobile-user-link">
              <User size={20} className="user-icon" />
              Mi cuenta
            </a>
            
            {categories.map((category) => (
              <a
                key={category}
                href="#"
                className="mobile-nav-link"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h3 className="cart-title">Tu Carrito</h3>
            <button onClick={toggleCart} className="close-cart">
              <X size={24} />
            </button>
          </div>
          
          <div className="cart-content">
            {loading && (
              <div className="cart-loading">
                <div className="cart-spinner"></div>
                <p>Cargando carrito...</p>
              </div>
            )}
            
            {error && (
              <div className="cart-error">
                <p>{error}</p>
                <button onClick={fetchCartItems} className="retry-button">
                  Reintentar
                </button>
              </div>
            )}
            
            {!loading && !error && cartItems.length === 0 && (
              <div className="empty-cart">
                <p>Tu carrito está vacío</p>
                <button className="continue-shopping" onClick={toggleCart}>
                  Continuar comprando
                </button>
              </div>
            )}
            
            {!loading && !error && cartItems.length > 0 && (
              <>
                <div className="cart-items">
                  {cartItems.map(item => (
                    <AddedProduct
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      quantity={item.quantity}
                      onUpdate={updateCartItem}
                      onRemove={removeCartItem}
                    />
                  ))}
                </div>
                
                <div className="cart-summary">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <button className="checkout-button" onClick={handleProceedToCheckout}>
                    Proceder al pago
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Notificación de éxito */}
      {orderSuccess && (
        <div className="order-success-notification">
          <Check size={18} />
          <span>Pedido realizado con éxito</span>
          <button onClick={() => setOrderSuccess(false)}>
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Formulario de Pago */}
      {showPaymentForm && (
        <FormPago 
          total={calculateTotal()} 
          cartItems={cartItems} 
          onClose={handleClosePaymentForm}
          onSuccess={handleOrderSuccess}
        />
      )}
      
      {/* Submenu - Categories Bar */}
      <div className="submenu">
        <div className="submenu-container">
          <div className="submenu-content">
            <a href="#" className="submenu-link">Novedades</a>
            <a href="#" className="submenu-link">Ofertas</a>
            <a href="#" className="submenu-link">Colecciones</a>
            <a href="#" className="submenu-link">Temporada</a>
            <a href="#" className="submenu-link">Outlet</a>
          </div>
        </div>
      </div>
    </nav>
  );
}