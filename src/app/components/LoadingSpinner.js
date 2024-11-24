'use client';
import React from 'react';
import Image from 'next/image'; // 如果使用 Next.js
import logo from '@/app/public/logo.png';

const LoadingSpinner = () => {
  return (
    <div className='flex justify-center max-w-3xl m-auto  items-center h-screen flex-col animate-blink'>
        <Image width={500} height={500} src={logo} alt="Logo" className="" />
        <p className='text-center text-4xl font-bold'>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
