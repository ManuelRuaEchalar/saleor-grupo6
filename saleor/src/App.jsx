import React from 'react';
import { useState, useEffect } from 'react';
import Nav from './components/Nav';
import Product from './components/Product';
import ProductCard from './components/ProductCard';
import AdminWelcomeEditor from './components/AdminWelcomeEditor';
import WelcomeMessage from './components/WelcomeMessage';
import PriceFilter from './components/PriceFilter';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [priceFilter, setPriceFilter] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Usuario por defecto para pruebas
  const defaultUser = {
    id: 1,
    email: "usuario@test.com",
    role: "client",
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

  // Función para extraer el precio numérico con validación de tipo
  const extractPrice = (price) => {
    // Si ya es un número, devolverlo directamente
    if (typeof price === 'number') {
      return price;
    }
    
    // Si es un string, procesarlo para extraer el valor numérico
    if (typeof price === 'string') {
      try {
        // Eliminar el símbolo de peso ($) y cualquier otro carácter no numérico excepto el punto
        const cleanPrice = price.replace(/[^\d.]/g, '');
        const numericPrice = parseFloat(cleanPrice);
        return isNaN(numericPrice) ? 0 : numericPrice;
      } catch (e) {
        console.error(`Error procesando precio string: ${price}`, e);
        return 0;
      }
    }
    
    // Para cualquier otro tipo o nulo, devolver 0
    console.log(`Valor de precio no manejado: ${price} (tipo: ${typeof price})`);
    return 0;
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

        // Imprimir información de precios para depuración
        ordered.forEach(product => {
          console.log(`Producto: ${product.name}, Precio: ${product.price}, Tipo: ${typeof product.price}`);
          try {
            const numericPrice = extractPrice(product.price);
            console.log(`  → Valor numérico: ${numericPrice}`);
          } catch (e) {
            console.error(`Error al procesar precio de ${product.name}:`, e);
          }
        });

        setProducts(ordered);
        setFilteredProducts(ordered);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('No se pudieron cargar los productos. Intente nuevamente más tarde.');
        // Establecer un array vacío para productos en caso de error
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Actualizar productos filtrados basado en búsqueda y filtro de precio
  const updateFilteredProducts = (searchList, priceRange) => {
    // Comenzar con la lista base (resultados de búsqueda o todos los productos)
    let baseList = searchList && searchList.length > 0 ? searchList : products;
    
    // Aplicar filtro de precio si existe
    if (priceRange) {
      baseList = baseList.filter(product => {
        try {
          const price = extractPrice(product.price);
          console.log(`Filtrando ${product.name} - Precio: ${price}, Rango: ${priceRange.min}-${priceRange.max}, Incluido: ${price >= priceRange.min && price <= priceRange.max}`);
          return price >= priceRange.min && price <= priceRange.max;
        } catch (e) {
          console.error(`Error al filtrar ${product.name}:`, e);
          return false;
        }
      });
      
      console.log(`Filtrado por precio: ${baseList.length} productos cumplen con el rango $${priceRange.min}-$${priceRange.max}`);
    }
    
    setFilteredProducts(baseList);
  };

  // Maneja resultados de búsqueda
  const handleSearch = (results) => {
    // Filtrar resultados válidos
    const valid = results.filter(item => item && typeof item === 'object' && 'id' in item);
    setSearchResults(valid);

    // Actualizar productos filtrados basado en búsqueda y filtro de precio
    updateFilteredProducts(valid, priceFilter);

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

  // Manejar aplicación de filtro de precio
  const handlePriceFilter = (min, max) => {
    console.log(`handlePriceFilter llamado con min=${min}, max=${max}`);
    
    if (min === null) { // Resetear filtro
      setPriceFilter(null);
      updateFilteredProducts(searchResults, null);
    } else { // Aplicar nuevo filtro
      const newFilter = { min, max };
      setPriceFilter(newFilter);
      updateFilteredProducts(searchResults, newFilter);
    }
  };

  // Determinar qué mostrar para el título
  const getTitle = () => {
    if (searchResults.length > 0) {
      return 'Resultados de búsqueda';
    } else {
      return 'Nuestros Productos';
    }
  };

  return (
    <>
      <Nav onSearch={handleSearch} />
      <main style={{ 
        display: 'flex', 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Contenedor de filtros */}
        {!loading && !error && products.length > 0 && (
          <div className="filters-container">
            <PriceFilter 
              onApplyFilter={handlePriceFilter} 
              activeFilter={priceFilter}
            />
          </div>
        )}
        
        {/* Contenedor de productos */}
        <div style={{ flex: 1 }}>
          {defaultUser?.role === 'admin' && <AdminWelcomeEditor />}

          <WelcomeMessage message={welcomeMessage} />
          <h1 className="products-title">{getTitle()}</h1>

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
              filteredProducts.map(product => (
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

          {/* Mensaje cuando no hay resultados con los filtros aplicados */}
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
                  setFilteredProducts(products);
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

          {!loading && !error && searchResults.length === 0 && !priceFilter && products.length > 0 && filteredProducts.length > 0 && (
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