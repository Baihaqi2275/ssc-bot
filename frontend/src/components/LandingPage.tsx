import { Settings, UserPlus, LogIn } from "lucide-react";

type LandingPageProps = {
  onSelect: (mode: "login_user" | "login_admin" | "register") => void;
};

export default function LandingPage({ onSelect }: LandingPageProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/img/bg-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Tombol Admin di pojok kanan atas */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => onSelect("login_admin")}
          className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
          title="Login Admin SSC"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="relative z-10 w-full max-w-xl p-6 text-center space-y-8">
        <div>
          <div className="w-44 h-44 mx-auto mb-6 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center p-6 ring-1 ring-white/20 hover:scale-105 transition-all duration-300">
            <img 
              src="/img/logo_transparent.png" 
              alt="SSC Logo" 
              className="w-full h-full object-contain drop-shadow-sm" 
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md tracking-tight">
            SSC ChatBot
          </h1>
          <p className="text-lg text-white/80 drop-shadow-sm">
            Layanan cerdas Student Service Center Telkom University. Silakan masuk atau daftar untuk memulai.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button 
            onClick={() => onSelect("login_user")}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 w-full sm:w-auto justify-center"
          >
            <LogIn className="w-5 h-5" />
            Login Mahasiswa
          </button>
          
          <button 
            onClick={() => onSelect("register")}
            className="flex items-center gap-2 px-8 py-3 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-md w-full sm:w-auto justify-center"
          >
            <UserPlus className="w-5 h-5" />
            Daftar Akun
          </button>
        </div>
        
        <div className="pt-12 text-white/50 text-sm">
          &copy; 2026 Kelompok 4 (IS-06-03). Telkom University.
        </div>
      </div>
    </div>
  );
}
