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
        return "🥇"
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
        return "h-32"
      case 2:
        return "h-24"
      case 3:
        return "h-20"
      default:
        return "h-16"
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-b border-slate-600/50 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Pool Leaderboard
                </h1>
                <p className="text-slate-400">{campus_name || "Tétouan"} Campus</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-slate-400 text-sm">Active Poolers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
          <select
            value={campus_name || "Tétouan"}
            onChange={(e) => {
              const selectedCampus = e.target.value
              location.href = `/${selectedCampus}/${begin_at}`
            }}
            className="bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 text-white rounded-xl px-4 py-2 text-sm hover:bg-slate-600/80 transition-all duration-200"
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
            className="bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 text-white rounded-xl px-4 py-2 text-sm hover:bg-slate-600/80 transition-all duration-200"
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
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm transition-all duration-200 flex items-center gap-2 hover:scale-105"
          >
            <span className="animate-spin">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-8">
        {users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 animate-bounce">😔</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Poolers Found</h2>
            <p className="text-slate-400 mb-8 text-lg">Try selecting a different campus or promo</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="mb-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    🏆 Top Performers 🏆
                  </h2>
                  <p className="text-slate-400">The elite coders leading the pack</p>
                </div>

                <div className="flex items-end justify-center gap-4 mb-8">
                  {topThree.map((user, index) => {
                    const rank = index + 1
                    return (
                      <div key={user.id || index} className={`flex flex-col items-center ${getPodiumOrder(rank)}`}>
                        {/* User Card */}
                        <div className="mb-4 group">
                          <a
                            href={`https://profile.intra.42.fr/users/${user.login}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <div
                              className={`relative p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 hover:rotate-1 ${
                                rank === 1
                                  ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50 hover:border-yellow-400"
                                  : rank === 2
                                    ? "bg-gradient-to-br from-gray-400/20 to-gray-600/20 border-gray-400/50 hover:border-gray-400"
                                    : "bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-600/50 hover:border-amber-600"
                              }`}
                            >
                              {/* Medal */}
                              <div className="absolute -top-3 -right-3 text-3xl animate-pulse">
                                {getMedalIcon(rank)}
                              </div>

                              {/* Avatar */}
                              <div className="relative mb-4">
                                <img
                                  className="w-20 h-20 rounded-xl object-cover border-4 border-white/20 mx-auto"
                                  src={user.image || "/cat.png"}
                                  alt={user.login}
                                />
                                <div
                                  className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                    rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-600"
                                  }`}
                                >
                                  {rank}
                                </div>
                              </div>

                              {/* User Info */}
                              <div className="text-center">
                                <h3 className="text-white font-bold text-lg mb-1">{user.login}</h3>
                                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                  LVL {user.lvl}
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>

                        {/* Podium Base */}
                        <div
                          className={`w-24 ${getPodiumHeight(rank)} rounded-t-lg ${
                            rank === 1
                              ? "bg-gradient-to-t from-yellow-600 to-yellow-400"
                              : rank === 2
                                ? "bg-gradient-to-t from-gray-500 to-gray-400"
                                : "bg-gradient-to-t from-amber-700 to-amber-600"
                          } flex items-center justify-center`}
                        >
                          <span className="text-white font-bold text-xl">{rank}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Remaining Users */}
            {remainingUsers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
                  <h3 className="text-lg font-semibold text-slate-300 px-4">Other Competitors</h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
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
                      <div className="bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600/50 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Rank Badge */}
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-white font-bold border border-slate-600/50">
                              #{getRankBadge(rankNumber)}
                            </div>

                            {/* Avatar */}
                            <img
                              className="w-12 h-12 rounded-xl object-cover border-2 border-slate-600/50 group-hover:border-blue-500/50 transition-colors duration-200"
                              src={user.image || "/cat.png"}
                              alt={user.login}
                            />

                            {/* User Info */}
                            <div>
                              <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors duration-200">
                                {user.login}
                              </h3>
                              <p className="text-slate-400 text-sm">Rank #{getRankBadge(rankNumber)}</p>
                            </div>
                          </div>

                          {/* Level */}
                          <div className="text-right">
                            <div className="text-white font-bold text-xl mb-1">
                              <span className="text-slate-400 text-sm font-normal">LVL </span>
                              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {user.lvl}
                              </span>
                            </div>
                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
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

            {/* Load More Button */}
            {hasMoreUsers && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreUsers}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-3 mx-auto hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading more poolers...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📄</span>
                      Load More Poolers
                    </>
                  )}
                </button>
                <p className="text-slate-400 text-sm mt-4">Showing {users.length} poolers • Click to load 100 more</p>
              </div>
            )}

            {/* End of results message */}
            {!hasMoreUsers && users.length > 0 && (
              <div className="text-center mt-12 py-8 border-t border-slate-700/50">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-slate-300 text-lg font-medium mb-2">You've reached the end!</p>
                <p className="text-slate-400">
                  Showing all {users.length} poolers from {campus_name}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading overlay */}
      <div
        ref={loading}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm hidden"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-white text-xl font-semibold mb-2">Loading Rankings...</h3>
          <p className="text-slate-400">Fetching the latest pool data</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
