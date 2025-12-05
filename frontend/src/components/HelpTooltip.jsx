import { useState } from "react";
import PropTypes from "prop-types";
import "./HelpTooltip.css";

const HelpTooltip = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="help-tooltip-container">
      <button
        className="help-tooltip-button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        aria-label="Help information"
        type="button"
      >
        ?
      </button>
      {isVisible && (
        <div className="help-tooltip-content" role="tooltip">
          {content}
        </div>
      )}
    </span>
  );
};

HelpTooltip.propTypes = {
  content: PropTypes.string.isRequired,
};

export default HelpTooltip;
