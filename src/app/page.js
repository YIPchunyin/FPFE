"use client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { get } from "../utils/request";
import PostActions from "./components/PostActions";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function Home() {
  const [postData, setPostData] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hiddenBotton, setHiddenBotton] = useState(false);
  const [isGridView, setIsGridView] = useState(true); // 新增的狀態變量
  useEffect(() => {
    async function fetchData() {
      const data = await get("/posts/");
      setPostData(data);
      // console.log(data.length);
      setVisiblePosts(12)
      setHiddenBotton(true)
    }

    fetchData();
  }, []);

  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };


  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100 && !loading) {
      loadMorePosts();
    }
  };

  const loadMorePosts = () => {
    if (visiblePosts < postData.length) {
      setLoading(true);
      setTimeout(() => {
        setVisiblePosts((prev) => Math.min(prev + 12, postData.length));
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading, visiblePosts, postData.length]);

  return (
    <div className="flex flex-col items-center p-5 max-w-[1400px] mx-auto">
      <Head>
        <title>旅遊論壇</title>
        <meta name="description" content="旅遊論壇主頁" />
      </Head>

      <main className="w-full">
        <h2 className="my-5 text-xl font-semibold">最新帖子<button onClick={toggleView} className="mb-5 ml-3 p-2 bg-blue-500 text-white rounded">
          {isGridView ? 'hidden title' : 'show title'}
        </button></h2>
        

{isGridView? (
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
)
:(
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
          {[...postData]
            .sort((a, b) => new Date(b.Creation_time) - new Date(a.Creation_time))
            .slice(0, visiblePosts)
            .map((post) => (
              <div key={post._id} className="relative group overflow-hidden">
                <Link key={post._id} href={`/postsample/${post._id}`} className="block">
                  <div className="relative">
                    {post.img_path && (
                      <img
                        src={post.img_path}
                        alt={post.title}
                        className="w-full h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {post.title.length > 20 ? `${post.title.substring(0, 20)}...` : post.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
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
                  </div>
                </Link>
                <div className="absolute inset-x-0 bottom-5 flex justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-70">
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
)
}

        

        {loading && <LoadingSpinner />}

        {hiddenBotton && visiblePosts >= postData.length && (
          <div className="flex justify-center my-5">
            <p className="text-lg text-gray-600">已經到底啦</p>
          </div>
        )}
      </main>
    </div>
  );
}
