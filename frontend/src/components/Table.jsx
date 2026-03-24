import './Table.css';

export const Table = ({ children }) => (
  <div className="table-responsive">
    <table className="custom-table">
      {children}
    </table>
  </div>
);
