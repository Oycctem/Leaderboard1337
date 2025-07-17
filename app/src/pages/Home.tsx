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
  campus?: string
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

  // Include "All" option in campuses
  const [availableCampuses, setAvailableCampuses] = useState<Campus[]>([
    { id: 0, name: "All" },
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
      console.log("Campus name being used:", campus_name)
      console.log("Request body:", body)

      if (data.status === 200 && Array.isArray(data.data)) {
        // Calculate the correct order based on page and existing users
        const startingOrder = append ? users.length + 1 : 1
        const processedUsers = data.data.map((user: any, index: number) => ({
          ...user,
          order: startingOrder + index,
        }))

        console.log("Processed users with campus info:", processedUsers.slice(0, 5)) // Show first 5 users
        console.log("Total users received:", processedUsers.length)

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
        return "h-24"
      case 2:
        return "h-20"
      case 3:
        return "h-16"
      default:
        return "h-12"
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

  // Get campus badge color
  const getCampusBadgeColor = (campusName: string) => {
    switch (campusName) {
      case "Tétouan":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Rabat":
        return "bg-green-100 text-green-800 border-green-200"
      case "Benguerir":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Khouribga":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const topThree = users.slice(0, 3)
  const remainingUsers = users.slice(3)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-white">🏆</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Pool Leaderboard</h1>
                <p className="text-slate-600">
                  {campus_name === "All" ? "All Campuses" : `${campus_name || "Tétouan"} Campus`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{users.length}</div>
              <div className="text-slate-600 text-sm">Poolers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-100 border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
          <select
            value={campus_name || "Tétouan"}
            onChange={(e) => {
              const selectedCampus = e.target.value
              location.href = `/${selectedCampus}/${begin_at}`
            }}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableCampuses.map((campus) => (
              <option key={campus.id} value={campus.name}>
                {campus.name === "All" ? "🌍 All Campuses" : `🏫 ${campus.name}`}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => {
              location.href = `/${campus_name || "Tétouan"}/${e.target.value}`
            }}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  {value}
                </option>
              )
            })}
          </select>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">😔</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Poolers Found</h2>
            <p className="text-slate-600 mb-8">Try selecting a different campus or promo</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
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
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Top 3</h2>
                  <p className="text-slate-600">Leading the pack</p>
                </div>

                <div className="flex items-end justify-center gap-6 mb-8">
                  {topThree.map((user, index) => {
                    const rank = index + 1
                    return (
                      <div key={user.id || index} className={`flex flex-col items-center ${getPodiumOrder(rank)}`}>
                        {/* User Card */}
                        <div className="mb-4">
                          <a
                            href={`https://profile.intra.42.fr/users/${user.login}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
                              {/* Medal */}
                              <div className="text-center mb-4">
                                <span className="text-3xl">{getMedalIcon(rank)}</span>
                              </div>

                              {/* Large Avatar */}
                              <div className="relative mb-4">
                                <img
                                  className="w-24 h-24 rounded-xl object-cover border-4 border-slate-200 mx-auto"
                                  src={user.image || "/cat.png"}
                                  alt={user.login}
                                />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {rank}
                                </div>
                              </div>

                              {/* User Info */}
                              <div className="text-center">
                                <h3 className="text-slate-900 font-bold text-lg mb-1">{user.login}</h3>
                                <div className="text-xl font-bold text-blue-600 mb-2">Level {user.lvl}</div>

                                {/* Campus Badge for All Campuses view */}
                                {campus_name === "All" && user.campus && (
                                  <div
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCampusBadgeColor(user.campus)}`}
                                  >
                                    {user.campus}
                                  </div>
                                )}
                              </div>
                            </div>
                          </a>
                        </div>

                        {/* Podium Base */}
                        <div
                          className={`w-20 ${getPodiumHeight(rank)} bg-slate-300 rounded-t-lg flex items-center justify-center`}
                        >
                          <span className="text-slate-700 font-bold text-lg">{rank}</span>
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
                  <div className="h-px bg-slate-300 flex-1"></div>
                  <h3 className="text-lg font-semibold text-slate-700">Other Participants</h3>
                  <div className="h-px bg-slate-300 flex-1"></div>
                </div>

                {remainingUsers.map((user, index) => {
                  const rankNumber = user.order

                  return (
                    <a
                      key={user.id || index}
                      href={`https://profile.intra.42.fr/users/${user.login}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <div className="bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-4 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Rank Badge */}
                            <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                              #{getRankBadge(rankNumber)}
                            </div>

                            {/* Large Avatar */}
                            <img
                              className="w-16 h-16 rounded-lg object-cover border-2 border-slate-200"
                              src={user.image || "/cat.png"}
                              alt={user.login}
                            />

                            {/* User Info */}
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-slate-900 font-semibold text-lg">{user.login}</h3>
                                {/* Campus Badge for All Campuses view */}
                                {campus_name === "All" && user.campus && (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getCampusBadgeColor(user.campus)}`}
                                  >
                                    {user.campus}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 text-sm">Rank #{getRankBadge(rankNumber)}</p>
                            </div>
                          </div>

                          {/* Level */}
                          <div className="text-right">
                            <div className="text-slate-900 font-bold text-xl mb-1">
                              <span className="text-slate-500 text-sm font-normal">Level </span>
                              <span className="text-blue-600">{user.lvl}</span>
                            </div>
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
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
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-3 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      Load More
                    </>
                  )}
                </button>
                <p className="text-slate-500 text-sm mt-4">Showing {users.length} poolers</p>
              </div>
            )}

            {/* End of results */}
            {!hasMoreUsers && users.length > 0 && (
              <div className="text-center mt-12 py-8 border-t border-slate-200">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-slate-700 text-lg font-medium mb-2">All done!</p>
                <p className="text-slate-500">
                  Showing all {users.length} poolers{" "}
                  {campus_name === "All" ? "from all campuses" : `from ${campus_name}`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading overlay */}
      <div
        ref={loading}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm hidden"
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-slate-900 text-xl font-semibold mb-2">Loading Rankings...</h3>
          <p className="text-slate-600">{campus_name === "All" ? "Fetching from all campuses..." : "Please wait"}</p>
        </div>
      </div>
    </main>
  )
}

export default Home
