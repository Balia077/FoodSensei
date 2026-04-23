import React from "react";

const ResultCard = ({ data }) => {
  if (!data) return null;

  const getColor = () => {
    if (data.status === "HEALTHY") return "green";
    if (data.status === "MODERATE") return "orange";
    return "red";
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 20,
        marginTop: 20,
        borderRadius: 10,
      }}
    >
      <h2>{data.foodName}</h2>

      {/* Suggestion */}
      {data.suggestion && (
        <p>
          <strong>Suggestion:</strong> {data.suggestion}
        </p>
      )}

      {/* Confidence */}
      <p>
        <strong>Confidence:</strong> {data.confidence}%
      </p>

      {/* Score */}
      <p>
        <strong>Score:</strong> {data.score}
      </p>

      {/* Status */}
      <h3 style={{ color: getColor() }}>{data.status}</h3>

      {/* Reason */}
      <p>{data.reason}</p>

      {data.warning && <p style={{ color: "orange" }}>⚠ {data.warning}</p>}
    </div>
  );
};

export default ResultCard;
