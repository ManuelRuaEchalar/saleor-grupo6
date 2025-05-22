import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchProducts } from '../../services/api';
import styles from '../../styles/SearchBar.module.css';

const SearchBar = ({ onSearch, isMobile }) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const products = await searchProducts(searchQuery);
          onSearch(products);
        } catch (err) {
          console.error('Error buscando productos:', err);
          onSearch([]);
        }
      } else {
        onSearch([]);
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);

  return (
    <div
      className={`${styles.searchContainer} ${isMobile ? styles.mobile : ''}`}
    >
      <input
        type="text"
        placeholder="Buscar..."
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className={styles.searchButton} aria-label="Buscar">
        <Search size={20} />
      </button>
    </div>
  );
};

export default SearchBar;