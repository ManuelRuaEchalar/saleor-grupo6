import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Check } from 'lucide-react';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';
import CartSidebar from '../Cart/CartSidebar';
import FormPago from '../Checkout/FormPago';
import useCart from '../../hooks/use-cart';
import styles from '../../styles/Nav.module.css';

const Nav = ({ onSearch, onCategorySelect, setSearchQuery }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const { cartItems, cartCount, total, fetchCart, updateCart, removeCart } =
    useCart(1);

  const categories = ['Ropa', 'Accesorios', 'Electrónica', 'Hogar', 'Belleza'];
  const categoryToTagMapping = {
    Ropa: 6,
    Accesorios: 7,
    Electrónica: 8,
    Hogar: 9,
    Belleza: 10,
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isCartOpen) setIsCartOpen(false);
    if (isCheckoutOpen) setIsCheckoutOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    if (isMenuOpen) setIsMenuOpen(false);
    if (isCheckoutOpen) setIsCheckoutOpen(false);
    if (!isCartOpen) fetchCart();
  };

  const handleCategorySelect = (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      onCategorySelect(null);
    } else {
      setActiveCategory(category);
      onCategorySelect(categoryToTagMapping[category]);
    }
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleOrderSuccess = (orderData) => {
    setOrderSuccess(true);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    fetchCart(); // Refrescar el carrito
    setTimeout(() => setOrderSuccess(false), 5000);
  };

  return (
    <nav className={`${styles.navbar} bg-gray-900 text-white`}>
      <div className={`${styles.container} max-w-7xl mx-auto px-4`}>
        <div className={styles.content}>
          <div
            className={styles.logoContainer}
            onClick={() => {
              setActiveCategory(null);
              onCategorySelect(null);
              onSearch([]);
              window.location.reload();
            }}
          >
            <img
              className={styles.logo}
              src="https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_e78d43ef1b69dc49a9a6e5c87a6cb0d5/saleor-commerce.png"
              alt="Saleor"
            />
          </div>
          <div className={`${styles.desktopNav} hidden md:flex`}>
            <div className={styles.navLinks}>
              {categories.map((category) => (
                <a
                  key={category}
                  href="#"
                  className={`${styles.navLink} ${
                    activeCategory === category ? styles.active : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategorySelect(category);
                  }}
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
          <div className={`${styles.desktopActions} hidden md:flex`}>
            <SearchBar 
              onSearch={onSearch}
              setSearchQuery={setSearchQuery} 
            />
            <a href="#" className={styles.actionIcon}>
              <User size={24} />
            </a>
            <button
              onClick={toggleCart}
              className={`${styles.actionIcon} ${styles.cartIcon}`}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className={styles.cartCount}>{cartCount}</span>
              )}
            </button>
          </div>
          <div className={`${styles.mobileActions} md:hidden`}>
            <button
              onClick={toggleCart}
              className={`${styles.actionIcon} ${styles.cartIcon}`}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className={styles.cartCount}>{cartCount}</span>
              )}
            </button>
            <button onClick={toggleMenu} className={styles.menuButton}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <MobileMenu
        isOpen={isMenuOpen}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
        onSearch={onSearch}
      />
      <CartSidebar
        isOpen={isCartOpen}
        cartItems={cartItems}
        total={total}
        onClose={toggleCart}
        onUpdate={updateCart}
        onRemove={removeCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />
      {isCheckoutOpen && (
        <FormPago
          cartItems={cartItems}
          total={total}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
      {orderSuccess && (
        <div
          className={`${styles.orderSuccess} bg-green-500 text-white p-4 rounded fixed top-4 right-4 flex items-center gap-2`}
        >
          <Check size={18} />
          <span>Pedido realizado con éxito</span>
          <button onClick={() => setOrderSuccess(false)}>
            <X size={16} />
          </button>
        </div>
      )}
      <div className={`${styles.submenu} bg-gray-800`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={styles.submenuContent}>
            <a
              href="#"
              className={`${styles.submenuLink} ${
                !activeCategory ? styles.active : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveCategory(null);
                onCategorySelect(null);
                onSearch([]);
              }}
            >
              Todos
            </a>
            <a href="#" className={styles.submenuLink}>
              Novedades
            </a>
            <a href="#" className={styles.submenuLink}>
              Ofertas
            </a>
            <a href="#" className={styles.submenuLink}>
              Colecciones
            </a>
            <a href="#" className={styles.submenuLink}>
              Temporada
            </a>
            <a href="#" className={styles.submenuLink}>
              Outlet
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;