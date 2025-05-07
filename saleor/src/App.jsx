import React from 'react';
import { useState, useEffect } from 'react';
import Nav from './components/Nav';
import Product from './components/Product';
import ProductCard from './components/ProductCard';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Usuario por defecto para pruebas
  const defaultUser = {
    id: 1,
    email: "usuario@test.com",
    createdAt: "2025-04-30T02:26:35.000Z",
    updatedAt: "2025-04-30T02:26:35.000Z"
  };

  // Efecto para cargar productos (y reordenar si hay búsqueda previa)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/products');
        // Verificar que response existe antes de acceder a ok
        if (!response || !response.ok) throw new Error(`Error: ${response?.status || 'Unknown'}`);
        const data = await response.json();

        // Revisar si hay IDs de búsqueda guardados
        const savedIds = JSON.parse(localStorage.getItem('lastSearchedIds') || '[]');
        let ordered = data;
        if (savedIds.length) {
          // Productos buscados primero, en el orden guardado
          const matched = savedIds
            .map(id => data.find(p => p.id === id))
            .filter(Boolean);
          const rest = data.filter(p => !savedIds.includes(p.id));
          ordered = [...matched, ...rest];
        }

        setProducts(ordered);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('No se pudieron cargar los productos. Intente nuevamente más tarde.');
        // Establecer un array vacío para productos en caso de error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Maneja resultados de búsqueda
  const handleSearch = (results) => {
    // Filtrar resultados válidos
    const valid = results.filter(item => item && typeof item === 'object' && 'id' in item);
    setSearchResults(valid);

    // Guardar IDs únicos de búsquedas recientes
    if (valid.length) {
      const newIds = valid.map(item => item.id);
      const oldIds = JSON.parse(localStorage.getItem('lastSearchedIds') || '[]');
      // Combinar manteniendo orden: nuevos primero, luego antiguos
      const combined = [...newIds, ...oldIds];
      // Eliminar duplicados conservando la primera aparición
      const uniqueIds = combined.filter((id, index) => combined.indexOf(id) === index);
      // Guardar solo los dos más recientes
      const finalIds = uniqueIds.slice(0, 2);
      localStorage.setItem('lastSearchedIds', JSON.stringify(finalIds));
    } else {
      // Si la búsqueda está vacía, limpiar guardado
      localStorage.removeItem('lastSearchedIds');
    }
  };

  // Determinar qué mostrar: si hay resultados, mostrarlos; si no, todos
  const displayProducts = searchResults.length > 0 ? searchResults : products;

  return (
    <>
      <Nav onSearch={handleSearch} />
      <main className="products-container">
        <h1 className="products-title">
          {searchResults.length > 0 ? 'Resultados de búsqueda' : 'Nuestros Productos'}
        </h1>

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
          {!loading && !error && displayProducts && displayProducts.length > 0 &&
            displayProducts.map(product => (
              <div key={product.id} className="product-item">
                {searchResults.length > 0 ? (
                  <ProductCard product={product} />
                ) : (
                  <Product 
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    image={product.image}
                  />
                )}
              </div>
            ))}
        </div>

        {!loading && !error && displayProducts.length === 0 && (
          <p className="no-products">No hay productos disponibles.</p>
        )}

        {!loading && !error && searchResults.length === 0 && products.length > 0 && (
          <div className="search-notice">
            <p>Usa la barra de búsqueda para encontrar productos específicos</p>
          </div>
        )}
      </main>
    </>
  );
}

export default App;