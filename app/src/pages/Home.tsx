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
    if (numericRank === 1) return "1🥇"
    if (numericRank === 2) return "2🥈"
    if (numericRank === 3) return "3🥉"
    return `${numericRank}`
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Pool Rankings - {campus_name || "Tétouan"}</h1>
            <div className="text-slate-400 text-sm">
              Showing {users.length} {hasMoreUsers ? `of ${totalUsers}+` : `of ${users.length}`} poolers
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-4">
          <select
            value={campus_name || "Tétouan"}
            onChange={(e) => {
              const selectedCampus = e.target.value
              location.href = `/${selectedCampus}/${begin_at}`
            }}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
          >
            {availableCampuses.map((campus) => (
              <option key={campus.id} value={campus.name}>
                {campus.name}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => {
              location.href = `/${campus_name || "Tétouan"}/${e.target.value}`
            }}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-xl font-medium text-white mb-2">No Users Found</h2>
            <p className="text-slate-400 mb-6">Try selecting a different campus or promo</p>
            <Link to="/login" className="btn-primary">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {users.map((user, index) => {
                const rankNumber = typeof user.order === "number" ? user.order : index + 1
                console.log(`Rendering user: ${user.login}, Rank: ${rankNumber}`)

                return (
                  <a
                    key={user.id || index}
                    href={`https://profile.intra.42.fr/users/${user.login}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg p-4 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold">
                          {getRankBadge(rankNumber)}
                        </div>
                        <img
                          className="w-12 h-12 rounded-lg object-cover border border-slate-600"
                          src={user.image || "/cat.png"}
                          alt={user.login}
                        />
                        <div>
                          <h3 className="text-white font-medium">{user.login}</h3>
                          <p className="text-slate-400 text-sm">Rank {getRankBadge(rankNumber)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">LVL {user.lvl}</div>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Load More Button */}
            {hasMoreUsers && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreUsers}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>📄 Load More Users</>
                  )}
                </button>
                <p className="text-slate-400 text-sm mt-2">Showing {users.length} users • Click to load 100 more</p>
              </div>
            )}

            {/* End of results message */}
            {!hasMoreUsers && users.length > 0 && (
              <div className="text-center mt-8 py-6 border-t border-slate-700">
                <p className="text-slate-400">🎉 You've reached the end! Showing all {users.length} Poolers.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading overlay */}
      <div ref={loading} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 hidden">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading rankings...</p>
          <p className="text-slate-400 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    </main>
  )
}

export default Home
