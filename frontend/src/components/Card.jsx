import "./Card.css";

const Card = ({ children, onClick, hover }) => {
  const className = `card ${hover && onClick ? "card-hover" : ""}`;
  const isInteractive = Boolean(onClick);

  return (
    <div
      className={className}
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyPress={isInteractive ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
