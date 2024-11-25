"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { get, put, post, uploadImage } from "@/utils/request";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const [userPosts, setUserPosts] = useState([]);
  const [collectedPosts, setCollectedPosts] = useState([]);
  const [displayCollected, setDisplayCollected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({});

  //獲得使用者資料
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await get(`/users/userprofile/${userId}`, true);
        setUser(res.user);
        setUserPosts(res.userPosts);
        setCollectedPosts(res.collectedPosts);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("無法獲取用戶資料");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  //更新使用者頭像
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoadingImage(true);
      try {
        const uploadResult = await uploadImage(file);
        const imageUrl = uploadResult.imageUrl;

        //更新使用者頭像
        setUser((prevUser) => ({ ...prevUser, img_path: imageUrl }));
        await put(`/users/${userId}`, { img_path: imageUrl });
        toast.success("头像更新成功!");
      } catch (error) {
        toast.error("头像更新失败，请重试");
        console.error("Image upload error:", error);
      } finally {
        setLoadingImage(false);
      }
    }
  };

  //更新使用者資料
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await put(`/users/${userId}`, updatedData);
      setUser(response);
      toast.success("個人簡介更新成功!");
      setIsEditing(false); // Close editing mode
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("更新個人簡介失敗!請重新嘗試");
    }
  };

  //更新密碼
  const handleUpdatePassword = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!currentPassword) {
      toast.warn("請輸入當前密碼");
      return;
    }
    if (!newPassword) {
      toast.warn("請輸入新密碼");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.warn("兩次新密碼必須相同");
      return;
    }

    try {
      const passwordCheckResponse = await post(`/users/check-password`, {
        userId,
        currentPassword,
      });

      if (!passwordCheckResponse.valid) {
        toast.error("當前密碼不正確");
        return;
      }

      await put(`/users/${userId}`, { password: newPassword });
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm(""); // Clear the confirm password field
      toast.success("密碼更新成功!");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("更新密碼失敗!請重新嘗試");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
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

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="relative">
            <img
              src={user.img_path || "/default-avatar.png"}
              alt="User Avatar"
              className={`w-24 h-24 rounded-full border-2 border-gray-300 object-cover cursor-pointer ${
                loadingImage ? "opacity-50" : ""
              }`}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              id="avatar-input"
              className="hidden"
            />
            <div
              onClick={() => document.getElementById("avatar-input").click()} // Trigger input on overlay click
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300"
            >
              <span className="text-white text-sm">更換頭像</span>
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">你好，{user.name}</h1>
            <p className="text-gray-600">賬號號碼：{user.username}</p>
            <p className="text-gray-600">身份：{user.role}</p>
            <p className="text-gray-600">連結電郵：{user.email}</p>
            <p className="mt-2 text-gray-500">自我介紹：{user.introduce}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                用戶名：
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={user.name}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, name: e.target.value })
                }
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                電郵：
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={user.email}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, email: e.target.value })
                }
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="introduce"
                className="block text-sm font-medium text-gray-700"
              >
                自我介紹
              </label>
              <textarea
                id="introduce"
                name="introduce"
                defaultValue={user.introduce}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, introduce: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              ></textarea>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 ease-in-out w-full"
              >
                更新使用者資料
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200 ease-in-out w-full"
              >
                取消
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            <button
              onClick={() => setIsEditing(true)}
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 ease-in-out w-full"
            >
              編輯使用者資料
            </button>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 ease-in-out w-full"
          >
            更新密碼
          </button>
        </div>

        {showPasswordModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="modal bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">更改密碼</h2>
              <form onSubmit={handleUpdatePassword}>
                <input
                  type="password"
                  placeholder="當前密碼"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-3 mb-4"
                />
                <input
                  type="password"
                  placeholder="新密碼"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-3 mb-4"
                />
                <input
                  type="password"
                  placeholder="確認新密碼"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-3 mb-4"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 ease-in-out"
                  >
                    提交
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    type="button"
                    className="ml-2 px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200 ease-in-out"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Buttons */}
      <div className="flex mt-4">
        <button
          onClick={() => setDisplayCollected(false)}
          className={`px-4 py-2 mr-2 ${
            !displayCollected
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          } rounded-md`}
        >
          上傳的帖子
        </button>
        <button
          onClick={() => setDisplayCollected(true)}
          className={`px-4 py-2 ${
            displayCollected
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          } rounded-md`}
        >
          收藏的帖子
        </button>
      </div>

      {/* Display Posts */}

      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        <h2 className="mt-4 text-xl font-semibold">
          {displayCollected ? "收藏的帖子" : "你上傳的帖子"}
        </h2>
        <ul className="mt-2">
          {(displayCollected ? collectedPosts : userPosts).length > 0 ? (
            (displayCollected ? collectedPosts : userPosts).map((post) => (
              <li key={post.postId} className="border-b py-2">
                <Link
                  href={`/postsample/${post.postId}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {post.title}
                </Link>
                {/* If displaying userPosts, you may want to skip author */}
                {displayCollected && post.author && (
                  <p>發佈者: {post.author}</p>
                )}
                <div className="text-sm text-gray-500">
                  <p>瀏覽次數: {post.views}</p>
                  <p>創建時間: {post.createdAt}</p>{" "}
                  {/* Directly use the preformatted createdAt */}
                </div>
              </li>
            ))
          ) : (
            <p>未有相關貼文</p>
          )}
        </ul>
      </div>
    </div>
  );
}
