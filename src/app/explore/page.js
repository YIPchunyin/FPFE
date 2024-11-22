// pages/Explore.js
import React from 'react';
import Link from 'next/link';
import styles from '@/app/components/style.module.css';

const Explore = () => {
  return (
    <div className={styles.container}>
      <h2>發現新大陸</h2>
      <main className={styles.posts}>
        {[...Array(20)].map((_, index) => (
          <Link key={index} href="/postsample" className={styles.link}>
            <div className={styles.post}>
              <h3>探索帖子 {index + 1}</h3>
              <p>這是探索中顯示的內容。</p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
};

export default Explore;