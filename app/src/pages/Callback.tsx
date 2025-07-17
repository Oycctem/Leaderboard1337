"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import "../App.css"

function Callback() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchUser = async (code: string) => {
      if (code === "null") {
        navigate("/login")
        return
      }
      const endPoint = `${import.meta.env.VITE_PUBLIC_API_URL}/login`
      let response = await fetch(endPoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            code: code,
          },
        }),
      })
      response = await response.json()
      if (response.status === 200) {
        if ((response as any).data.access_token === undefined) {
          navigate("/login")
          return
        }
        localStorage.setItem("token", (response as any).data.access_token)
        localStorage.setItem("promo", JSON.stringify((response as any).data.promo))
        navigate(`/${(response as any).data.promo.Campus.name}/${(response as any).data.promo.begin_at}`)
      } else {
        navigate("/login")
      }
    }
    const code = new URLSearchParams(location.search).get("code")
    fetchUser(code || "null")
  }, [])

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md mx-auto">
        <div className="glass rounded-2xl p-8">
          {/* Enhanced loading spinner */}
          <div className="relative mb-6">
            <div className="loading-spinner mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">42</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold gradient-text">Authenticating</h2>
            <p className="text-slate-400">Connecting to 42 Intranet...</p>

            {/* Progress steps */}
            <div className="space-y-2 text-sm text-slate-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Received authorization code</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Exchanging for access token</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                <span>Fetching user profile</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600">This should only take a moment...</p>
      </div>
    </main>
  )
}

export default Callback
