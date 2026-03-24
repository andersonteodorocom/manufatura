import "./StatusBadge.css";

const statusConfig = {
  autorizado: { label: "Autorizada", variant: "success" },
  cancelado: { label: "Cancelada", variant: "neutral" },
  processando_autorizacao: { label: "Processando", variant: "warning" },
  erro_autorizacao: { label: "Erro", variant: "danger" },
};

export const StatusBadge = ({ status, label }) => {
  const config = statusConfig[status] || { label: status, variant: "neutral" };
  const displayLabel = label || config.label;

  return (
    <span className={`status-badge status-${config.variant}`}>
      {displayLabel}
    </span>
  );
};
