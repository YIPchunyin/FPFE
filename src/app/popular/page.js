// pages/Popular.js
import React from 'react';
import Link from 'next/link';
import styles from '@/app/components/style.module.css';

const Popular = () => {
  return (
    <div className={styles.container}>
      <h2>熱門帖子</h2>
      <main className={styles.posts}>
        {[...Array(20)].map((_, index) => (
          <Link key={index} href="/postsample" className={styles.link}>
            <div className={styles.post}>
              <h3>熱門帖子 {index + 1}</h3>
              <p>這是熱門討論中顯示的內容。</p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
};

export default Popular;