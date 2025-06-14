import React, { useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [inputs, setInputs] = useState({
    rawMaterials: [{ name: "", quantity: "", unitCost: "" }],
    laborHours: "",
    laborRate: "",
    overhead: "",
    misc: ""
  });

  const [result, setResult] = useState(null);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedMaterials = [...inputs.rawMaterials];
    updatedMaterials[index][name] = value;
    setInputs({ ...inputs, rawMaterials: updatedMaterials });
  };

  const addRawMaterial = () => {
    setInputs({
      ...inputs,
      rawMaterials: [...inputs.rawMaterials, { name: "", quantity: "", unitCost: "" }]
    });
  };

  const handleGeneralChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/calculate", inputs);
      setResult(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await axios.post("http://localhost:5000/generate-pdf", inputs, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "production_cost.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF download error:", err);
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI", backgroundColor: "#f2f4f7", minHeight: "100vh", padding: "30px" }}>
      <div style={{ maxWidth: "800px", margin: "auto", background: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>💡 Smart Production Cost Calculator</h2>

        <h3>1️⃣ Raw Materials</h3>
        {inputs.rawMaterials.map((material, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <label>Material Name:</label>
            <input
              name="name"
              placeholder="Material Name"
              value={material.name}
              onChange={(e) => handleInputChange(e, index)}
              style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
            />
            <label>Quantity:</label>
            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={material.quantity}
              onChange={(e) => handleInputChange(e, index)}
              style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
            />
            <label>Unit Cost:</label>
            <input
              name="unitCost"
              type="number"
              placeholder="Unit Cost"
              value={material.unitCost}
              onChange={(e) => handleInputChange(e, index)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </div>
        ))}
        <button onClick={addRawMaterial} style={{ marginBottom: "20px", background: "#28a745", color: "white", padding: "8px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          ➕ Add Material
        </button>

        <h3>2️⃣ Labor</h3>
        <label>Hours Worked:</label>
        <input
          type="number"
          name="laborHours"
          placeholder="Hours Worked"
          value={inputs.laborHours}
          onChange={handleGeneralChange}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <label>Rate per Hour:</label>
        <input
          type="number"
          name="laborRate"
          placeholder="Rate per Hour"
          value={inputs.laborRate}
          onChange={handleGeneralChange}
          style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
        />

        <h3>3️⃣ Overhead & Miscellaneous</h3>
        <label>Overhead:</label>
        <input
          type="number"
          name="overhead"
          placeholder="Overhead"
          value={inputs.overhead}
          onChange={handleGeneralChange}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <label>Miscellaneous:</label>
        <input
          type="number"
          name="misc"
          placeholder="Miscellaneous"
          value={inputs.misc}
          onChange={handleGeneralChange}
          style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
        />

        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 30px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            width: "100%"
          }}
        >
          🚀 Calculate Total Cost
        </button>

        <button
          onClick={handleDownloadPDF}
          style={{
            marginTop: "10px",
            padding: "10px 30px",
            backgroundColor: "#6c63ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            width: "100%"
          }}
        >
          🧾 Download PDF Report
        </button>

        {result && (
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <h3 style={{ color: "#333" }}>📊 Total Production Cost: ₹{result.total}</h3>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "20px" }}>
              <li>Raw Material: ₹{result.raw}</li>
              <li>Labor: ₹{result.labor}</li>
              <li>Overhead: ₹{result.overhead}</li>
              <li>Misc: ₹{result.misc}</li>
            </ul>

            <Pie
              data={{
                labels: ["Raw", "Labor", "Overhead", "Misc"],
                datasets: [
                  {
                    data: [result.raw, result.labor, result.overhead, result.misc],
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#AA65FD"]
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: {
                    position: "bottom"
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
