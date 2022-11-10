import bodyParser from "body-parser"
import sessions from "client-sessions"
import express from "express"
import { promises as fs } from "fs"
import _ from "lodash"
import * as path from "path"
import { dirname } from "path"
import { fileURLToPath } from "url"
import { client } from "./mongo.js"
import { isValidRecipe, reasonForInvalidity, Recipe } from "./recipe.js"
import * as bcrypt from "bcrypt"

const __dirname = dirname(fileURLToPath(import.meta.url))

const permittedUsernameRegex = /^[a-z0-9_-]*$/i

const mustBeLoggedIn = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // @ts-ignore
  if (!req.session.user) {
    res.redirect("/login")
  } else {
    next()
  }
}

async function run() {
  const clientApp = await fs.readFile(path.join(__dirname, "client/index.html"))
  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(
    sessions({
      cookieName: "session",
      secret: "placeholder", // todo
      duration: 24 * 60 * 60 * 1000,
      activeDuration: 1000 * 60 * 5,
      cookie: {
        httpOnly: true,
      },
    })
  )

  const mongo = await client()

  process.on("SIGINT", () => {
    console.log("Shutting down...")
    mongo.close()
    process.exit()
  })

  app.get(
    "/:user/mealplan",
    async (req: express.Request, res: express.Response) => {
      const user = req.params.user
      const days =
        parseInt(
          typeof req.query.days === "string" ? req.query.days : "null",
          10
        ) || null

      const mouths =
        parseInt(
          typeof req.query.mouths === "string" ? req.query.mouths : "null",
          10
        ) || null

      const leftOversPermitted =
        typeof req.query.leftOversPermitted === "string" &&
        req.query.leftOversPermitted.toLowerCase() == "true"

      const tags = _.isString(req.query.tags)
        ? [req.query.tags]
        : _.isArray(req.query.tags) && _.isString(req.query[0])
        ? (req.query.tags as string[])
        : []

      if (!user) {
        console.error(
          "No user specified in mealplan request - indicates an issue with routing"
        )
        res.status(500)
        return
      }

      if (!days || typeof days !== "number") {
        res
          .status(400)
          .send('Must specify "days" as a number in request params')
        return
      }

      if (!mouths || typeof mouths !== "number") {
        res
          .status(400)
          .send('Must specify "mouths" as a number in request params')
        return
      }
      const query = tags.length ? { tags: { $all: tags } } : {}
      const recipes: Recipe[] = _.shuffle(
        (await mongo.select("recipes", user, query)) as Recipe[]
      )

      const servingsRequired = mouths * days

      let mealz: { recipe: Recipe; days: number; leftOvers: number }[] = []
      let haveRequiredServings = false
      for (const recipe of recipes) {
        if (recipe.servings >= mouths) {
          const leftOvers = recipe.servings % mouths

          if (leftOvers === 0 || leftOversPermitted) {
            mealz.push({
              recipe,
              days: Math.floor(recipe.servings / mouths),
              leftOvers,
            })
          }
        }

        haveRequiredServings =
          _.sumBy(mealz, (m) => m.recipe.servings) >= servingsRequired
        if (haveRequiredServings) {
          break
        }
      }

      if (!haveRequiredServings) {
        res
          .status(409)
          .send(
            "Unable to generate meal plan for that many days for that many mouths :( -> try adding more recipes that can serve that many mouths, or a smaller meal plan"
          )
        return
      }
      res.json({
        totalDays: _.sumBy(mealz, (m) => m.days),
        totalServings: _.sumBy(mealz, (m) => m.recipe.servings),
        totalLeftOvers: _.sumBy(mealz, (m) => m.leftOvers),
        mealz,
      })
    }
  )

  app.get(
    "/:user/recipe/:recipe",
    async (req: express.Request, res: express.Response) => {
      const user = req.params.user
      const recipeName = req.params.recipe
      const recipe = await mongo.get("recipes", user, recipeName)
      if (!recipe) {
        res.status(404).send()
        return
      }
      res.json(recipe)
    }
  )

  app.post(
    "/:user/recipe/:recipe",
    async (req: express.Request, res: express.Response) => {
      console.log("start")
      try {
        const user = req.params.user
        const recipeName = req.params.recipe
        const recipe = {
          _id: recipeName,
          ...req.body,
        }
        if (!isValidRecipe(recipe)) {
          res.status(400).send(`Invalid recipe, ${reasonForInvalidity(recipe)}`)
          return
        }
        await mongo.set("recipes", user, recipe)
        res.sendStatus(200)
      } catch {
        res.sendStatus(500)
      }
    }
  )

  app.get(
    "/",
    mustBeLoggedIn,
    async (req: express.Request, res: express.Response) => {
      // todo redirect to login if not logged in
      res.set("Content-Type", "text/html")
      res.send(clientApp)
    }
  )

  app.get("/login", async (req: express.Request, res: express.Response) => {
    res.set("Content-Type", "text/html")
    res.send(clientApp)
  })

  app.post("/login", async (req: express.Request, res: express.Response) => {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      res.status(400).send("Must specify username and password in body")
      return
    }

    if (!username.match(permittedUsernameRegex)) {
      res
        .status(400)
        .send(`username does not match regex: ${permittedUsernameRegex}`)
      return
    }

    const user = await mongo.get("recipes", "users", username)
    if (!user) {
      res.sendStatus(404)
      return
    }

    const hashedPassword = await bcrypt.hash(password, user.salt as string)
    if (hashedPassword === user.password) {
      // @ts-ignore
      req.session.user = username
      res.redirect("/")
      return
    }

    res.sendStatus(403)
  })

  app.get("/register", async (req: express.Request, res: express.Response) => {
    res.set("Content-Type", "text/html")
    res.send(clientApp)
  })

  app.post("/register", async (req: express.Request, res: express.Response) => {
    const username = req.body.username
    const password = req.body.password
    if (!username || !password) {
      res.status(400).send("Must specify username and password in body")
      return
    }

    const allUsers = await mongo.select("recipes", "users")
    const unavailableNames = ["users", ...allUsers.map((u) => u._id)]
    if (unavailableNames.includes(username)) {
      res.status(400).send(`username not available`)
      return
    }

    if (!username.match(permittedUsernameRegex)) {
      res
        .status(400)
        .send(`username does not match regex: ${permittedUsernameRegex}`)
      return
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
    mongo.set("recipes", "users", {
      _id: username,
      password: hashedPassword,
      salt,
    })
    res.sendStatus(201)
  })

  app.use(express.static(path.join(__dirname, "client")))

  app.listen(80)
  console.log("Listening on port 80...")
}

run().catch(console.error)

// todo:
// post on submition
// autofill on name update
// button to get plan
