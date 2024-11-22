'use client';
import React from 'react';
import './LoadingSpinner.css'; // 导入样式文件

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">加载中，请稍候...</p>
    </div>
  );
};

export default LoadingSpinner;
