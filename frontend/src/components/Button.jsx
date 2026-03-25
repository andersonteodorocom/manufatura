import './Button.css';
export const Button = ({ text, children, onClick, icon: Icon, variant = "primary", type = "button", disabled = false, loading = false }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      className={`-btn -btn-${variant} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
    >
      {Icon && !loading && <Icon size={18} className="btn-icon" />}
      {loading ? 'Processando...' : (children || text)}
    </button>
  );
};