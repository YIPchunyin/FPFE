'use client'
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { post,get } from '@/utils/request';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Link from "next/link";
import Head from "next/head";
import PostActions from "@/app/components/PostActions";

const UserAllPost = () => {
    const { userId } = useParams();
    const [userinfo, setUserInfo] = useState({});
    const [daysSinceCreation, setDaysSinceCreation] = useState('');
    const [postData, setPostsData] = useState([]);
    const [visiblePosts, setVisiblePosts] = useState(12);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        const getUserdata = async () => {
            try {
                const res = await post("/users/get-user", {userId}, false);
                if (res && res.user) {
                    setUserInfo(res.user);
                    const days = formatDistanceToNow(parseISO(res.user.Creation_time), { locale: zhTW });
                    setDaysSinceCreation(days);
                }
                const res2 = await get(`/posts/${userId}`, false);
                setPostsData(res2);
            } catch (error) {
                console.error('獲取用戶信息失敗:', error);
            }
        }
        getUserdata();
    }, [userId]);



    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
    
        if (scrollTop + windowHeight >= documentHeight - 100 && !loading) {
          loadMorePosts();
        }
      };
    
      const loadMorePosts = () => {
        setLoading(true);
        setTimeout(() => {
          setVisiblePosts((prev) => prev + 12);
          setLoading(false);
        }, 500);
      };
    
      useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
          window.removeEventListener("scroll", handleScroll);
        };
      }, [loading]);

    if (!userinfo.username) {
        return <LoadingSpinner />;
    }

    return (
<div
  className="mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-8 p-6 transition-opacity duration-500 transform opacity-0 animate-fadeIn"
  style={{ maxWidth: "80%" }}
>
  <div className="flex items-center mb-6">
    {/* 左侧头像 */}
    <img
      className="w-32 h-32 rounded-full shadow-lg transform transition-transform duration-500 translate-x-[-50px] opacity-0 animate-slideInLeft"
      src={userinfo.img_path}
      alt={`${userinfo.name}的头像`}
    />
    {/* 右侧文字 */}
    <div className="ml-6 transform transition-transform duration-500 translate-x-[50px] opacity-0 animate-slideInRight">
      <h2 className="text-4xl font-bold">{userinfo.name}</h2>
      <p className="text-xl font-light text-gray-500">{userinfo.role}</p>
      <p className="text-lg text-gray-700"><strong>電子郵件:</strong> {userinfo.email}</p>
    <p className="text-lg text-gray-700"><strong>簡介:</strong> {userinfo.introduce}</p>
    <p className="text-lg text-gray-700"><strong>創建時間:</strong> {new Date(userinfo.Creation_time).toLocaleString('zh-TW')}</p>
    <p className="text-lg text-gray-700"><strong>入站天數:</strong> {daysSinceCreation}</p>

    </div>
  </div>  
  <div className="mt-6">
    <h3 className="text-3xl font-semibold mb-4">用户帖子</h3>
    {/* 示例帖子列表 */}
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
    {[...postData]
      .sort((a, b) => new Date(b.Creation_time) - new Date(a.Creation_time))
      .slice(0, visiblePosts)
      .map((post) => (
        <div key={post._id} className="relative">
          <Link key={post._id} href={`/postsample/${post._id}`}>
            <div className="bg-gray-100 p-4 border border-gray-300 rounded shadow-lg hover:shadow-2xl animation-slideInUp">
              {post.img_path && (
                <div className="w-full h-[300px] overflow-hidden mb-2 rounded-lg">
                  <img
                    src={post.img_path}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <h3 className="text-lg font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
                {post.title.length > 20 ? `${post.title.substring(0, 20)}...` : post.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {new Date(post.Creation_time).toLocaleString(undefined, {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </div>
          </Link>
          <div className="mt-2 w-full m-auto flex justify-center">
            <PostActions
              postId={post._id}
              initialLikes={post.likes}
              initialCollections={post.collections}
              initialIsLiked={post.isLiked}
              initialIsCollected={post.isCollected}
            />
          </div>
        </div>
      ))}
  </div>

  {loading && (
    <div className="flex justify-center my-5">
      <p className="text-lg text-gray-600">加載中...</p>
    </div>
  )}
</div>

    );
}

export default UserAllPost;
