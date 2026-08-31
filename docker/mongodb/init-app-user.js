const databaseName = process.env.MONGODB_DATABASE || "talk_cms"
const username = process.env.MONGODB_APP_USERNAME
const password = process.env.MONGODB_APP_PASSWORD

if (!username || !password) {
  throw new Error("MongoDB application credentials are required")
}

db.getSiblingDB(databaseName).createUser({
  user: username,
  pwd: password,
  roles: [{ role: "readWrite", db: databaseName }],
})
