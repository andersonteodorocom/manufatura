import "./ActionButton.css";

export const ActionButton = ({ icon: Icon, onClick, href, variant = "default", title, size = 20 }) => {
  const className = `action-btn ${variant !== "default" ? `action-${variant}` : ""}`;

  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer" title={title}>
        <Icon size={size} />
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick} title={title} type="button">
      <Icon size={size} />
    </button>
  );
};
