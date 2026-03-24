import "./Loading.css";

export const Loading = ({ fullScreen = false, message = "Carregando..." }) => {
  const containerClass = fullScreen ? "loading-overlay" : "loading-container";

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className="loading-bubbles">
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};
