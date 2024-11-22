// components/PostItem.js

export default function PostItem({ post }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
        <img src={post.thumbnail} alt={post.title} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
        <h4 style={{ margin: 0 }}>{post.title}</h4>
      </div>
    );
  }