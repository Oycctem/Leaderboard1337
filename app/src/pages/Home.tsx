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

  const getRankIcon = (rank: number) => {
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

  const getRankBadgeClass = (rank: number) => {
    const baseClass = "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
    switch (rank) {
      case 1:
        return `${baseClass} rank-badge-1`
      case 2:
        return `${baseClass} rank-badge-2`
      case 3:
        return `${baseClass} rank-badge-3`
      default:
        return `${baseClass} rank-badge`
    }
  }

  const getCardClass = (rank: number) => {
    const baseClass = "block leaderboard-card rounded-xl p-6 transition-all duration-300 stagger-item"
    if (rank <= 3) {
      return `${baseClass} top-performer rank-${rank}`
    }
    return baseClass
  }

  const getLevelColor = (level: string) => {
    const numLevel = Number.parseFloat(level)
    if (numLevel >= 10) return "text-purple-400"
    if (numLevel >= 7) return "text-blue-400"
    if (numLevel >= 5) return "text-green-400"
    if (numLevel >= 3) return "text-yellow-400"
    return "text-gray-400"
  }

  const getLevelProgress = (level: string) => {
    const numLevel = Number.parseFloat(level)
    const progress = (numLevel % 1) * 100
    return progress
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with improved styling */}
      <div className="glass border-b border-blue-500/20 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Pool Leaderboard</h1>
                <p className="text-slate-400 text-sm">
                  <span className="code-decoration">1337</span> • {campus_name || "Tétouan"} Campus
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-slate-400 text-sm">{hasMoreUsers ? `of ${totalUsers}+` : "total"} poolers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="glass border-b border-blue-500/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-sm">🏫</span>
            <select
              value={campus_name || "Tétouan"}
              onChange={(e) => {
                const selectedCampus = e.target.value
                location.href = `/${selectedCampus}/${begin_at}`
              }}
              className="bg-slate-800/80 border border-slate-600/50 text-white rounded-lg px-4 py-2 text-sm backdrop-blur-sm hover:border-blue-500/50 transition-colors"
            >
              {availableCampuses.map((campus) => (
                <option key={campus.id} value={campus.name}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-sm">📅</span>
            <select
              onChange={(e) => {
                location.href = `/${campus_name || "Tétouan"}/${e.target.value}`
              }}
              className="bg-slate-800/80 border border-slate-600/50 text-white rounded-lg px-4 py-2 text-sm backdrop-blur-sm hover:border-blue-500/50 transition-colors"
            >
              <option value="0">Select Promo</option>
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
                    Pool {value}
                  </option>
                )
              })}
            </select>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="btn-secondary px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover-glow"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Content with improved layout */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {users.length === 0 ? (
          <div className="text-center py-20 slide-in">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">😔</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Poolers Found</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              It looks like there are no students in this pool yet. Try selecting a different campus or promo period.
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center space-x-2">
              <span>←</span>
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {users.length >= 3 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-8 gradient-text">🏆 Top Performers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {/* 2nd Place */}
                  <div className="order-1 md:order-1">
                    <div className="glass rounded-2xl p-6 text-center hover-glow">
                      <div className="w-20 h-20 mx-auto mb-4 relative">
                        <img
                          className="w-20 h-20 rounded-full object-cover border-4 border-silver-400"
                          src={users[1]?.image || "/cat.png"}
                          alt={users[1]?.login}
                        />
                        <div className="absolute -top-2 -right-2 text-2xl">🥈</div>
                      </div>
                      <h3 className="text-xl font-bold gradient-text-silver mb-2">{users[1]?.login}</h3>
                      <div className="text-3xl font-bold text-white mb-2">LVL {users[1]?.lvl}</div>
                      <div className="text-sm text-slate-400">#2 Runner-up</div>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="order-2 md:order-2 md:-mt-8">
                    <div className="glass rounded-2xl p-8 text-center hover-glow pulse-glow">
                      <div className="w-24 h-24 mx-auto mb-4 relative">
                        <img
                          className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
                          src={users[0]?.image || "/cat.png"}
                          alt={users[0]?.login}
                        />
                        <div className="absolute -top-3 -right-3 text-3xl">👑</div>
                      </div>
                      <h3 className="text-2xl font-bold gradient-text-gold mb-3">{users[0]?.login}</h3>
                      <div className="text-4xl font-bold text-white mb-3">LVL {users[0]?.lvl}</div>
                      <div className="text-sm text-yellow-400 font-medium">🏆 Champion</div>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="order-3 md:order-3">
                    <div className="glass rounded-2xl p-6 text-center hover-glow">
                      <div className="w-20 h-20 mx-auto mb-4 relative">
                        <img
                          className="w-20 h-20 rounded-full object-cover border-4 border-orange-400"
                          src={users[2]?.image || "/cat.png"}
                          alt={users[2]?.login}
                        />
                        <div className="absolute -top-2 -right-2 text-2xl">🥉</div>
                      </div>
                      <h3 className="text-xl font-bold gradient-text-bronze mb-2">{users[2]?.login}</h3>
                      <div className="text-3xl font-bold text-white mb-2">LVL {users[2]?.lvl}</div>
                      <div className="text-sm text-slate-400">#3 Third Place</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <span>📊</span>
                <span>Full Rankings</span>
              </h2>

              {users.map((user, index) => {
                const rankNumber = typeof user.order === "number" ? user.order : index + 1
                const levelProgress = getLevelProgress(user.lvl)

                return (
                  <a
                    key={user.id || index}
                    href={`https://profile.intra.42.fr/users/${user.login}`}
                    target="_blank"
                    rel="noreferrer"
                    className={getCardClass(rankNumber)}
                    style={{ animationDelay: `${(index % 10) * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={getRankBadgeClass(rankNumber)}>
                          <span>{getRankIcon(rankNumber) || getRankBadge(rankNumber)}</span>
                        </div>

                        <div className="relative">
                          <img
                            className="w-16 h-16 rounded-xl object-cover border-2 border-slate-600/50"
                            src={user.image || "/cat.png"}
                            alt={user.login}
                          />
                          {rankNumber <= 10 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                              ⭐
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{user.login}</h3>
                            <span className="px-2 py-1 bg-slate-700/50 rounded-md text-xs text-slate-300">
                              #{getRankBadge(rankNumber)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-slate-400 text-sm">Level Progress</span>
                            <div className="flex-1 max-w-32 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                              <div
                                className="level-progress h-full transition-all duration-1000"
                                style={{ width: `${levelProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-3xl font-bold mb-1 ${getLevelColor(user.lvl)}`}>{user.lvl}</div>
                        <div className="text-slate-400 text-sm">Level</div>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Enhanced Load More Button */}
            {hasMoreUsers && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreUsers}
                  disabled={isLoading}
                  className="btn-primary px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 mx-auto hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner w-5 h-5"></div>
                      <span>Loading more poolers...</span>
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      <span>Load More Poolers</span>
                      <span className="bg-white/20 px-2 py-1 rounded-md text-sm">+100</span>
                    </>
                  )}
                </button>
                <p className="text-slate-400 text-sm mt-4">
                  Showing <span className="text-blue-400 font-medium">{users.length}</span> poolers • Click to load 100
                  more
                </p>
              </div>
            )}

            {/* End of results message */}
            {!hasMoreUsers && users.length > 0 && (
              <div className="text-center mt-12 py-8 border-t border-slate-700/50">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <p className="text-xl font-medium text-white mb-2">That's everyone!</p>
                <p className="text-slate-400">
                  You've seen all <span className="text-green-400 font-medium">{users.length}</span> poolers in this
                  ranking.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced loading overlay */}
      <div
        ref={loading}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm hidden"
      >
        <div className="glass rounded-2xl p-8 text-center max-w-sm mx-4">
          <div className="loading-spinner mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Rankings</h3>
          <p className="text-slate-400 text-sm mb-4">Fetching the latest pool data...</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
