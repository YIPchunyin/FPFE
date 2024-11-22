"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { post, get } from "../../../utils/request";

const PostDetail = () => {
  const { postId } = useParams();
  const [postdata, setPostdata] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [toc, setToc] = useState([]); // 目录状态
  const [activeId, setActiveId] = useState(null); // 当前活动标题 ID

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await get(`/posts/${postId}`, false);
        setPostdata(res.post);
        setComments(res.comments);
        const recommendationsRes = await get(`/posts/recommendations/${postId}`, false);
        setRecommendations(recommendationsRes.recommendations);
        
        generateToc(res.post.content);
      } catch (error) {
        setError("Failed to load post and comments");
        console.log(error);
      }
    };
    
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const generateToc = (content) => {
    if (!content) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3')); // 识别 h1, h2, h3

    const tocItems = headings.map((heading, index) => {
      const id = `heading-${index}`; // 创建唯一 ID
      heading.setAttribute('id', id); // 为每个标题添加 ID
      return { text: heading.innerText, id: id, level: heading.tagName };
    });

    setToc(tocItems);

    setPostdata((prevPostData) => ({
      ...prevPostData,
      content: doc.body.innerHTML,
    }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await post(`/posts/${postId}/comments`, { content: comment.trim() }, false);
      setComments((prevComments) => [data, ...prevComments]);
      setComment("");
    } catch (err) {
      setError(err.message);
      console.error("Comment submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const updatedComment = await post(`/posts/${postId}/comments/${commentId}/like`, {}, false);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? { ...comment, likes: updatedComment.likes, hasLiked: updatedComment.hasLiked }
            : comment
        )
      );
    } catch (err) {
      console.error("Like error:", err);
      setError("Failed to like comment");
    }
  };

  const scrollToHeading = (id) => {
    const heading = document.getElementById(id);
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id); // 更新当前活动标题
    }
  };

  // 处理滚动事件，设置当前活动标题
  useEffect(() => {
    const handleScroll = () => {
      const headings = toc.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100; // 小调整，确保准确性
      const visibleHeading = headings.find(heading => {
        const { top } = heading.getBoundingClientRect();
        return top >= 0 && top <= window.innerHeight; // 判断是否在视口内
      });

      if (visibleHeading) {
        setActiveId(visibleHeading.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toc]);

  if (!postdata) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="main-content">
        <div className="post-content">
          <h1>{postdata.title}</h1>
          {postdata.img_path && (
            <div className="image-container">
              <img
                src={postdata.img_path}
                alt={postdata.title || "Post image"}
                className="post-image"
              />
            </div>
          )}
          <div className="content" dangerouslySetInnerHTML={{ __html: postdata.content }} />
          <p className="post-date">
            Posted on: {new Date(postdata.Creation_time).toLocaleString()}
          </p>
          <div className="author-info">
            <strong>发帖人:</strong> {postdata.user.username}
          </div>
        </div>

        {/* 留言部分 */}
        <div className="comment-section">
          <h3>留言</h3>
          <div className="comment-input-container">
            <textarea
              className="comment-input"
              placeholder="在此輸入您的評論..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="comment-button" onClick={handleCommentSubmit} disabled={loading}>
              {loading ? "發表中..." : "發表"}
            </button>
          </div>

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment-header">
                  <strong>{comment.user.username}</strong>
                  <span className="comment-date">
                    {new Date(comment.Creation_time).toLocaleString()}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
                <div className="comment-footer">
                  <button
                    className={`like-button ${comment.hasLiked ? "liked" : ""}`}
                    onClick={() => handleLikeComment(comment._id)}
                  >
                    👍 {comment.likes || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 推荐部分 */}
        <div className="recommendations-section">
          <h3>相关推荐</h3>
          <div className="recommendations-list">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div key={rec._id} className="recommendation">
                  <a href={`/postsample/${rec._id}`} className="recommendation-link">
                    <div className="recommendation-content">
                      <img src={rec.img_path} alt={rec.title} className="rec-image" />
                      <div className="rec-text">
                        <h4>{rec.title}</h4>
                        <p>相似度: {rec.similarity.toFixed(2)}</p>
                      </div>
                    </div>
                  </a>
                </div>
              ))
            ) : (
              <p>没有找到相关推荐</p>
            )}
          </div>
        </div>
      </div>

{/* 固定目录部件 */}
{toc.length > 0 && ( // 添加检查条件
  <div className="toc">
    <h3>目录</h3>
    <ul>
      {toc.map((item) => (
        <li key={item.id} className={`toc-item ${activeId === item.id ? 'active' : ''}`}>
          <button 
            className={`toc-link toc-${item.level.toLowerCase()} ${activeId === item.id ? 'active' : ''}`} 
            onClick={() => scrollToHeading(item.id)}
          >
            {item.text}
          </button>
          {activeId === item.id && <span className="indicator">•</span>} {/* 角标 */}
        </li>
      ))}
    </ul>
  </div>
)}
      <style jsx>{`
        .container {
          display: flex;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          animation: fadeIn 0.5s;
          position: relative; /* 使目录固定不受容器限制 */
        }
        .main-content {
          flex: 3; /* 主内容区域 */
          display: flex;
          flex-direction: column;
        }
        .post-content {
          margin-bottom: 40px; /* 增加内容与留言区域间的间隔 */
        }
        .toc {
          position: fixed; /* 使目录固定在右侧 */
          right: 80px; /* 右边距 */
          top: 100px; /* 顶部距 */
          width: 200px; /* 目录宽度 */
          max-height: 80vh; /* 最大高度 */
          overflow-y: auto; /* 超出部分滚动 */
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s;
          color: black;
        }
        .toc:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .toc h3 {
          margin-top: 0;
          color: #333;
        }
        .toc ul {
          list-style: none;
          padding: 0;
        }
        .toc li {
          margin: 5px 0;
          position: relative; /* 为角标位置做准备 */
          padding-left: 20px; /* 为角标留出空间 */
        }
        .indicator {
          position: absolute;
          left: 0; /* 角标的位置 */
          top: 50%;
          transform: translateY(-50%);
          color: #2196f3; /* 角标颜色 */
          font-size: 1.2rem; /* 角标大小 */
        }
        .toc-link {
          text-decoration: none;
          color: #0070f3;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: color 0.3s;
        }
        .toc-link:hover {
          color: #005bb5;
          text-decoration: underline;
        }
        .toc-link.h1 {
          font-weight: bold;
          color: black;
        }
        .toc-link.h2 {
          font-weight: bold;
          color: black;
        }
        .toc-link.h3 {
          font-weight: normal;
          color: black;
        }
        .toc-link.active {
          color: blue; /* 激活状态的颜色 */
        }
        .image-container {
          width: 100%;
          margin: 20px 0;
          display: flex;
          justify-content: center;
        }
        .post-image {
          max-width: 80%;
          height: auto;
          border-radius: 8px;
          transition: transform 0.3s;
        }

        .content {
          line-height: 1.6;
          font-size: 1.1rem;
        }
        .comment-section {
          margin-top: 40px;
        }
        .comment-input-container {
          margin-bottom: 20px;
        }
        .comment-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          min-height: 100px;
          resize: vertical;
        }
        .comment-button {
          padding: 10px 20px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .comment-button:hover {
          background-color: #45a049;
        }
        .comment-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        .comments-list {
          margin-top: 20px;
        }
        .comment {
          padding: 15px;
          border-bottom: 1px solid #eee;
          margin-top: 10px;
        }
        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .comment-date {
          color: #666;
          font-size: 0.9rem;
        }
        .comment-content {
          margin: 8px 0;
        }
        .comment-footer {
          margin-top: 8px;
        }
        .like-button {
          padding: 5px 10px;
          background: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .like-button:hover {
          background-color: #f5f5f5;
        }
        .like-button.liked {
          background-color: #e3f2fd;
          border-color: #2196f3;
          color: #2196f3;
        }
        .like-button.liked:hover {
          background-color: #bbdefb;
        }
        .recommendations-section {
          margin-top: 40px;
        }
        .recommendations-list {
          display: flex; /* 使用 flexbox 布局 */
          flex-wrap: wrap; /* 允许换行 */
          gap: 20px; /* 推荐项之间的间距 */
        }
        .recommendation {
          flex: 1 1 calc(33.33% - 20px); /* 每个推荐项占1/3的宽度，减去间距 */
          box-sizing: border-box; /* 包括内边距和边框 */
          padding: 15px;
          border-radius: 4px;
          max-width: 33%; /* 设置最大宽度 */
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .recommendation-link {
          display: flex;
          text-decoration: none;
          color: inherit;
        }
        .rec-image {
          width: 200px; /* 设置图片宽度为200px */
          height: auto; /* 让高度自适应 */
          border-radius: 4px;
          margin-right: 15px; /* 图片和文字之间的间距 */
        }
        .rec-text {
          flex: 1; /* 让文本部分占满剩余空间 */
        }
      `}</style>
    </div>
  );
};

export default PostDetail;
