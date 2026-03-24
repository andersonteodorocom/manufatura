import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import './ActionsMenu.css';

export const ActionsMenu = ({ actions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState('bottom-left');
  const menuRef = useRef(null);
  const popupRef = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fecha com ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Ajusta posição para não sair da tela
  useEffect(() => {
    if (!isOpen || !popupRef.current || !menuRef.current) return;

    const popup = popupRef.current;
    const rect = popup.getBoundingClientRect();
    const triggerRect = menuRef.current.getBoundingClientRect();
    let pos = 'bottom-left';

    // Se sai pela direita, abre à esquerda
    if (rect.right > window.innerWidth - 8) pos = 'bottom-right';
    // Se sai por baixo, abre para cima
    if (rect.bottom > window.innerHeight - 8) {
      pos = pos === 'bottom-right' ? 'top-right' : 'top-left';
    }

    if (pos !== position) setPosition(pos);
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (action.onClick) action.onClick();
  };

  const visibleActions = actions.filter(Boolean);
  if (visibleActions.length === 0) return null;

  return (
    <div className="actions-menu" ref={menuRef}>
      <button
        className={`actions-menu-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        type="button"
        title="Ações"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          <div className="actions-menu-backdrop" onClick={() => setIsOpen(false)} />
          <div className={`actions-menu-popup ${position}`} ref={popupRef}>
            {visibleActions.map((action, index) => {
              if (action.separator) {
                return <div key={index} className="actions-menu-separator" />;
              }

              if (action.href) {
                return (
                  <a
                    key={index}
                    href={action.href}
                    target={action.target || '_blank'}
                    rel="noreferrer"
                    className={`actions-menu-item ${action.variant || ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {action.icon && <span className="actions-menu-icon">{action.icon}</span>}
                    <span>{action.label}</span>
                  </a>
                );
              }

              return (
                <button
                  key={index}
                  className={`actions-menu-item ${action.variant || ''}`}
                  onClick={(e) => handleAction(action, e)}
                  type="button"
                >
                  {action.icon && <span className="actions-menu-icon">{action.icon}</span>}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
