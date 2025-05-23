import React from 'react';
import { User } from 'lucide-react';
import SearchBar from './SearchBar';
import styles from '../../styles/MobileMenu.module.css';

const MobileMenu = ({
  isOpen,
  categories,
  activeCategory,
  onCategorySelect,
  onSearch,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.mobileMenu}>
      <div className={styles.content}>
        <SearchBar onSearch={onSearch} isMobile />
        <a href="#" className={styles.userLink}>
          <User size={20} />
          Mi cuenta
        </a>
        {categories.map((category) => (
          <a
            key={category}
            href="#"
            className={`${styles.navLink} ${
              activeCategory === category ? styles.active : ''
            }`}
            onClick={(e) => {
              e.preventDefault();
              onCategorySelect(category);
            }}
          >
            {category}
          </a>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;