import React, { useState, useEffect, useCallback, useMemo } from "react";
import Nav from "./components/Navigation/Nav";
import Product from "./components/Products/Product";
import ProductCard from "./components/Products/ProductCard";
import AdminWelcomeEditor from "./components/Admin/AdminWelcomeEditor";
import WelcomeMessage from "./components/WelcomeMessage";
import PriceFilter from "./components/Products/PriceFilter";
import ExportCustomersCSV from "./components/Admin/ExportCustomerCSV";
import useApi from "./hooks/useApi";
import useCart from "./hooks/useCart";
import {
  fetchProducts,
  fetchProductById,
  fetchWelcomeMessage,
} from "./services/api";
import styles from "./styles/App.module.css";

const App = () => {
  const { data: rawProducts, loading, error, execute } = useApi();
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const { addToCart } = useCart(1);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Added for messaging
  const [priceFilter, setPriceFilter] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryTitle, setCategoryTitle] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [viewedProducts, setViewedProducts] = useState([]);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [didFetch, setDidFetch] = useState(false);

  const tagIdToCategoryName = {
    6: "Ropa",
    7: "Accesorios",
    8: "Electrónica",
    9: "Hogar",
    10: "Belleza",
  };

  useEffect(() => {
    execute(fetchProducts, {})
      .then(() => setDidFetch(true))
      .catch((err) => {
        console.error("Error fetching products:", err);
        setDidFetch(true);
      });
  }, [execute]);

  useEffect(() => {
    execute(fetchWelcomeMessage)
      .then((data) => setWelcomeMessage(data.message))
      .catch((err) => console.error("Error al cargar mensaje:", err));
  }, [execute]);

  useEffect(() => {
    execute(fetchProducts, {}).catch((err) =>
      console.error("Error fetching products:", err)
    );
  }, [execute]);

  useEffect(() => {
    const loadViewedProducts = async () => {
      const viewedIds = JSON.parse(
        localStorage.getItem("viewedProductIds") || "[]"
      );
      if (viewedIds.length === 0) return;
      try {
        const viewedProductsData = await Promise.all(
          viewedIds.map(async (id) => {
            try {
              return await fetchProductById(id);
            } catch (err) {
              console.error(`Error loading viewed product ${id}:`, err);
              return null;
            }
          })
        );
        setViewedProducts(viewedProductsData.filter((p) => p));
      } catch (err) {
        console.error("Error loading viewed products:", err);
      }
    };
    loadViewedProducts();
  }, []);

  const extractPrice = useCallback((price) => {
    if (price == null) {
      console.warn("Precio no definido:", price);
      return 0;
    }
    if (typeof price === "number") return price;
    if (typeof price === "string") {
      try {
        const cleanPrice = price.replace(/[^\d.]/g, "");
        const numericPrice = parseFloat(cleanPrice);
        return isNaN(numericPrice) ? 0 : numericPrice;
      } catch (e) {
        console.error(`Error procesando precio string: ${price}`, e);
        return 0;
      }
    }
    console.warn(
      `Valor de precio no manejado: ${price} (tipo: ${typeof price})`
    );
    return 0;
  }, []);

  const filteredProducts = useMemo(() => {
    console.log("updateFilteredProducts ejecutado, products:", products);
    let baseList = [];

    if (searchResults.length > 0) {
      baseList = searchResults.filter(
        (item) => item && typeof item === "object" && "id" in item
      );
    } else {
      baseList = products;
      if (viewedProducts.length > 0 && !activeCategory) {
        const viewedIds = viewedProducts.map((p) => p.id);
        const viewedInProducts = viewedProducts.filter((vp) =>
          products.some((p) => p.id === vp.id)
        );
        const notViewedProducts = products.filter(
          (p) => !viewedIds.includes(p.id)
        );
        baseList = [...viewedInProducts, ...notViewedProducts];
      }
    }

    if (activeCategory && Array.isArray(baseList)) {
      baseList = baseList.filter((product) => {
        if (!product || typeof product !== "object") {
          console.warn("Producto inválido encontrado:", product);
          return false;
        }
        return (
          product.tags?.some((tag) => tag.id === Number(activeCategory)) ||
          !product.tags
        );
      });
    }

    if (priceFilter && Array.isArray(baseList)) {
      baseList = baseList.filter((product) => {
        if (!product || typeof product !== "object" || !("price" in product)) {
          console.warn("Producto inválido encontrado:", product);
          return false;
        }
        const price = extractPrice(product.price);
        return (
          (priceFilter.min === null || price >= priceFilter.min) &&
          (priceFilter.max === null || price <= priceFilter.max)
        );
      });
    }

    return Array.isArray(baseList) ? baseList : [];
  }, [
    products,
    searchResults,
    activeCategory,
    viewedProducts,
    priceFilter,
    extractPrice,
  ]);

  const handleSearch = useCallback(
    (products) => {
      console.log("handleSearch ejecutado con productos:", products);
      const valid =
        products.filter(
          (item) => item && typeof item === "object" && "id" in item
        ) || [];
      if (valid.length === 0 && searchQuery.trim()) {
        setMessage(`No se encontraron productos con nombre "${searchQuery}"`);
        setTimeout(() => setMessage(""), 3000);
      }
      setSearchResults(valid);
    },
    [searchQuery]
  );

  const handleCategorySelect = useCallback(
    (tagId) => {
      setActiveCategory(tagId);
      setCategoryTitle(
        tagId ? tagIdToCategoryName[tagId] || "Categoría" : null
      );
      setSearchResults([]);
    },
    [tagIdToCategoryName]
  );

  const handleAddToCart = useCallback(
    async (product) => {
      try {
        await addToCart({ productId: product.id, quantity: 1 });
        setMessage("Producto añadido al carrito");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        console.error("Error al añadir al carrito:", error);
        setMessage("Error al añadir al carrito");
        setTimeout(() => setMessage(""), 3000);
      }
    },
    [addToCart]
  );

  const handleViewProduct = useCallback((product) => {
    console.log("handleViewProduct llamado para:", product.id);
    setViewedProducts((prevViewed) => {
      const filteredViewed = prevViewed.filter((p) => p.id !== product.id);
      const newViewed = [product, ...filteredViewed].slice(0, 5);
      localStorage.setItem(
        "viewedProductIds",
        JSON.stringify(newViewed.map((p) => p.id))
      );
      return newViewed;
    });
  }, []);

  const handlePriceFilter = useCallback((min, max) => {
    setPriceFilter(min === null ? null : { min, max });
  }, []);

  const getTitle = useCallback(() => {
    if (searchResults.length > 0) return "Resultados de búsqueda";
    if (categoryTitle) return categoryTitle;
    if (
      viewedProducts.length > 0 &&
      !activeCategory &&
      filteredProducts.some((p) => viewedProducts.some((vp) => vp.id === p.id))
    )
      return "Productos destacados";
    return "Nuestros Productos";
  }, [
    searchResults,
    categoryTitle,
    viewedProducts,
    activeCategory,
    filteredProducts,
  ]);

  return (
    <div className={styles.app}>
      <Nav
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        setSearchQuery={setSearchQuery}
      />
      {message && <div className={styles.message}>{message}</div>}
      <div className={styles.adminToggle} onClick={() => setIsAdmin(!isAdmin)}>
        <div
          className={
            isAdmin ? styles.adminIndicatorOn : styles.adminIndicatorOff
          }
        ></div>
        <span className={isAdmin ? styles.adminTextOn : styles.adminTextOff}>
          {isAdmin ? "Modo Admin: ON" : "Modo Admin: OFF"}
        </span>
      </div>
      <main className={styles.main}>
        <aside className={styles.sidebar}>
          
          {isAdmin && (
            <div className={styles.adminTools}>
              <h3 className={styles.adminToolsTitle}>
                Herramientas de Administración
              </h3>
              <ExportCustomersCSV />
              <AdminWelcomeEditor />
            </div>
          )}
          {!error && didFetch && products.length > 0 && (
            <PriceFilter
              onApplyFilter={handlePriceFilter}
              activeFilter={priceFilter}
            />
          )}
          {categoryTitle && (
            <div className={styles.activeCategory}>
              <p>
                Categoría: <strong>{categoryTitle}</strong>
              </p>
              <button
                onClick={() => handleCategorySelect(null)}
                className={styles.clearCategoryBtn}
              >
                Mostrar todo
              </button>
            </div>
          )}
          {viewedProducts.length > 0 &&
            !activeCategory &&
            !searchResults.length > 0 && (
              <div className={styles.viewedProducts}>
                <h3 className={styles.viewedProductsTitle}>
                  Vistos recientemente
                </h3>
                <div className={styles.viewedProductsList}>
                  {viewedProducts.slice(0, 3).map((product) => (
                    <div
                      key={`sidebar-${product.id}`}
                      className={styles.viewedProductItem}
                    >
                      <img
                        src={
                          product.image ||
                          "https://via.placeholder.com/50x50?text=Producto"
                        }
                        alt={product.name}
                        className={styles.viewedProductImage}
                      />
                      <div className={styles.viewedProductDetails}>
                        <p className={styles.viewedProductName}>
                          {product.name}
                        </p>
                        <p className={styles.viewedProductPrice}>
                          {typeof product.price === "string" &&
                          product.price.includes("$")
                            ? product.price
                            : `$${Number(product.price).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </aside>
        <div className={styles.content}>
          <WelcomeMessage />
          <h1 className={styles.productsTitle}>{getTitle()}</h1>
          {/* {viewedProducts.length > 0 &&
            !activeCategory &&
            !searchResults.length > 0 && (
              <div className={styles.viewedNotice}>
                <p>Productos que has visto recientemente aparecen primero</p>
              </div>
            )} */}
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Cargando productos...</p>
            </div>
          )}
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button
                className={styles.retryButton}
                onClick={() => execute(fetchProducts, {})}
              >
                Reintentar
              </button>
            </div>
          )}
          <div className={styles.productsGrid}>
            {!loading &&
              !error &&
              filteredProducts.length > 0 &&
              filteredProducts.map((product) => {
                const isRecentlyViewed = viewedProducts.some(
                  (p) => p.id === product.id
                );
                return (
                  <div key={product.id} className={styles.productItem}>
                    {searchResults.length > 0 ? (
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        isRecentlyViewed={isRecentlyViewed}
                        onView={handleViewProduct}
                        isAdmin={isAdmin}
                      />
                    ) : (
                      <Product
                        product={product}
                        onAddToCart={handleAddToCart}
                        isRecentlyViewed={isRecentlyViewed}
                        isAdmin={isAdmin}
                      />
                    )}
                  </div>
                );
              })}
          </div>
          {!loading &&
            !error &&
            products.length > 0 &&
            filteredProducts.length === 0 && (
              <div className={styles.emptyFilter}>
                <p>
                  No se encontraron productos que coincidan con los criterios
                  seleccionados.
                </p>
                <button
                  onClick={() => {
                    setPriceFilter(null);
                    setSearchResults([]);
                    setActiveCategory(null);
                    setCategoryTitle(null);
                    setSearchQuery("");
                  }}
                  className={styles.resetFiltersBtn}
                >
                  Mostrar todos los productos
                </button>
              </div>
            )}
          {!loading && !error && didFetch && products.length === 0 && (
            <p className={styles.noProducts}>No hay productos disponibles.</p>
          )}
          {!loading &&
            !error &&
            searchResults.length === 0 &&
            !priceFilter &&
            !categoryTitle &&
            products.length > 0 &&
            filteredProducts.length > 0 && (
              <div className={styles.searchNotice}>
                <p>
                  Usa la barra de búsqueda para encontrar productos específicos
                </p>
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
