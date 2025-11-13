import "./Progress.css";

const Progress = ({ current, total, showLabel = true }) => {
  // Prevent division by zero and NaN
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div>
      <div className="progress" role="progressbar" aria-valuenow={current} aria-valuemin="0" aria-valuemax={total}>
        <div className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
      {showLabel && (
        <div className="progress-text">
          {current} of {total} chunks
        </div>
      )}
    </div>
  );
};

export default Progress;
