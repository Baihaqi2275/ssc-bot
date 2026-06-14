import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

import { ArrowLeft } from "lucide-react";

type LoginProps = {
  onLogin: (username: string, role: string) => void;
  onShowRegister: () => void;
  onBack: () => void;
};

function Login({ onLogin, onShowRegister, onBack }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      const data = await response.json();

      if (data.status === "success" && data.data.role === "user") {
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("username", data.data.name);
        localStorage.setItem("role", "user");
        localStorage.setItem("token", data.token);
        onLogin(data.data.name, "user");
      } else {
        alert(data.message || "Username atau password salah!");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/img/bg-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, hsla(359, 75%, 28%, 0.85) 0%, transparent 35%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to left, hsla(359, 75%, 28%, 0.8) 0%, transparent 25%)' }} />
      <Card className="w-full max-w-md shadow-xl border-muted relative z-10 bg-background/95 backdrop-blur-sm">
        <button 
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <CardHeader className="space-y-1 mt-4">
          <CardTitle className="text-2xl font-bold text-primary tracking-tight text-center mb-2">
            Portal Mahasiswa
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan username dan password Anda untuk masuk
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Login"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Belum punya akun?{" "}
              <button 
                type="button" 
                onClick={onShowRegister}
                className="text-primary hover:underline font-medium"
              >
                Register
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Login;