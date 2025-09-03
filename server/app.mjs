import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express()
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 555");
});


app.post("/assignments", async (req, res) => {
  try {
    const newAssignment = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: new Date(),
    };
    if (!newAssignment.title || !newAssignment.content || !newAssignment.category) {
      return res.status(400).json({
        "message": "Server could not create assignment because there are missing data from client"
      })
    }
    await connectionPool.query(
      `INSERT INTO assignments (user_id, title, content, category, length, created_at, updated_at, published_at, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [1, newAssignment.title, newAssignment.content, newAssignment.category, newAssignment.length, newAssignment.created_at, newAssignment.updated_at, newAssignment.published_at, newAssignment.status,]
    );
    return res.status(201).json({
      "message": "Created assignment sucessfully",
    })
  } catch (error) {
    return res.status(500).json({
      "message": "Server could not create assignment because database connection"
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
