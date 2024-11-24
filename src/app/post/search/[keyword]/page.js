"use client"; // 确保这是一个客户端组件
import { useRouter } from 'next/router'; // 导入 useRouter
import { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { post, get } from '../../../../utils/request'; // 假设这是您用来请求数据的工具
import Image from 'next/image';
import Null from '@/app/public/null.png';
import Link from 'next/link';
export default function SearchPostPage() {
  let { keyword } = useParams();
  //將keyword塞入layout的搜索框裏
  
  keyword = decodeURIComponent(keyword); // 解码关键字
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        console.log('搜索关键字:', keyword);
        const res = await post('/posts/search', { keyword });
        if (res.status === 200) {
          setPosts(res.posts); // 假设返回的数据在 data 属性中
          console.log('搜索结果:', res);
        }
      } catch (error) {
        console.error('搜索请求失败:', error);
      }
    };

    if (keyword) { // 只有在 keyword 存在时才发起请求
      fetchSearchResults();
    }
  }, [keyword]); // 依赖于 keyword，keyword 更改时触发 useEffect
  function truncateContent(content, maxLength) {
    const strippedContent = content.replace(/<[^>]+>/g, ''); // 去掉 HTML 标签
    if (strippedContent.length <= maxLength) {
      return content; // 如果内容不超过最大长度，返回原内容
    }
    return content.substring(0, maxLength) + '...'; // 返回截断后的内容加省略号
  }

  return (
<div className="space-y-8 m-auto" style={{ maxWidth: '80%' }}>
  {posts.length > 0 ? (
    posts.map(post => (
      <div key={post._id} className="flex items-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* 左侧图片 */}
        {post.img_path && (
          <Link key={post._id} href={`/postsample/${post._id}`}>
          <img
            className="w-48 h-48 object-cover rounded-lg mr-8"
            src={post.img_path}
            alt={post.title}
          />
          </Link>
        )}
        {/* 右侧文字 */}
        <div className="flex-1">
        <Link key={post._id} href={`/postsample/${post._id}`}>
          <h2 className="text-2xl font-semibold text-gray-800">{post.title}</h2>
          <div
            className="text-lg text-gray-600"
            dangerouslySetInnerHTML={{ __html: truncateContent(post.content, 100) }}
          />
          </Link>

        </div>
      </div>
    ))
  ) : (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
      <Image
        className="w-24 h-24 mb-4"
        src={Null}
        alt="No results"
      />
      <p className="text-xl font-semibold text-gray-800">沒有找到相關結果</p>
    </div>
  )}
</div>


  );
}

