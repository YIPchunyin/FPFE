'use client'; // 确保这是一个客户端组件
import PostItem from '@/app/components/PostItem';

export default function UserProfile() {
  const user = {
    avatar: '/path/to/avatar.jpg', // 用户头像的路径
    postCount: 10,
    bio: '个人简介。',
    posts: [
      { id: 1, title: '我的第一篇帖子', thumbnail: '/path/to/thumbnail1.jpg' },
      { id: 2, title: '学习 Next.js', thumbnail: '/path/to/thumbnail2.jpg' },
      { id: 3, title: '分享我的旅行经历', thumbnail: '/path/to/thumbnail3.jpg' },
    ],
  };

  return (
    <div className="p-5">
      <div className="text-center">
        <img 
          src={user.avatar} 
          alt="User Avatar" 
          className="rounded-full w-24 h-24 mx-auto"
        />
        <h2 className="text-xl font-semibold mt-4 c">User Profile</h2>
        <p className="mt-2">帖子数量: {user.postCount}</p>
        <p className="mt-1">{user.bio}</p>
      </div>
      <h3 className="text-lg font-medium mt-6">曾经出过的帖子:</h3>
      <div className="mt-4">
        {user.posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
