import { useState } from "react";
import Chatbot from "./components/Chatbot";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(
    localStorage.getItem("isLogin") === "true"
  );

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (name: string) => {
    setUsername(name);
    setIsLogin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");
    setUsername("");
    setIsLogin(false);
  };

  if (!isLogin && showRegister) {
    return <Register onShowLogin={() => setShowRegister(false)} />;
  }

  if (!isLogin) {
    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <>
      <div className="navbar">
        <h3>MovieBot</h3>
        <div>
          <span>Halo, {username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <Chatbot />
    </>
  );
}

export default App;