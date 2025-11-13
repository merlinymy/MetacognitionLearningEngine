import './Button.css';

const Button = ({ children, onClick, variant = 'primary', disabled, fullWidth }) => {
  const className = `btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`;

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
