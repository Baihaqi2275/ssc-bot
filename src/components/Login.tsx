import { useState } from "react";

type LoginProps = {
  onLogin: (username: string) => void;
  onShowRegister: () => void;
};

function Login({ onLogin, onShowRegister }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUsername = localStorage.getItem("registeredUsername");
    const savedPassword = localStorage.getItem("registeredPassword");

    const isDefaultAdmin = username === "admin" && password === "12345";
    const isRegisteredUser =
      username === savedUsername && password === savedPassword;

    if (isDefaultAdmin || isRegisteredUser) {
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("username", username);
      onLogin(username);
    } else {
      alert("Username atau password salah!");
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login MovieBot</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        <p>
          Belum punya akun?{" "}
          <span className="link-text" onClick={onShowRegister}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;