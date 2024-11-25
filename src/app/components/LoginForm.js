"use client";
import { useState } from "react";
import { post, get } from "../../utils/request";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = ({ onClose, onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  async function userLogin(event) {
    event.preventDefault(); // 阻止默认提交行为
    if (usernameOrEmail && password) {
      const res = await post(
        "/users/check-login",
        { usernameOrEmail, password },
        false
      );
      console.log("Response from server:", res);
      if (res.status === 200) {
        console.log(res)
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.data._id);
        //登錄成功則刷新當前界面
        window.location.reload();
        onLoginSuccess(res.data); // 传递用户详细信息
        toast.success("登入成功！", { autoClose: 3000 });
      } else if (res.status === 401) {
        toast.error(res.message || "登入失敗，請重試。", { autoClose: 3000 });
      } else {
        toast.error(res.message || "登入失敗，請重試。", { autoClose: 3000 });
      }
    } else {
      toast.warn("用戶名或者密碼不能為空。", { autoClose: 3000 });    }
  }

  return (
    <div className="modalOverlay" style={styles.modalOverlay} onClick={onClose}>
       <ToastContainer
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
          }}
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          pauseOnFocusLoss
        />
      <div className="modalContent" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>登入</h2>
        <form onSubmit={userLogin}>
          <div>
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
          <div>
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
          <button type="submit" style={styles.button}>登入</button>
          {/* <button type="button" onClick={onClose} style={{ ...styles.button, background: '#ccc' }}>關閉</button> */}
        </form>
      </div>
    </div>
  );
};

// 樣式設置
const styles = {
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 半透明背景
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    width: '350px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '5px',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    padding: '12px 20px',
    width: '100%',
    background: '#6e8efb',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background 0.3s, transform 0.3s',
    margin: '10px 0',
    fontWeight: 'bold',
  },
};

// hover效果
const handleInputFocus = (e) => {
  e.target.style.borderColor = '#6e8efb';
  e.target.style.boxShadow = '0 0 5px rgba(110, 142, 251, 0.5)';
};

const handleInputBlur = (e) => {
  e.target.style.borderColor = '#ccc';
  e.target.style.boxShadow = 'none';
};

const handleButtonHover = (e) => {
  e.target.style.transform = 'scale(1.05)';
};

const handleButtonLeave = (e) => {
  e.target.style.transform = 'scale(1)';
};

export default LoginForm;
