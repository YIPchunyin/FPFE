"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { post, get } from "../../../utils/request";
import { getUserId } from "../../../utils/auth"; // 导入 getUserId 方法
import Link from "next/link";
import Image from "next/image";
import 'quill/dist/quill.snow.css';
import LoadingSpinner from "@/app/components/LoadingSpinner";
import del_img from "@/app/public/del.png";
import edit_img from "@/app/public/edit.png";
import PostActions from "@/app/components/PostActions";
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
  const [postPermission, setPostPermission] = useState(false); // 是否有發文權限
  const [currentPage, setCurrentPage] = useState(1); // 当前页
  const [updatacomment, setUpdatacomment] = useState(0); // 更新评论
  const [totalPages, setTotalPages] = useState(1); // 总页数
  const commentsPerPage = 5; // 每页评论数
  const [inputPage, setInputPage] = useState('');
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await get(`/posts/${postId}/getPostData`, {}, true);
        console.log(postData);
        setPostPermission(postData.permission);
        setPostdata(postData.post);

        const commentsData = await get(`/posts/${postId}/comments/${currentPage}/${commentsPerPage}`, true);
        setComments(commentsData.comments);
        setTotalPages(commentsData.totalPages);

        const recommendationsRes = await get(`/posts/recommendations/${postId}`, false);
        setRecommendations(recommendationsRes.recommendations);

        generateToc(postData.post.content);
      } catch (error) {
        setError("獲取評論失敗");
        console.error(error);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);


  useEffect(() => {
    const getcommentdata = async () => {
      const commentdata = await get(`/posts/${postId}/comments/${currentPage}/${commentsPerPage}`, false);
      console.log(commentdata);
      if (commentdata) {
        setComments(commentdata.comments);
        setTotalPages(commentdata.totalPages);
      }

    }
    getcommentdata();

  }, [currentPage, updatacomment]);


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const generateToc = (content) => {
    if (!content) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3"));

    const tocItems = headings.map((heading, index) => {
      const id = `heading-${index}`;
      heading.setAttribute("id", id);
      return { text: heading.innerText, id: id, level: heading.tagName };
    });

    setToc(tocItems);

    setPostdata((prevPostData) => ({
      ...prevPostData,
      content: doc.body.innerHTML,
    }));
  };

  const handleCommentSubmit = async (e) => {
    //如果未登錄
    const token = localStorage.getItem("token");
    if (token == null) {
      alert("Please login first");
      return;
    }
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await post(
        `/posts/${postId}/comments`,
        { content: comment.trim() },
        true
      );
      setComments((prevComments) => [data, ...prevComments]);
      setComment("");
      setUpdatacomment(updatacomment + 1);
    } catch (err) {
      setError(err.message);
      console.error("Comment submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (token == null) {
      alert("請先登入");
      return;
    }
    try {
      const updatedComment = await post(
        `/posts/${postId}/comments/${commentId}/like`,
        {},
        false
      );
      updateCommentState(updatedComment);
    } catch (err) {
      console.error("Like error:", err);
      setError("Failed to like comment");
    }
  };

  const handleDislikeComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (token == null) {
      alert("請先登入");
      return;
    }
    try {
      const updatedComment = await post(
        `/posts/${postId}/comments/${commentId}/dislike`,
        {},
        false
      );
      updateCommentState(updatedComment);
    } catch (err) {
      console.error("Dislike error:", err);
      setError("Failed to dislike comment");
    }
  };

  const updateCommentState = (updatedComment) => {
    setComments((prevComments) => {
      return prevComments.map((comment) =>
        comment._id === updatedComment._id
          ? {
            ...comment,
            likes: updatedComment.likes,
            dislikes: updatedComment.dislikes,
            hasLiked: updatedComment.hasLiked,
            hasDisliked: updatedComment.hasDisliked,
          }
          : comment
      );
    });
  };
  const handleDeletePost = async () => {
    // 是否確認刪除
    const confirmed = window.confirm("您確定要删除這篇文章嗎？");
    if (!confirmed) {
      return; // 如果用户选择取消，直接返回
    }
    try {
      await post(`/posts/${postId}/delete`, {}, true);
      //返回主頁
      window.location.href = "/";
    } catch (err) {
      console.error("Delete post error:", err);
      setError("Failed to delete post");
    }
  }
  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (token == null) {
      alert("請先登入");
      return;
    }
    // 添加确认对话框
    const confirmed = window.confirm("您確定要删除這條評論嗎？");
    if (!confirmed) {
      return; // 如果用户选择取消，直接返回
    }
    try {
      await post(`/posts/${postId}/comments/${commentId}/delete`, {}, true);
      setComments((prevComments) => prevComments.filter(comment => comment._id !== commentId));
      setUpdatacomment(updatacomment + 1);
    } catch (err) {
      console.error("Delete comment error:", err);
      setError("Failed to delete comment");
    }
  };

  const scrollToHeading = (id) => {
    const heading = document.getElementById(id);
    if (heading) {
      heading.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        setActiveId(id);
      }, 500);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const headings = toc.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;
      let visibleHeading = null;

      headings.forEach((heading) => {
        const { top } = heading.getBoundingClientRect();
        if (top >= 0 && top <= window.innerHeight) {
          visibleHeading = heading.id;
        }
      });

      if (visibleHeading) {
        setActiveId(visibleHeading);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [toc]);



  const handleInputChange = (e) => {
    setInputPage(e.target.value.replace(/\D/, '')); // 只允许数字输入
  };

  const handlePageJump = () => {
    const pageNum = parseInt(inputPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
    setInputPage(''); // 清空输入框
  };


  if (!postdata) return <LoadingSpinner />;
  return (
    <div className="container mx-auto p-5" style={{ maxWidth: "60%" }}>
      <div className="main-content flex flex-col">
        <div className="post-content mb-10">
          <h1 className="text-2xl font-bold">{postdata.title}</h1>
          {postdata.img_path && (
            <div className="image-container flex justify-center my-5">
              <img
                src={postdata.img_path}
                alt={postdata.title || "Post image"}
                className="post-image max-w-full rounded-lg"
              />
            </div>
          )}
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: postdata.content }}
          />
          {/* //如果有更新時間 */}
          {
            postdata.Update_time && (
              <p className="post-date text-gray-500">
                Updated on: {new Date(postdata.Update_time).toLocaleString()}
              </p>
            )
          }

          <p className="post-date text-gray-500">
            Posted on: {new Date(postdata.Creation_time).toLocaleString()}
          </p>
          <div className="author-info font-semibold">
            <strong>發帖人:</strong> {postdata.user_id.username}
          </div>

          {postPermission && (
            <div>
              <Link href={`/post/edit/${postdata._id}`}>
                <button className="edit-button bg-blue-500 text-white rounded px-2 py-1 ml-2 hover:bg-blue-600 ">
                  <Image src={edit_img} alt="edit" width={20} height={20} />
                </button>
              </Link>
              <button
                className="delete-button bg-red-500 text-white rounded px-2 py-1 ml-2 hover:bg-red-600"
                onClick={() => handleDeletePost(postdata._id)}
              >
                <Image src={del_img} alt="delete" width={20} height={20} />
              </button>

            </div>
          )}
        </div>

        {/* 留言部分 */}
        <div className="comment-section">
          <h3 className="text-xl font-semibold">留言</h3>
          <div className="comment-input-container mb-5">
            <textarea
              className="comment-input w-full p-3 border border-gray-300 rounded"
              placeholder="在此輸入您的評論..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="comment-button bg-green-500 text-white rounded px-4 py-2 mt-2 hover:bg-green-600 disabled:bg-gray-300"
              onClick={handleCommentSubmit}
              disabled={loading}
            >
              {loading ? "發表中..." : "發表"}
            </button>
          </div>

          <div className="comments-list space-y-6">

            {comments && comments.map((comment) => (
              <div key={comment._id} className="comment flex border-b border-gray-200 py-4 items-start">
                <Link href={`/user/${comment.user._id}/`}>
                  <Image
                    src={comment.user.img_path}
                    alt={`${comment.user.username} avatar`}
                    width={50}
                    height={50}
                    className="rounded-full w-12 h-12 mr-4"
                  />
                </Link>

                <div className="flex-1">
                  <h4 className="font-semibold text-lg flex items-center">
                    {comment.user.name}
                    {comment.user._id === postdata.user_id._id && (
                      <span className="post-owner-label text-green-600 ml-2 text-sm"> (楼主)</span>
                    )}
                  </h4>
                  <p className="mt-1 text-gray-800">{comment.content}</p>
                  <p className="comment-date text-gray-500 text-sm mt-1">
                    在{" "}
                    {new Date(comment.Creation_time).toLocaleString("zh-CN", {
                      hour12: true,
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }).replace(/\//g, "-")}{" "}
                    發佈評論
                  </p>
                  <div className="comment-footer flex space-x-4 mt-3">
                    <button
                      className={`like-button flex items-center border rounded px-3 py-1 transition ${comment.hasLiked ? "bg-blue-200 border-blue-400" : "bg-transparent border-gray-300 hover:bg-gray-100"
                        }`}
                      onClick={() => handleLikeComment(comment._id)}
                    >
                      👍 {comment.likes || 0}
                    </button>
                    <button
                      className={`dislike-button flex items-center border rounded px-3 py-1 transition ${comment.hasDisliked ? "bg-red-200 border-red-400" : "bg-transparent border-gray-300 hover:bg-gray-100"
                        }`}
                      onClick={() => handleDislikeComment(comment._id)}
                    >
                      👎 {comment.dislikes || 0}
                    </button>
                    {comment.permission && (
                      <button
                        className="delete-button bg-red-500 text-white rounded px-2 py-1 ml-2 hover:bg-red-600 flex items-center"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <Image src={del_img} alt="delete" width={20} height={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 如果總頁數大於1 */}
          {totalPages > 1 && (
            <div className="pagination flex justify-center space-x-4 mt-6">
              <button
                onClick={handlePrevPage}
                className={`px-4 py-2 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'} `}
                disabled={currentPage === 1}
              >
                上一頁
              </button>
              <span className="flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'} `}
                disabled={currentPage === totalPages}
              >
                下一頁
              </button>
              <div className="flex items-center ml-4">
                <input
                  type="text"
                  value={inputPage}
                  onChange={handleInputChange}
                  className="w-16 text-center border rounded px-2 py-1"
                  placeholder="Page"
                />
                <button
                  onClick={handlePageJump}
                  className="ml-2 bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600"
                >
                  跳轉
                </button>
              </div>
            </div>
          )}


          {/* 推荐部分 */}
          <div className="recommendations-section mt-10">
            <h3 className="text-xl font-semibold">相關推薦</h3>
            <div className="recommendations-list flex flex-wrap gap-5">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec._id} className="recommendation flex flex-col items-center">
                    <a href={`/postsample/${rec._id}`} className="recommendation-link">
                      <div className="recommendation-content flex">
                        <img
                          src={rec.img_path}
                          alt={rec.title}
                          className="rec-image w-48 rounded"
                        />
                        <div className="rec-text flex-1 ml-4">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <p>相似度: {rec.similarity.toFixed(2)}</p>
                        </div>
                      </div>
                    </a>
                  </div>
                ))
              ) : (
                <p>沒有找到相關推薦</p>
              )}
            </div>
          </div>
        </div>
        <div className="fixed right-20 top-24 space-y-6 bg-transparent">
          {/* Author Information and PostActions */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            {/* Author Info */}
            <Link href={`/user/${postdata.user_id._id}`} className="flex items-center">
              <img
                className="w-12 h-12 rounded-full border border-gray-300 mr-4"
                src={postdata.user_id.img_path}
                alt="user avatar"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200" style={{fontSize: "1.6rem", fontWeight: "bold", textAlign: "center"}}>
                  {postdata.user_id.name}
                </p>
                <p className="text-xs text-gray-500">{postdata.user_id.email}</p>
              </div>
            </Link>
          </div>
          <PostActions postId={postdata._id} />
          {/* Table of Contents */}
          {toc.length > 0 && (
            <div className="toc w-64 max-auto overflow-y-auto p-4 border border-gray-300 rounded-lg bg-white shadow-lg">
              <h3 className="text-xl font-semibold mb-2">目錄</h3>
              <ul>
                {toc.map((item) => (
                  <li key={item.id} className={`toc-item flex items-center mb-2 ${activeId === item.id ? "font-bold" : ""}`}>
                    {activeId === item.id && <span className="indicator text-blue-400 mr-2">•</span>}
                    <button
                      className={`toc-link toc-${item.level.toLowerCase()} ${activeId === item.id ? "text-blue-600" : "text-black"} text-left w-full py-2`}
                      onClick={() => scrollToHeading(item.id)}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>




      </div>
    </div>
  );
};

export default PostDetail;
