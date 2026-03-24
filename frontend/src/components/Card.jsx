import './Card.css';
export const Card = ({ title, children, className = "" }) => (
  <div 
    className={`shadow-xl card-content ${className}`}
  >
    {title && <h3 className="card-title">{title}</h3>}
    {children}
  </div>
);