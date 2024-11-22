"use client"
const baseUrl = 'http://localhost:3001/api/users/'
import React, { useState } from 'react';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async(event) => {
    event.preventDefault(); // 阻止默认提交行为
     if (password !== confirmPassword) {
         alert('密码和确认密码必须相同。');
         return;
     }
  const res = await fetch(`${baseUrl}Create-user`, {
      method: 'POST',
      body: JSON.stringify({
          username,
          password,
          email
      }),
      headers: {
          "Content-type": "application/json"
      }
  });
  let data = await res.json();
  if(res.status === 200){
    alert(data.message)
  }
  else if(res.status === 401){
    alert(data.message)
  }
}

  const handleBack = () => {
    // 返回逻辑，比如导航回登录页面
    console.log('返回到登录页面');
  };

  return (
    <div style={styles.container}>
      <h2>註冊新帳戶</h2>
      <form onSubmit={handleRegister} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="email">電郵地址</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
            <label htmlFor="username">用戶名</label>
            <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
        <div style={styles.inputGroup}>
          <label htmlFor="confirmPassword">確認密碼</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.button}>註冊</button>
          <button type="button" onClick={handleBack} style={styles.button}>返回</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1,
    marginRight: '5px',
  },
};

export default RegisterForm;