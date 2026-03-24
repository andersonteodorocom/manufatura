import './Button.css';
export const Button = ({ text, onClick, variant = "primary", type = "button", disabled = false }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      className={`-btn -btn-${variant}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};