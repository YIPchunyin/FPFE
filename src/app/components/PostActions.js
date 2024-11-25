"use client";
import { useState, useEffect } from "react";
import { post, get } from "../../utils/request";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PostActions = ({
  postId,
  initialLikes,
  initialCollections,
  initialIsLiked,
  initialIsCollected,
  initialViews,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [collections, setCollections] = useState(initialCollections);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isCollected, setIsCollected] = useState(initialIsCollected);
  const [views, setViews] = useState(initialViews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isToastifyCssLoaded, setIsToastifyCssLoaded] = useState(false);

  //根据postId获取actions数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(`/posts/${postId}/actions`, {}, true);
        setLikes(response.likes);
        setCollections(response.collections);
        setIsLiked(response.isLiked);
        setIsCollected(response.isCollected);
        setViews(response.views);
      } catch (error) {
        setError("Error fetching post actions: " + error.message);
      }
    };
    fetchData();
  }, [postId]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first", { autoClose: 3000 });
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(null);
    const newLikes = isLiked ? likes - 1 : likes + 1; // Optimistic update
    setLikes(newLikes);
    setIsLiked(!isLiked);

    try {
      const response = await post(`/posts/${postId}/like`, {
        method: "POST",
      });
      if (response.status !== 200)
        throw new Error("Network response was not ok");
      const updatedPost = await response;
      setLikes(updatedPost.likes);
      setIsLiked(updatedPost.hasLiked);
      toast.success(isLiked ? "You unliked the post!" : "You liked the post!", { autoClose: 3000 });
    } catch (error) {
      setError("Error liking post: " + error.message);
      // Rollback optimistic update
      setLikes(isLiked ? likes + 1 : likes - 1);
      setIsLiked((prev) => !prev); 
      toast.error("Failed to like the post: " + error.message, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first", { autoClose: 3000 });
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(null);
    const newCollections = isCollected ? collections - 1 : collections + 1; // Optimistic update
    setCollections(newCollections);
    setIsCollected((prev) => !prev);

    try {
      const response = await post(`/posts/${postId}/collect`, {}, true);
      if (response.status !== 200)
        throw new Error("Network response was not ok");
      setCollections(response.collections);
      setIsCollected(response.isCollected);
      toast.success(isCollected ? "You uncollected the post!" : "You collected the post!", { autoClose: 3000 });
    } catch (error) {
      setError("Error collecting post: " + error.message);
      // Rollback optimistic update
      setCollections(isCollected ? collections + 1 : collections - 1);
      setIsCollected(!isCollected);
      toast.error("Failed to collect the post: " + error.message, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-4 mt-2 bg-transparent">
            <ToastContainer
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        }}
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
      {error && <div className="text-red-500">{error}</div>}
      <button
        onClick={handleLike}
        disabled={loading}
        aria-label={isLiked ? "Unlike post" : "Like post"}
        className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition duration-200 ease-in-out ${
          isLiked
            ? "text-red-500 bg-gray-200 hover:bg-gray-300" // Liked state
            : "text-gray-500 bg-gray-200 hover:bg-gray-300"
        }`}
      >
        <span>{isLiked ? "❤️" : "🤍"}</span>
        <span>{likes}</span>
      </button>

      <button
        onClick={handleCollect}
        disabled={loading}
        aria-label={isCollected ? "Uncollect post" : "Collect post"}
        className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition duration-200 ease-in-out ${
          isCollected
            ? "text-yellow-500 bg-gray-200 hover:bg-gray-300" // Collected state
            : "text-gray-500 bg-gray-200 hover:bg-gray-300"
        }`}
      >
        <span>{isCollected ? "⭐" : "☆"}</span>
        <span>{collections}</span>
      </button>

      <div
        className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition duration-200 ease-in-out bg-gray-200 text-gray-800 hover:bg-gray-300`}
      >
        <span>👁️</span>
        <span>{views}</span>
      </div>
    </div>
  );
};

export default PostActions;
