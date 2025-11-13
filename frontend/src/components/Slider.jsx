import "./Slider.css";

const Slider = ({ value, onChange, min = 0, max = 100, label }) => {
  return (
    <div className="slider-container">
      {label && <div className="slider-label">{label}</div>}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        aria-label={label || "Confidence level"}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} percent confident`}
      />
      <div className="slider-info">
        <span>Not confident</span>
        <span className="slider-value">{value}%</span>
        <span>Very confident</span>
      </div>
    </div>
  );
};

export default Slider;
