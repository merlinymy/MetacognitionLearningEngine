import PropTypes from "prop-types";
import "./DemoBanner.css";

const DemoBanner = ({ message, step, totalSteps }) => {
  return (
    <div className="demo-banner">
      <div className="demo-banner-header">
        <span className="demo-badge">
          🎓 Demo Mode {step && `(Step ${step}/${totalSteps})`}
        </span>
      </div>
      <div className="demo-banner-content">
        <p>{message}</p>
      </div>
    </div>
  );
};

DemoBanner.propTypes = {
  message: PropTypes.string.isRequired,
  step: PropTypes.number,
  totalSteps: PropTypes.number,
};

export default DemoBanner;
