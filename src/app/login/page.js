// app/login/.js
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const LoginForm = () => {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault(); // 阻止默认提交行为
    console.log(usernameOrEmail /*, password*/);
    setError(null); // Reset error state

    if (usernameOrEmail && password) {
      try {
        const { status, message } = await login({
          usernameOrEmail,
          password,
        });

        if (status === 200) {
          console.log("登录成功:", message);
          console.log("Navigating to home page...");
          router.push("/"); //返回首頁
        } else {
          setError(message || "Login failed. Please try again.");
          console.error("登录失败:", message);
          alert("登录失败");
        }
      } catch (err) {
        // 其他错误处理
        console.error("登入中发生错误:", err);
        setError("发生错误，请稍后再试。");
        alert("发生错误，请稍后再试。");
      }
    } else {
      console.error("用户名或密码不能为空。");
      setError("用户名或密码不能为空。");
      alert("用户名或密码不能为空。");
    }
  };

  return (
    <div style={styles.container}>
      <h2>登录论坛</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label htmlFor="usernameOrEmail">帳戶/電子郵件</label>
          <input
            type="text"
            id="usernameOrEmail"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password">密碼</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>
          登陸
        </button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default LoginForm;
