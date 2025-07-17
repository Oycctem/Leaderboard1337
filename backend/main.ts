// main.ts
import { Application, oakCors, Router } from "./deps.ts"
import { config, Database } from "./deps.ts"

// setup env variables
const env = config()

// Get the environment variables
const UID = env.UID
const SECRET = env.SECRET
const REDIRECT_URI = env.REDIRECT_URI
const BASE_URL = env.BASE_URL

// Structure of stored documents (Campus)
interface Campus {
  id: number
  name: string
}

// Structure of stored documents (Promo)
interface Promo {
  pool_year: number
  pool_month: string
  begin_at: string
  Campus: Campus
}

// Structure for user data sent to frontend
interface UserData {
  id: number | null
  order: number
  login: string
  image: string
  lvl: string // Changed to string to match toFixed(2) output
  campus?: string // Add campus info for all campuses view
}

// Initialize the databases
const campusDB = new Database("api/db/campus.json")
const promoDB = new Database("api/db/promo.json")

// Create a router
const router = new Router()

// Create a route
router.post("/login", async (context) => {
  const body = await context.request.body().value
  const code = body.query.code
  var contextResponse = {
    status: 200,
    data: {},
    message: "",
  }
  try {
    const response = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: UID,
        client_secret: SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    })
    const data = await response.json()
    contextResponse = {
      status: 200,
      data: data,
      message: "Login successful",
    }
  } catch (error) {
    console.log("error[65]: ", error)
    contextResponse = {
      status: 400,
      data: {},
      message: error,
    }
  }
  const token = (contextResponse.data as { access_token: string }).access_token
  try {
    const me = await fetch(`${BASE_URL}/v2/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    const me_data = await me.json()
    const campus = me_data.campus[0]
    const begin_at = me_data.cursus_users[0].begin_at
    var promoExists = await promoDB.findOne({ begin_at: begin_at })
    if (!promoExists) {
      const begin_at_date = new Date(begin_at)
      const newPromo: Promo = {
        pool_year: begin_at_date.getUTCFullYear(),
        pool_month: begin_at_date.toLocaleString("default", {
          month: "long",
        }),
        begin_at: begin_at,
        Campus: {
          id: campus.id,
          name: campus.name,
        },
      }
      await promoDB.insertOne(newPromo)
      promoExists = newPromo
    }
    contextResponse.data = {
      ...contextResponse.data,
      campus: campus,
      promo: promoExists,
    }
    // ----------------------------------------------------
  } catch (error) {
    console.log("error[109]: ", error)
    contextResponse = {
      status: 400,
      data: {},
      message: error,
    }
  }
  context.response.body = contextResponse
})

// Simplified campus mapping - only 4 campuses
const CAMPUS_ID_MAP: { [key: string]: number } = {
  Tétouan: 55,
  Rabat: 75,
  Benguerir: 21,
  Khouribga: 16,
}

// Updated route to fetch users from single campus or all campuses
router.post("/cursus_users", async (context) => {
  const body = await context.request.body().value
  const firstDay = body.query.firstDay
  const lastDay = body.query.lastDay
  const token = body.query.token
  const campus_name = body.query.campus_name

  try {
    let allUsers: any[] = []

    if (campus_name === "All") {
      // Fetch from all campuses
      for (const [campusName, campusId] of Object.entries(CAMPUS_ID_MAP)) {
        console.log(`Fetching users from ${campusName} (ID: ${campusId})`)

        let page = 1
        let hasMoreData = true

        while (hasMoreData) {
          const endPoint: string = `/v2/cursus/9/cursus_users?filter[campus_id]=${campusId}&range[begin_at]=${firstDay},${lastDay}&page=${page}&per_page=400&sort=-level`

          const response = await fetch(`${BASE_URL}${endPoint}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          const data = await response.json()

          if (!Array.isArray(data)) {
            console.error(`Received non-array data from 42 API for ${campusName}:`, data)
            hasMoreData = false
            continue
          }

          if (data.length === 0) {
            hasMoreData = false
          } else {
            // Add campus info to each user
            const usersWithCampus = data.map((user: any) => ({
              ...user,
              campus_name: campusName,
            }))
            allUsers = allUsers.concat(usersWithCampus)
            page++
          }

          // Safety check to prevent infinite loops
          if (page > 15) {
            console.warn(`Reached page limit (15) for ${campusName}. Some users might not be included.`)
            hasMoreData = false
          }
        }
      }

      // Sort all users by level across all campuses
      allUsers.sort((a, b) => (b.level || 0) - (a.level || 0))
    } else {
      // Fetch from single campus (existing logic)
      const campus_id = CAMPUS_ID_MAP[campus_name as string] || 55

      let page = 1
      let hasMoreData = true

      while (hasMoreData) {
        const endPoint: string = `/v2/cursus/9/cursus_users?filter[campus_id]=${campus_id}&range[begin_at]=${firstDay},${lastDay}&page=${page}&per_page=400&sort=-level`

        const response = await fetch(`${BASE_URL}${endPoint}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!Array.isArray(data)) {
          console.error("Received non-array data from 42 API:", data)
          hasMoreData = false
          continue
        }

        if (data.length === 0) {
          hasMoreData = false
        } else {
          allUsers = allUsers.concat(data)
          page++
        }

        if (page > 15) {
          console.warn("Reached page limit (15) for fetching users. Some users might not be included.")
          hasMoreData = false
        }
      }
    }

    let tempUsers: UserData[] = []
    try {
      // Map all users with correct ranking
      tempUsers = allUsers.map((user: any, index: number) => ({
        id: user?.user?.id || null,
        order: index + 1,
        login: user?.user?.login || "N/A",
        image: user?.user?.image?.versions?.medium || "/cat.png",
        lvl: user?.level !== undefined && user.level !== null ? Number.parseFloat(user.level).toFixed(2) : "0.00",
        campus: user?.campus_name || campus_name, // Include campus info
      }))
      console.log("Backend sending tempUsers:", tempUsers)
    } catch (mapError) {
      console.error("Error during user data mapping:", mapError)
      context.response.body = {
        status: 500,
        data: [],
        message: "Error processing user data on server.",
      }
      return
    }

    context.response.body = {
      status: 200,
      data: tempUsers,
      message: "Users fetched successfully",
      total: tempUsers.length,
    }
  } catch (error) {
    console.error("Error fetching or processing cursus users:", error)
    context.response.body = {
      status: 400,
      data: [],
      message: "Failed to fetch users: " + error.message,
    }
  }
})

// Add this new route after the existing routes:
router.get("/campuses", async (context) => {
  const availableCampuses = [
    { id: 0, name: "All" }, // Add "All" option
    ...Object.entries(CAMPUS_ID_MAP).map(([name, id]) => ({
      id,
      name,
    })),
  ]

  context.response.body = {
    status: 200,
    data: availableCampuses,
    message: "Campuses fetched successfully",
  }
})

// Create your Deno application
const app = new Application()
app.use(oakCors())
app.use(router.routes())
app.use(router.allowedMethods())

// Start the server
console.log("Server is running on localhost:8000")
await app.listen({ port: 8000 })
