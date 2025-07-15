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
    <main className="min-h-screen flex flex-col justify-center items-center bg-slate-900">
      <div className="text-center space-y-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-white">Authenticating...</h2>
          <p className="text-slate-400">Please wait</p>
        </div>
      </div>
    </main>
  )
}

export default Callback

