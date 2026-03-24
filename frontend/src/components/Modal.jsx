import { useEffect } from "react";
import { X } from "lucide-react";
import "./Modal.css";

export const Modal = ({ isOpen, onClose, title, children, footer, size = "default", variant = "default" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = size === "lg" ? "modal-lg" : size === "sm" ? "modal-sm" : "";
  const headerClass = variant === "danger" ? "modal-header-danger" : "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${headerClass}`}>
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
