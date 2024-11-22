// pages/logout/.js
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  const router = useRouter();
  const { logout } = useAuth(); //

  const handleLogout = async () => {
    try {
      // await fetch("http://localhost:3001/logout", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });
      //
      //call auth logout function
      logout();
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return <button onClick={handleLogout}>登出</button>;
};

export default LogoutButton;
