import { X } from "lucide-react";
import "./FeedbackMessage.css";

export const FeedbackMessage = ({ tipo, texto, onClose }) => {
  if (!texto) return null;

  return (
    <div className={`feedback-msg feedback-${tipo}`}>
      <span>{texto}</span>
      {onClose && (
        <button className="feedback-close" onClick={onClose}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};
