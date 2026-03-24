import { Search } from "lucide-react";
import "./SearchBar.css";

export const SearchBar = ({ value, onChange, placeholder = "Buscar...", children }) => {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
      {children}
    </div>
  );
};
