import React, { useState } from "react";
import axios from "axios";

const Upload = ({ setResult }) => {
  const [file, setFile] = useState(null);
  const [goal, setGoal] = useState("general");

  const handleUpload = async () => {
    if (!file) return alert("Select an image");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", "123"); // replace with auth later
    formData.append("goal", goal);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/food/analyze-image",
        formData
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing image");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload Food Image</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />

      <select onChange={(e) => setGoal(e.target.value)}>
        <option value="general">General</option>
        <option value="weight_loss">Weight Loss</option>
      </select>

      <br /><br />

      <button onClick={handleUpload}>Analyze</button>
    </div>
  );
};

export default Upload;