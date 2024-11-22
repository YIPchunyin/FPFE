// context/AuthContext.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { post } from "../../utils/request";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  //拿token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch("http://localhost:3001/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data); // Assuming data contains user info
        } else {
          // Handle unauthorized access, e.g., clear token
          localStorage.removeItem("token");
        }
      }
    };

    fetchUser();
  }, []);
  //登入
  const login = async ({ usernameOrEmail, password }) => {
    const res = await post("/users/check-login", { usernameOrEmail, password });
    console.log(res);

    if (res.ok) {
      localStorage.setItem("token", data.token); // Store token
      // Set user state in AuthContext
      setUser(data.data); // Assuming data.data contains user info
      return { status: 200, message: "Login successful" };
    } else {
      console.error(data.message);
      return { status: res.status, message: data.message };
    }
  };

  //登出
  const logout = () => {
    localStorage.removeItem("token"); // Clear token
    setUser(null); // Clear user state
  };

  // Logic for logging in/out and setting user
  // const login = (userData) => {
  //   setUser(userData);
  // };

  // const logout = () => {
  //   setUser(null);
  // };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
