import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './Dropdown.css';

export const Dropdown = ({ 
  label, 
  placeholder = "Selecione uma opção", 
  options = [], 
  value,
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="dropdown" ref={containerRef}>
      {label && <label className="dropdown-label">{label}</label>}
      
      <button
        className={`dropdown-trigger ${isOpen ? 'active' : ''} ${selectedOption ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="dropdown-value">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown 
          size={18} 
          className={`dropdown-icon ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-menu-inner">
            {options.length === 0 ? (
              <div className="dropdown-empty">Nenhuma opção disponível</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  className={`dropdown-item ${value === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                  type="button"
                >
                  <span className="dropdown-item-label">{option.label}</span>
                  {value === option.value && (
                    <Check size={16} className="dropdown-item-check" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
