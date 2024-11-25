"use client";
import localFont from "next/font/local";
import LoginForm from "./components/LoginForm";
import RegisterForm from "@/app/components/RegisterForm";
import { useEffect, useState } from "react";
import { getUserId } from "@/utils/auth";
import { removeToken, getToken } from "./../utils/auth";
// import logo from '@/app/public/logo2.jpg';
import logo from '@/app/public/logo.png';
import Image from "next/image";
import creatpost from "@/app/public/createpost.png";
import searchIcon from "@/app/public/search.png";
import Link from "next/link";
import { post } from "../utils/request";
import { usePathname } from 'next/navigation';
import '../../styles/globals.css';
import userimg from "@/app/public/user.png";
import 'quill/dist/quill.snow.css';



// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export default function RootLayout({ children }) {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleLoginSuccess = (user) => {
    setUserDetails(user);
    setIsLoggedIn(true);
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserDetails({});
    removeToken();
    localStorage.removeItem("userId");
  };


  //search function
  const handleSearch = () => {
    if (searchKeyword.trim()) {
      //跳轉到搜索頁面
      window.location.href = `/post/search/${searchKeyword}`;
    }
  };


  useEffect(() => {
    const token = getToken();
    if (token) {
      const fetchUserDetails = async () => {
        try {
          const res = await post("/users/get-user-info", { token }, true);
          if (res.status === 200) {
            // console.log("用戶信息:", res);
            setUserDetails(res.user);
            setIsLoggedIn(true);
            localStorage.setItem("userId", res.user._id);
            console.log(res.user._id)
          }
        } catch (error) {
          console.log("請求用戶信息時發生錯誤:", error);
        }
      };
      fetchUserDetails();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isOnCreatePostPage = pathname === '/createpost';

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="flex items-center justify-center w-full py-2 border-b border-gray-300">
          <div className="flex items-center justify-between w-4/5 mx-auto">
            <div className="flex items-center">
              <Link href="/">
                <Image src={logo} alt="Logo" width={50} height={50} className="rounded-full" />
              </Link>
            </div>
            <div className="flex items-center flex-1 mx-5">
              <input
                type="text"
                placeholder="搜索..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button onClick={handleSearch}>
                <Image src={searchIcon} alt="搜索" width={30} height={30} className="ml-3 cursor-pointer" />
              </button>
            </div>
            <div className="flex">
              {isLoggedIn ? (
                <div className="relative group flex items-center">
                  <Link href={`/users/userprofile/${userDetails._id || getUserId()}`} className="flex items-center">
                    <Image
                      src={userDetails.img_path || userimg} // 使用用户头像或默认头像
                      alt={`${userDetails.username || '用户'}的头像`}
                      width={50}
                      height={50}
                      //原型頭像
                      className="cursor-pointer rounded-full object-cover"
                    />
                    {/* <span className="px-2 py-2 group-hover:cursor-pointer">{userDetails.name}</span> */}
                  </Link>
                  <div className="absolute hidden w-60 p-4 bg-white border border-gray-300 shadow-md mt-48 group-hover:block" style={{ zIndex: 10000 }}>
                    <p>用户名: {userDetails.name}</p>
                    <p>邮箱: {userDetails.email}</p>
                    <p>身份: {userDetails.role}</p>
                    <button className="p-2 bg-blue-600 text-white rounded" onClick={handleLogout}>
                      登出
                    </button>
                  </div>

                  {isLoggedIn && !isOnCreatePostPage && (
                    <div className="cursor-pointer ml-3">
                      <Link href="/createpost">
                        <Image src={creatpost} alt="發帖" width={30} height={30} />
                      </Link>
                    </div>
                  )}
                </div>

              ) : (
                <>
                  <button className="px-4 py-2 ml-2 text-white bg-blue-600 rounded" onClick={() => setLoginOpen(true)}>
                    登入
                  </button>
                  <button className="px-4 py-2 ml-2 text-white bg-blue-600 rounded" onClick={() => setRegisterOpen(true)}>
                    注册
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {isLoginOpen && (
          <LoginForm
            isOpen={isLoginOpen}
            onClose={() => setLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {isRegisterOpen && (
          <RegisterForm
            onClose={() => setRegisterOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}



        {children}

        {isVisible && (
          <button onClick={scrollToTop} className="fixed bottom-5 right-5 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full transition-colors duration-300 hover:bg-blue-700">
            ↑
          </button>
        )}
      </body>
    </html>

  );

}

