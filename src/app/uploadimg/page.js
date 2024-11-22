"use client";
import { useState } from "react";

const url = "http://localhost:3001"; // Backend server URL

export default function Home() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch(`${url}/upload`, {
      // Call your backend upload endpoint
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(`Image uploaded successfully! URL: ${data.imageUrl}`);
    } else {
      setMessage(`Error: ${data.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload Image to AWS S3</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleChange} required />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
