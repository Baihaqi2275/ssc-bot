import { useState } from "react";

type RegisterProps = {
  onShowLogin: () => void;
};

function Register({ onShowLogin }: RegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input kosong
    if (!username || !password) {
      alert("Username dan password wajib diisi!");
      return;
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    // Simpan akun ke localStorage
    localStorage.setItem("registeredUsername", username);
    localStorage.setItem("registeredPassword", password);

    alert("Register berhasil! Silakan login.");

    // Kembali ke halaman login
    onShowLogin();
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleRegister}>
        <h2>Register MovieBot</h2>

        <input
          type="text"
          placeholder="Buat Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Buat Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Register</button>

        <p>
          Sudah punya akun?{" "}
          <span className="link-text" onClick={onShowLogin}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;