"use client"
// pages/regions.js
import React from 'react';
import CountryOrRegionList from  '@/app/components/CountryOrRegionList';
import styles from '@/app/components/style.module.css';

const regions = [
  { id: 1, name: '美國' },
  { id: 2, name: '英國' },
  { id: 3, name: '日本' },
  { id: 4, name: '法國' },
  // 添加更多地区...
];

const RegionsPage = () => {
  const handleRegionClick = (region) => {
    // 在这里处理点击事件，例如导航到该地区的详细页面
    console.log(`You clicked on ${region.name}`);
  };

  return (
    <div className={styles.container}>
      <h1>選擇一個國家或地區</h1>
      <CountryOrRegionList regions={regions} onRegionClick={handleRegionClick} />
    </div>
  );
};

export default RegionsPage;