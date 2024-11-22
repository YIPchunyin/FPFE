"use client";
// src/app/post/page.js
import { useEffect, useState } from "react";

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true); // Start loading
      setError(null); // Reset error state

      try {
        const res = await fetch("http://localhost:3001/posts"); // Ensure this matches your API
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched data:", data); // Log fetched data
        setPosts(data || []); // Set posts to the fetched data
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to fetch posts: " + err.message); // Set error message
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    fetchPosts(); // Call the function to fetch posts
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : posts.length === 0 ? (
        <p>沒有上傳的內容.</p>
      ) : (
        posts.map(
          (
            post // Use 'post' instead of 'posts' for clarity
          ) => (
            <div key={post._id}>
              <h2>{post.title || "Untitled"}</h2>
              {post.img_path && (
                <img
                  src={post.img_path}
                  alt={post.title || "Post image"}
                  style={{ maxWidth: "100%" }}
                  
                />
              )}
              <p>{post.content || "No content available."}</p>
            </div>
          )
        )
      )}
    </div>
  );
};

export default PostsPage;
