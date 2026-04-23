import React, { useState } from "react";
import axios from "axios";
import ResultCard from "../components/ResultCard";

const Analyze = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select an image");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", "123"); // replace later
    formData.append("goal", "general");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/food/analyze-image",
        formData,
      );

      console.log("API Response:", res.data);

      setResult(res.data); // ✅ IMPORTANT
    } catch (err) {
      console.error("FULL ERROR:", err);
      console.log("RESPONSE:", err.response);
      alert(err.response?.data?.message || "Error analyzing image");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Analyze Food</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br />
      <br />

      <button onClick={handleUpload}>Analyze</button>

      {/* ✅ SHOW RESULT */}
      <ResultCard data={result} />
    </div>
  );
};

export default Analyze;
