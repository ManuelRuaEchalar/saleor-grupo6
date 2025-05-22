import React, { useState, useEffect, useCallback } from 'react';
import Nav from './components/Navigation/Nav';
import Product from './components/Product';
import ProductCard from './components/ProductCard';
import AdminWelcomeEditor from './components/AdminWelcomeEditor';
import WelcomeMessage from './components/WelcomeMessage';
import PriceFilter from './components/PriceFilter';
import ExportCustomersCSV from './components/ExportCustomersCSV';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [priceFilter, setPriceFilter] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryTitle, setCategoryTitle] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState('');
  const [viewedProducts, setViewedProducts] = useState([]);

  const handleSearch = (products) => {
    console.log('Resultados de búsqueda:', products);
    // Actualiza el estado o renderiza los productos
  };

  const handleCategorySelect = (tag) => {
    console.log('Categoría seleccionada:', tag);
    // Filtra productos por categoría
  };
  const handleAddToCart = async (product) => {
    try {
      const response = await fetch('http://localhost:4000/api/cart-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          productId: product.id,
          quantity: 1
        })
      });
      if (!response.ok) throw new Error('Error al añadir al carrito');
      const newItem = await response.json();
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === newItem.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prevItems, newItem];
        }
      });
      setMessage('Producto añadido al carrito');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Error al añadir al carrito');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleViewProduct = (product) => {
    console.log('handleViewProduct llamado para:', product.id);
    setViewedProducts(prevViewed => {
      // Filtrar productos duplicados primero
      const filteredViewed = prevViewed.filter(p => p.id !== product.id);
      // Añadir el producto al principio y mantener máximo 5 productos
      const newViewed = [product, ...filteredViewed].slice(0, 5);
      
      // Guardar en localStorage
      const viewedIds = newViewed.map(p => p.id);
      localStorage.setItem('viewedProductIds', JSON.stringify(viewedIds));
      
      return newViewed;
    });
  };

  const tagIdToCategoryName = {
    6: 'Ropa',
    7: 'Accesorios',
    8: 'Electrónica',
    9: 'Hogar',
    10: 'Belleza'
  };

  const defaultUser = {
    id: 1,
    email: "usuario@test.com",
    role: isAdmin ? "admin" : "user",
    createdAt: "2025-04-30T02:26:35.000Z",
    updatedAt: "2025-04-30T02:26:35.000Z"
  };

  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/welcome')
      .then(res => res.json())
      .then(data => setWelcomeMessage(data.message))
      .catch(err => console.error('Error al cargar mensaje:', err));
  }, []);

  const extractPrice = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      try {
        const cleanPrice = price.replace(/[^\d.]/g, '');
        const numericPrice = parseFloat(cleanPrice);
        return isNaN(numericPrice) ? 0 : numericPrice;
      } catch (e) {
        console.error(`Error procesando precio string: ${price}`, e);
        return 0;
      }
    }
    console.log(`Valor de precio no manejado: ${price} (tipo: ${typeof price})`);
    return 0;
  };

  useEffect(() => {
    const loadViewedProducts = async () => {
      const viewedIds = JSON.parse(localStorage.getItem('viewedProductIds') || '[]');
      if (viewedIds.length === 0) return;

      try {
        const viewedProductsData = [];
        for (const id of viewedIds) {
          try {
            const response = await fetch(`http://localhost:4000/api/products/${id}`);
            if (response.ok) {
              const product = await response.json();
              viewedProductsData.push(product);
            }
          } catch (err) {
            console.error(`Error loading viewed product ${id}:`, err);
          }
        }
        setViewedProducts(viewedProductsData);
      } catch (err) {
        console.error('Error loading viewed products:', err);
      }
    };
    loadViewedProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:4000/api/products';
        if (activeCategory) {
          url = `http://localhost:4000/api/tags/${activeCategory}/products`;
        }
        const response = await fetch(url);
        if (!response || !response.ok) throw new Error(`Error: ${response?.status || 'Unknown'}`);
        const data = await response.json();
        const receivedProducts = activeCategory ? data.products || data : data;
        setProducts(receivedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('No se pudieron cargar los productos. Intente nuevamente más tarde.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const updateFilteredProducts = () => {
    console.log('updateFilteredProducts ejecutado');
    let baseList;
    
    if (searchResults.length > 0) {
      baseList = searchResults;
    } else if (activeCategory) {
      baseList = products;
    } else {
      // Reorganizar productos para mostrar los vistos recientemente primero
      if (viewedProducts.length > 0) {
        const viewedIds = viewedProducts.map(p => p.id);
        // Obtener productos vistos que están en la lista actual de productos
        const viewedInProducts = viewedProducts.filter(vp => 
          products.some(p => p.id === vp.id)
        );
        // Obtener productos no vistos
        const notViewedProducts = products.filter(p => 
          !viewedIds.includes(p.id)
        );
        // Combinar: primero los vistos (en orden de visualización), luego el resto
        baseList = [...viewedInProducts, ...notViewedProducts];
      } else {
        baseList = products;
      }
    }
    
    // Aplicar filtro de precio si existe
    if (priceFilter) {
      baseList = baseList.filter(product => {
        const price = extractPrice(product.price);
        return price >= priceFilter.min && price <= priceFilter.max;
      });
    }
    
    setFilteredProducts(baseList);
  };

  useEffect(() => {
    updateFilteredProducts();
  }, [products, searchResults, activeCategory, viewedProducts, priceFilter]);

  // const handleSearch = useCallback((results) => {
  //   console.log('handleSearch ejecutado con resultados:', results);
  //   const valid = results.filter(item => item && typeof item === 'object' && 'id' in item);
  //   setSearchResults(valid);
    
  //   // Actualizar productos vistos cuando se realiza una búsqueda
  //   if (valid.length > 0) {
  //     valid.forEach(product => handleViewProduct(product));
  //   }
  // }, []);

  const handlePriceFilter = (min, max) => {
    if (min === null) {
      setPriceFilter(null);
    } else {
      setPriceFilter({ min, max });
    }
  };

  // const handleCategorySelect = (tagId) => {
  //   setActiveCategory(tagId);
  //   setSearchResults([]);
  // };

  const getTitle = () => {
    if (searchResults.length > 0) {
      return 'Resultados de búsqueda';
    } else if (categoryTitle) {
      return categoryTitle;
    } else if (viewedProducts.length > 0 && !activeCategory && filteredProducts.some(p => viewedProducts.some(vp => vp.id === p.id))) {
      return 'Productos destacados';
    } else {
      return 'Nuestros Productos';
    }
  };
 return (
    <>
      <Nav onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
      
      {message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000,
        backgroundColor: isAdmin ? '#4caf50' : '#f1f1f1',
        padding: '10px 15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
      }} onClick={() => setIsAdmin(!isAdmin)}>
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: isAdmin ? 'white' : '#aaa',
          transition: 'background-color 0.3s'
        }}></div>
        <span style={{
          fontWeight: 'bold',
          color: isAdmin ? 'white' : '#333'
        }}>
          {isAdmin ? 'Modo Admin: ON' : 'Modo Admin: OFF'}
        </span>
      </div>
      
      <main style={{ 
        display: 'flex', 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        gap: '30px'
      }}>
        <div style={{ 
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignSelf: 'flex-start'
        }}>
          {!loading && !error && products.length > 0 && (
            <PriceFilter 
              onApplyFilter={handlePriceFilter} 
              activeFilter={priceFilter}
            />
          )}
          {isAdmin && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Herramientas de Administración</h3>
              <ExportCustomersCSV />
            </div>
          )}
          {categoryTitle && (
            <div className="active-category-indicator">
              <p>Categoría: <strong>{categoryTitle}</strong></p>
              <button 
                onClick={() => handleCategorySelect(null)}
                className="clear-category-button"
              >
                Mostrar todo
              </button>
            </div>
          )}
          
          {viewedProducts.length > 0 && !activeCategory && !searchResults.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>Vistos recientemente</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {viewedProducts.slice(0, 3).map(product => (
                  <div key={`sidebar-${product.id}`} style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '5px',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <img 
                      src={product.image || 'https://via.placeholder.com/50x50?text=Producto'} 
                      alt={product.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>
                        {typeof product.price === 'string' && product.price.includes('$') ? product.price : `$${Number(product.price).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          {isAdmin && <AdminWelcomeEditor />}
          <WelcomeMessage />
          <h1 className="products-title">{getTitle()}</h1>
          
          {viewedProducts.length > 0 && !activeCategory && !searchResults.length > 0 && (
            <div style={{
              backgroundColor: '#f5f8ff',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              border: '1px solid #e0e7ff'
            }}>
              <p style={{ margin: 0, color: '#4a5568', fontWeight: '500' }}>
                Productos que has visto recientemente aparecen primero
              </p>
            </div>
          )}
          
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          )}
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button className="retry-button" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          )}
          <div className="products-grid">
            {!loading && !error && filteredProducts && filteredProducts.length > 0 &&
              filteredProducts.map(product => {
                const isRecentlyViewed = viewedProducts.some(p => p.id === product.id);
                
                return (
                  <div key={product.id} className="product-item">
                    {searchResults.length > 0 ? (
                      <ProductCard 
                        product={product} 
                        onAddToCart={handleAddToCart} 
                        isRecentlyViewed={isRecentlyViewed}
                        onView={() => handleViewProduct(product)}
                        isAdmin={isAdmin}
                      />
                    ) : (
                      <Product 
                        product={product}
                        onAddToCart={handleAddToCart}
                        isRecentlyViewed={isRecentlyViewed}
                        onView={() => handleViewProduct(product)}
                        isAdmin={isAdmin}
                      />
                    )}
                  </div>
                );
              })}
          </div>
          {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              marginTop: '20px'
            }}>
              <p>No se encontraron productos que coincidan con los criterios seleccionados.</p>
              <button 
                onClick={() => {
                  setPriceFilter(null);
                  setSearchResults([]);
                  setActiveCategory(null);
                }}
                style={{
                  backgroundColor: '#161a1e',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
              >
                Mostrar todos los productos
              </button>
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <p className="no-products">No hay productos disponibles.</p>
          )}
          {!loading && !error && searchResults.length === 0 && !priceFilter && !categoryTitle && products.length > 0 && filteredProducts.length > 0 && (
            <div className="search-notice">
              <p>Usa la barra de búsqueda para encontrar productos específicos</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;