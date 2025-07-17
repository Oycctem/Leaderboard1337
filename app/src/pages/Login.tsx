import { Link } from "react-router-dom"
import "../App.css"

function Login() {
  const client_id = import.meta.env.VITE_CLIENT_ID
  const redirect_uri = import.meta.env.VITE_REDIRECT_URI
  const url = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating code elements */}
      <div className="absolute top-20 left-20 code-decoration opacity-30 float">{"<code>"}</div>
      <div className="absolute top-40 right-32 code-decoration opacity-20 float" style={{ animationDelay: "1s" }}>
        {"function()"}
      </div>
      <div className="absolute bottom-32 left-16 code-decoration opacity-25 float" style={{ animationDelay: "2s" }}>
        {"return 42;"}
      </div>
      <div className="absolute bottom-20 right-20 code-decoration opacity-30 float" style={{ animationDelay: "0.5s" }}>
        {"</code>"}
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-lg w-full">
        {/* Enhanced Logo Section */}
        <div className="flex justify-center mb-12 slide-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20 scale-110"></div>
            <img className="relative w-48 h-48 object-contain float hover-glow" src="/gari1.svg.png" alt="42 Logo" />
          </div>
        </div>

        {/* Enhanced Title Section */}
        <div className="space-y-6 slide-in">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold gradient-text">1337 Pool Rank</h1>
            <div className="flex items-center justify-center space-x-2 text-lg text-slate-400">
              <span>🏆</span>
              <span>Rankings of poolers across Morocco</span>
              <span>🇲🇦</span>
            </div>
          </div>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="glass rounded-lg p-3">
              <div className="text-2xl font-bold gradient-text">4</div>
              <div className="text-xs text-slate-400">Campuses</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-2xl font-bold gradient-text">1000+</div>
              <div className="text-xs text-slate-400">Poolers</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-2xl font-bold gradient-text">Live</div>
              <div className="text-xs text-slate-400">Rankings</div>
            </div>
          </div>
        </div>

        {/* Enhanced Login Button */}
        <div className="pt-8 slide-in">
          <Link
            to={url}
            className="group inline-flex items-center justify-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-300 hover-glow transform hover:scale-105"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <img className="w-5 h-5 filter brightness-0 invert" src="/42_logo.png" alt="42" />
              </div>
              <span className="text-xl">Login with Intra</span>
            </div>
            <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
          </Link>

          <p className="text-sm text-slate-500 mt-4">Secure authentication via 42 Intranet</p>
        </div>

        {/* Enhanced Features */}
        <div className="pt-8 space-y-4 slide-in">
          <h3 className="text-lg font-semibold text-white mb-4">✨ Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-3 glass rounded-lg p-3">
              <span className="text-lg">⚡</span>
              <span className="text-slate-300">Real-time rankings</span>
            </div>
            <div className="flex items-center space-x-3 glass rounded-lg p-3">
              <span className="text-lg">🏫</span>
              <span className="text-slate-300">Multi-campus support</span>
            </div>
            <div className="flex items-center space-x-3 glass rounded-lg p-3">
              <span className="text-lg">📊</span>
              <span className="text-slate-300">Level progression</span>
            </div>
            <div className="flex items-center space-x-3 glass rounded-lg p-3">
              <span className="text-lg">🎯</span>
              <span className="text-slate-300">Pool tracking</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center slide-in">
          <p className="text-xs text-slate-600 code-decoration">Made with ❤️ for the 1337 community</p>
        </div>
      </div>
    </main>
  )
}

export default Login
