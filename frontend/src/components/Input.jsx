import './Input.css';
export const Input = ({ label, placeholder, multiline, rows, ...props }) => {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      
      <Tag 
        {...props}
        placeholder={placeholder}
        className={`input-field${multiline ? ' input-textarea' : ''}`}
        {...(multiline ? { rows: rows || 3 } : {})}
      />
    </div>
  );
};