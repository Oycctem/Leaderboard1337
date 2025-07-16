import { Link } from "react-router-dom"
import "../App.css"

function Login() {
  const client_id = import.meta.env.VITE_CLIENT_ID
  const redirect_uri = import.meta.env.VITE_REDIRECT_URI
  const url = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-900">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <img className="w-10 h-10 filter brightness-0 invert" src="/gari1.svg.png" alt="42 Logo" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">1337 Pool Rank</h1>
          <p className="text-lg text-slate-400">Rankings of poolers across Morocco</p>
        </div>

        {/* Login Button */}
        <div className="pt-6">
          <Link
            to={url}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            <span className="text-lg">Login with Intra</span>
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
              <img className="w-4 h-4 filter brightness-0 invert" src="/42_logo.png" alt="42" />
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="pt-6 space-y-2 text-sm text-slate-500">
          <p>• Real-time rankings</p>
          <p>• Multiple campus support</p>
        </div>
      </div>
    </main>
  )
}

export default Login

