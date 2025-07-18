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
  const [userDetails, setUserDetails] = useState<{ [key: string]: any }>({})
  const [loadingNames, setLoadingNames] = useState<{ [key: string]: boolean }>({})
  const loading = useRef<HTMLDivElement>(null)
  var { campus_name, begin_at } = useParams()
  const token: string = localStorage.getItem("token") || ""

  // Remove "All" option from campuses
  const [availableCampuses, setAvailableCampuses] = useState<Campus[]>([
    { id: 55, name: "Tétouan" },
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

  // Function to fetch user details from 42 API
  const fetchUserDetails = async (login: string) => {
    if (userDetails[login] || loadingNames[login]) return userDetails[login]

    console.log(`Fetching details for user: ${login}`)
    setLoadingNames((prev) => ({ ...prev, [login]: true }))

    try {
      const response = await fetch(`https://api.intra.42.fr/v2/users/${login}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log(`API response status for ${login}:`, response.status)

      if (response.ok) {
        const userData = await response.json()
        console.log(`User data for ${login}:`, userData)

        const fullName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
        console.log(`Full name for ${login}: "${fullName}"`)

        const userInfo = { ...userData, fullName }

        setUserDetails((prev) => ({
          ...prev,
          [login]: userInfo,
        }))

        setLoadingNames((prev) => ({ ...prev, [login]: false }))
        return userInfo
      } else {
        console.error(`Failed to fetch user ${login}:`, response.status, response.statusText)
      }
    } catch (error) {
      console.error(`Error fetching details for ${login}:`, error)
    }

    setLoadingNames((prev) => ({ ...prev, [login]: false }))
    return null
  }

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

        // Fetch user details for the new users
        processedUsers.forEach((user: User) => {
          if (user.login && user.login !== "N/A") {
            fetchUserDetails(user.login)
          }
        })

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
    setUserDetails({})
    setLoadingNames({})
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
        return "h-16 sm:h-20 md:h-24"
      case 2:
        return "h-12 sm:h-16 md:h-20"
      case 3:
        return "h-10 sm:h-12 md:h-16"
      default:
        return "h-8 sm:h-10 md:h-12"
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

  const getUserDisplayName = (user: User) => {
    const details = userDetails[user.login]
    const isLoading = loadingNames[user.login]

    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <img src="/gari.png" alt="Loading" className="w-4 h-4 animate-pulse" />
          <span>Loading...</span>
        </div>
      )
    }

    if (details?.fullName && details.fullName.trim() !== "") {
      return details.fullName
    }

    // Fallback to constructing name from individual fields
    if (details?.first_name || details?.last_name) {
      return `${details.first_name || ""} ${details.last_name || ""}`.trim()
    }

    return user.login
  }

  const topThree = users.slice(0, 3)
  const remainingUsers = users.slice(3)

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <img
              src="/gari.png"
              alt="Chart Icon"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Student Rankings</h1>
                <p className="text-sm sm:text-base text-slate-400">{campus_name || "Tétouan"} Campus</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-white">{users.length}</div>
              <div className="text-slate-400 text-sm">Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <select
            value={campus_name || "Tétouan"}
            onChange={(e) => {
              const selectedCampus = e.target.value
              location.href = `/${selectedCampus}/${begin_at}`
            }}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 sm:flex-none"
          >
            {availableCampuses.map((campus) => (
              <option key={campus.id} value={campus.name}>
                Campus: {campus.name}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => {
              location.href = `/${campus_name || "Tétouan"}/${e.target.value}`
            }}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 sm:flex-none"
          >
            <option value="0">Select Cohort</option>
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
            className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <span>↻</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {users.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📋</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">No Students Found</h2>
            <p className="text-slate-400 mb-6 sm:mb-8">Try selecting a different campus or cohort</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="mb-8 sm:mb-12">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Top Performers</h2>
                  <p className="text-slate-400">Highest ranking students</p>
                </div>

                <div className="flex items-end justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
                  {topThree.map((user, index) => {
                    const rank = index + 1
                    return (
                      <div key={user.id || index} className={`flex flex-col items-center ${getPodiumOrder(rank)}`}>
                        {/* User Card */}
                        <div className="mb-3 sm:mb-4">
                          <a
                            href={`https://profile.intra.42.fr/users/${user.login}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <div className="bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-lg border border-slate-700 hover:shadow-xl hover:border-slate-600 transition-all duration-200">
                              {/* Medal */}
                              <div className="text-center mb-2 sm:mb-4">
                                <span className="text-xl sm:text-3xl">{getMedalIcon(rank)}</span>
                              </div>

                              {/* Large Avatar */}
                              <div className="relative mb-2 sm:mb-4">
                                <img
                                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl object-cover border-2 sm:border-4 border-slate-600 mx-auto"
                                  src={user.image || "/gari.png"}
                                  alt={user.login}
                                />
                                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                  {rank}
                                </div>
                              </div>

                              {/* User Info */}
                              <div className="text-center">
                                <h3 className="text-white font-bold text-sm sm:text-lg mb-1 truncate">
                                  {getUserDisplayName(user)}
                                </h3>
                                <div className="text-xs sm:text-sm text-slate-400 mb-1">@{user.login}</div>
                                <div className="text-sm sm:text-xl font-bold text-blue-400">Level {user.lvl}</div>
                              </div>
                            </div>
                          </a>
                        </div>

                        {/* Podium Base */}
                        <div
                          className={`w-12 sm:w-16 md:w-20 ${getPodiumHeight(rank)} bg-slate-700 rounded-t-lg flex items-center justify-center`}
                        >
                          <span className="text-slate-300 font-bold text-sm sm:text-lg">{rank}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Remaining Users */}
            {remainingUsers.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="h-px bg-slate-700 flex-1"></div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-300">All Students</h3>
                  <div className="h-px bg-slate-700 flex-1"></div>
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
                      <div className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg p-3 sm:p-4 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            {/* Rank Badge */}
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 font-bold border border-slate-600">
                              <span className="text-xs sm:text-sm">#{getRankBadge(rankNumber)}</span>
                            </div>

                            {/* Avatar */}
                            <img
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-slate-600 flex-shrink-0"
                              src={user.image || "/gari.png"}
                              alt={user.login}
                            />

                            {/* User Info */}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-white font-semibold text-sm sm:text-lg truncate">
                                {getUserDisplayName(user)}
                              </h3>
                              <p className="text-slate-400 text-xs sm:text-sm">@{user.login}</p>
                            </div>
                          </div>

                          {/* Level */}
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="text-white font-bold text-sm sm:text-xl mb-1">
                              <span className="text-slate-400 text-xs sm:text-sm font-normal block sm:inline">
                                Level{" "}
                              </span>
                              <span className="text-blue-400">{user.lvl}</span>
                            </div>
                            <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-slate-700 rounded-full overflow-hidden">
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
              <div className="text-center mt-8 sm:mt-12">
                <button
                  onClick={loadMoreUsers}
                  disabled={isLoading}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-3 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <span>↓</span>
                      Load More Students
                    </>
                  )}
                </button>
                <p className="text-slate-400 text-sm mt-3 sm:mt-4">Showing {users.length} students</p>
              </div>
            )}

            {/* End of results */}
            {!hasMoreUsers && users.length > 0 && (
              <div className="text-center mt-8 sm:mt-12 py-6 sm:py-8 border-t border-slate-700">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">✓</div>
                <p className="text-white text-base sm:text-lg font-medium mb-2">Complete</p>
                <p className="text-slate-400 text-sm sm:text-base">
                  Showing all {users.length} students from {campus_name}
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
        <div className="text-center px-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">Loading Student Data...</h3>
          <p className="text-slate-400 text-sm sm:text-base">Please wait</p>
        </div>
      </div>
    </main>
  )
}

export default Home
