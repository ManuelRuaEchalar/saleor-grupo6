import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchProducts } from '../../services/api';
import styles from '../../styles/SearchBar.module.css';

const SearchBar = ({ onSearch, isMobile, setSearchQuery }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      const trimmedQuery = localSearchQuery.trim();
      console.log('SearchBar: Search query:', trimmedQuery); // Debug search term
      setSearchQuery(trimmedQuery); // Sync with App.jsx

      if (trimmedQuery) {
        try {
          setIsLoading(true);
          const response = await fetchProducts({ name: trimmedQuery });
          console.log('SearchBar: fetchProducts response:', response); // Debug API response
          const products = Array.isArray(response) ? response : [];
          console.log('SearchBar: Enviando resultados a onSearch:', products);
          onSearch(products);
        } catch (err) {
          console.error('SearchBar: Error buscando productos:', err.message);
          onSearch([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('SearchBar: Query vacía, limpiando resultados');
        onSearch([]);
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [localSearchQuery, onSearch, setSearchQuery]);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
  };

  return (
    <div
      className={`${styles.searchContainer} ${isMobile ? styles.mobile : ''}`}
    >
      <input
        type="text"
        placeholder="Buscar productos..."
        className={styles.searchInput}
        value={localSearchQuery}
        onChange={handleInputChange}
        aria-label="Buscar productos"
      />
      <button className={styles.searchButton} aria-label="Buscar">
        {isLoading ? (
          <div className={styles.loadingSpinner}></div>
        ) : (
          <Search size={20} />
        )}
      </button>
    </div>
  );
};

export default SearchBar;