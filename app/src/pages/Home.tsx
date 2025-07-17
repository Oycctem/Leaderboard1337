"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import "../App.css"

interface User {
  id: number | null
  order: number
  login: string
  image?: string
  lvl: string
}

interface Campus {
  id: number
  name: string
}

function Home() {
  const [users, setUsers] = useState([] as User[])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMoreUsers, setHasMoreUsers] = useState(true)
  const loading = useRef<HTMLDivElement>(null)
  var { campus_name, begin_at } = useParams()
  const token: string = localStorage.getItem("token") || ""

  // Only 4 campuses as requested
  const [availableCampuses, setAvailableCampuses] = useState<Campus[]>([
    { id: 55, name: "Tetouan" },
    { id: 75, name: "Rabat" },
    { id: 21, name: "Benguerir" },
    { id: 16, name: "Khouribga" },
  ])

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/campuses`)
        const data = await response.json()
        if (data.status === 200) {
          setAvailableCampuses(data.data)
        }
      } catch (error) {
        console.log("Error fetching campuses:", error)
      }
    }

    fetchCampuses()
  }, [])

  const fetchUsers = async (page = 1, append = false) => {
    if (!append) {
      // Show loading overlay for initial load
      if (loading.current) {
        loading.current.classList.remove("hidden")
      }
    } else {
      setIsLoading(true)
    }

    const endPoint: string = `${import.meta.env.VITE_PUBLIC_API_URL}/cursus_users`
    const date = new Date(begin_at || new Date().toISOString())
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
    const body = {
      query: {
        firstDay: firstDay,
        lastDay: lastDay,
        token: token,
        campus_name: campus_name,
        page: page,
      },
    }
    try {
      const response = await fetch(`${endPoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      console.log("Raw response from backend:", data)

      if (data.status === 200 && Array.isArray(data.data)) {
        // Calculate the correct order based on page and existing users
        const startingOrder = append ? users.length + 1 : 1
        const processedUsers = data.data.map((user: any, index: number) => ({
          ...user,
          order: startingOrder + index,
        }))

        console.log("Processed users with correct order:", processedUsers)

        if (append) {
          setUsers((prevUsers) => [...prevUsers, ...processedUsers])
        } else {
          setUsers(processedUsers)
          setTotalUsers(data.total || processedUsers.length)
        }

        // Check if there are more users to load
        setHasMoreUsers(processedUsers.length === 100)
      } else {
        console.error("Invalid data structure received:", data)
        if (!append) {
          setUsers([])
          setTotalUsers(0)
        }
        setHasMoreUsers(false)
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error)
      if (!append) {
        setUsers([])
        setTotalUsers(0)
      }
      setHasMoreUsers(false)
    } finally {
      if (!append) {
        // Hide loading overlay
        if (loading.current) {
          loading.current.classList.add("hidden")
        }
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    // Reset state when campus or date changes
    setUsers([])
    setCurrentPage(1)
    setHasMoreUsers(true)
    fetchUsers(1, false)
  }, [campus_name, begin_at])

  const loadMoreUsers = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchUsers(nextPage, true)
  }

  const staticPromoList: { [key: string]: string } = {
    "2025-09": "2025-09",
    "2025-08": "2025-08",
    "2025-07": "2025-07",
    "spliter-1": "---",
    "2024-08": "2024-08",
    "2024-07": "2024-07",
    "2024-06": "2024-06",
    "spliter-2": "---",
    "2023-10": "2023-10",
    "2023-09": "2023-09",
    "2023-08": "2023-08",
    "spliter-3": "---",
    "2022-08": "2022-08",
    "2022-07": "2022-07",
    "2022-06": "2022-06",
  }

  const getRankBadge = (rank: number | string) => {
    const numericRank = Number(rank)
    if (isNaN(numericRank)) {
      console.warn("getRankBadge received non-numeric rank after conversion:", rank, "Converted to:", numericRank)
      return "N/A"
    }
    return `${numericRank}`
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "👑"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return ""
    }
  }

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return "h-40"
      case 2:
        return "h-32"
      case 3:
        return "h-28"
      default:
        return "h-20"
    }
  }

  const getPodiumOrder = (rank: number) => {
    switch (rank) {
      case 1:
        return "order-2"
      case 2:
        return "order-1"
      case 3:
        return "order-3"
      default:
        return ""
    }
  }

  const topThree = users.slice(0, 3)
  const remainingUsers = users.slice(3)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.15'%3E%3Cpath d='M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20-20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-800/95 via-purple-800/30 to-slate-800/95 backdrop-blur-xl border-b border-purple-500/20 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <span className="text-3xl animate-pulse">🏆</span>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  POOL LEADERBOARD
                </h1>
                <p className="text-slate-300 text-lg font-medium">{campus_name || "Tétouan"} Campus • Elite Coders</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {users.length}
              </div>
              <div className="text-slate-300 font-medium">Active Poolers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6">
          <select
            value={campus_name || "Tétouan"}
            onChange={(e) => {
              const selectedCampus = e.target.value
              location.href = `/${selectedCampus}/${begin_at}`
            }}
            className="bg-slate-700/90 backdrop-blur-sm border-2 border-purple-500/30 text-white rounded-2xl px-6 py-3 text-base font-medium hover:bg-slate-600/90 hover:border-purple-400/50 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
          >
            {availableCampuses.map((campus) => (
              <option key={campus.id} value={campus.name}>
                🏫 {campus.name}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => {
              location.href = `/${campus_name || "Tétouan"}/${e.target.value}`
            }}
            className="bg-slate-700/90 backdrop-blur-sm border-2 border-purple-500/30 text-white rounded-2xl px-6 py-3 text-base font-medium hover:bg-slate-600/90 hover:border-purple-400/50 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="0">📅 Select Promo</option>
            {Object.entries(staticPromoList).map(([key, value]) => {
              if (value === "---") {
                return (
                  <option disabled key={key} value={value}>
                    {value}
                  </option>
                )
              }
              return (
                <option key={key} value={value}>
                  {value}
                </option>
              )
            })}
          </select>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl text-base transition-all duration-300 flex items-center gap-3 hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            <span className="animate-spin text-xl">🔄</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {users.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-9xl mb-8 animate-bounce">😔</div>
            <h2 className="text-3xl font-bold text-white mb-6">No Poolers Found</h2>
            <p className="text-slate-400 mb-12 text-xl">Try selecting a different campus or promo</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-500/30"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="mb-16">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
                    🏆 HALL OF FAME 🏆
                  </h2>
                  <p className="text-slate-300 text-xl">The legendary coders dominating the leaderboard</p>
                </div>

                <div className="flex items-end justify-center gap-8 mb-12">
                  {topThree.map((user, index) => {
                    const rank = index + 1
                    return (
                      <div key={user.id || index} className={`flex flex-col items-center ${getPodiumOrder(rank)}`}>
                        {/* User Card */}
                        <div className="mb-6 group">
                          <a
                            href={`https://profile.intra.42.fr/users/${user.login}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <div
                              className={`relative p-8 rounded-3xl backdrop-blur-xl border-3 transition-all duration-500 hover:scale-110 hover:rotate-2 shadow-2xl ${
                                rank === 1
                                  ? "bg-gradient-to-br from-yellow-500/30 via-orange-500/20 to-red-500/30 border-yellow-400/60 hover:border-yellow-300 shadow-yellow-500/40"
                                  : rank === 2
                                    ? "bg-gradient-to-br from-gray-400/30 via-slate-500/20 to-gray-600/30 border-gray-400/60 hover:border-gray-300 shadow-gray-500/40"
                                    : "bg-gradient-to-br from-amber-600/30 via-orange-600/20 to-amber-800/30 border-amber-500/60 hover:border-amber-400 shadow-amber-500/40"
                              }`}
                            >
                              {/* Crown/Medal */}
                              <div className="absolute -top-4 -right-4 text-5xl animate-bounce medal-bounce">
                                {getMedalIcon(rank)}
                              </div>

                              {/* Large Avatar */}
                              <div className="relative mb-6">
                                <div
                                  className={`w-32 h-32 rounded-2xl overflow-hidden border-4 mx-auto shadow-2xl ${
                                    rank === 1
                                      ? "border-yellow-400 shadow-yellow-500/50"
                                      : rank === 2
                                        ? "border-gray-400 shadow-gray-500/50"
                                        : "border-amber-500 shadow-amber-500/50"
                                  }`}
                                >
                                  <img
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    src={user.image || "/cat.png"}
                                    alt={user.login}
                                  />
                                </div>
                                <div
                                  className={`absolute -bottom-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl ${
                                    rank === 1
                                      ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                                      : rank === 2
                                        ? "bg-gradient-to-br from-gray-400 to-gray-600"
                                        : "bg-gradient-to-br from-amber-500 to-amber-700"
                                  }`}
                                >
                                  {rank}
                                </div>
                              </div>

                              {/* User Info */}
                              <div className="text-center">
                                <h3 className="text-white font-black text-xl mb-2">{user.login}</h3>
                                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                  LVL {user.lvl}
                                </div>
                                <div className="mt-3 w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      rank === 1
                                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                        : rank === 2
                                          ? "bg-gradient-to-r from-gray-400 to-gray-600"
                                          : "bg-gradient-to-r from-amber-500 to-amber-700"
                                    }`}
                                    style={{ width: `${Math.min((Number.parseFloat(user.lvl) % 1) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>

                        {/* Enhanced Podium Base */}
                        <div
                          className={`w-32 ${getPodiumHeight(rank)} rounded-t-2xl shadow-2xl ${
                            rank === 1
                              ? "bg-gradient-to-t from-yellow-600 via-yellow-500 to-yellow-400 shadow-yellow-500/50"
                              : rank === 2
                                ? "bg-gradient-to-t from-gray-600 via-gray-500 to-gray-400 shadow-gray-500/50"
                                : "bg-gradient-to-t from-amber-700 via-amber-600 to-amber-500 shadow-amber-500/50"
                          } flex items-center justify-center border-t-4 ${
                            rank === 1 ? "border-yellow-300" : rank === 2 ? "border-gray-300" : "border-amber-300"
                          }`}
                        >
                          <span className="text-white font-black text-2xl">{rank}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Remaining Users */}
            {remainingUsers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent px-6">
                    Rising Stars
                  </h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
                </div>

                {remainingUsers.map((user, index) => {
                  const rankNumber = user.order

                  return (
                    <a
                      key={user.id || index}
                      href={`https://profile.intra.42.fr/users/${user.login}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block group"
                    >
                      <div className="bg-slate-800/70 backdrop-blur-xl hover:bg-slate-700/90 border-2 border-slate-700/50 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            {/* Enhanced Rank Badge */}
                            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-slate-600 via-purple-600/30 to-slate-700 rounded-2xl flex items-center justify-center text-white font-black border-2 border-slate-600/50 group-hover:border-purple-500/50 transition-all duration-300 shadow-lg">
                              <span className="text-lg">#{getRankBadge(rankNumber)}</span>
                            </div>

                            {/* Much Larger Avatar */}
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-slate-600/50 group-hover:border-purple-500/50 transition-all duration-300 shadow-xl">
                              <img
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                src={user.image || "/cat.png"}
                                alt={user.login}
                              />
                            </div>

                            {/* Enhanced User Info */}
                            <div>
                              <h3 className="text-white font-bold text-2xl group-hover:text-purple-400 transition-colors duration-300 mb-1">
                                {user.login}
                              </h3>
                              <p className="text-slate-400 text-base font-medium">Rank #{getRankBadge(rankNumber)}</p>
                            </div>
                          </div>

                          {/* Enhanced Level Display */}
                          <div className="text-right">
                            <div className="text-white font-black text-2xl mb-2">
                              <span className="text-slate-400 text-base font-normal">LVL </span>
                              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                {user.lvl}
                              </span>
                            </div>
                            <div className="w-24 h-3 bg-slate-700/70 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-1000 shadow-lg"
                                style={{ width: `${Math.min((Number.parseFloat(user.lvl) % 1) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}

            {/* Enhanced Load More Button */}
            {hasMoreUsers && (
              <div className="text-center mt-16">
                <button
                  onClick={loadMoreUsers}
                  disabled={isLoading}
                  className="px-12 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 flex items-center gap-4 mx-auto hover:scale-105 disabled:hover:scale-100 shadow-2xl shadow-purple-500/30"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading more legends...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">📄</span>
                      Load More Poolers
                    </>
                  )}
                </button>
                <p className="text-slate-400 text-lg mt-6 font-medium">
                  Showing {users.length} poolers • Click to load 100 more coding warriors
                </p>
              </div>
            )}

            {/* Enhanced End Message */}
            {!hasMoreUsers && users.length > 0 && (
              <div className="text-center mt-16 py-12 border-t-2 border-purple-500/30">
                <div className="text-6xl mb-6 animate-bounce">🎉</div>
                <p className="text-white text-2xl font-bold mb-4">Mission Complete!</p>
                <p className="text-slate-300 text-lg">
                  All {users.length} coding legends from {campus_name} have been revealed
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Loading overlay */}
      <div
        ref={loading}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-xl hidden"
      >
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-2xl shadow-purple-500/50"></div>
          <h3 className="text-white text-2xl font-bold mb-4">Loading Elite Rankings...</h3>
          <p className="text-slate-300 text-lg">Fetching the latest pool legends</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-lg"></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
