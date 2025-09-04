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

app.get("/assignments", async (req, res) => {
  let results;
  try {
    results = await connectionPool.query(`SELECT * FROM assignments`);
    return res.status(200).json({
      "message": "Retrieved assignments successfully",
      "data": results.rows
    })
  } catch (error) {
    return res.status(500).json({
      "message": "Server could not read assignment because database connection"
    })
  }
})

app.get("/assignments/:assignmentId", async (req, res) => {
  let results;
  try {
    const checkExistAssignment = await connectionPool.query(`SELECT * FROM assignments WHERE assignment_id = $1`, [req.params.assignmentId]);
    if (!checkExistAssignment.rows[0]) {
      return res.status(404).json({
        "message": "Server could not find a requested assignment",
      })
    }
    results = await connectionPool.query(`SELECT * FROM assignments WHERE assignment_id = $1`, [req.params.assignmentId]);
    return res.status(200).json({
      "message": "Retrieved assignment successfully",
      "data": results.rows
    })
  } catch (error) {
    return res.status(500).json({
      "message": "Server could not read assignment because database connection"
    })
  }
})

app.put("/assignments/:assignmentId", async (req, res) => {
  let results;
  try {
    const checkExistAssignment = await connectionPool.query(`SELECT * FROM assignments WHERE assignment_id = $1`, [req.params.assignmentId]);
    if (!checkExistAssignment.rows[0]) {
      return res.status(404).json({
        "message": "Server could not find a requested assignment to update",
      })
    }
    const assignmentIdFromClient = req.params.assignmentId;
    const updatedAssignment = {
      ...req.body,
      updated_at: new Date(),
    };

    await connectionPool.query(
      `UPDATE assignments SET title = $2,
       content = $3, category = $4, length = $5, updated_at = $6, published_at = $7, status = $8 WHERE assignment_id = $1`, [assignmentIdFromClient, updatedAssignment.title, updatedAssignment.content, updatedAssignment.category, updatedAssignment.length, updatedAssignment.updated_at, updatedAssignment.published_at, updatedAssignment.status,]);
    return res.status(200).json({
      "message": "Updated assignment successfully",
    })
  } catch (error) {
    return res.status(500).json({
      "message": "Server could not update assignment because database connection"
    })
  }
})

app.delete("/assignments/:assignmentId", async (req, res) => {
  let results;
  try {
    const checkExistAssignment = await connectionPool.query(`SELECT * FROM assignments WHERE assignment_id = $1`, [req.params.assignmentId]);
    if (!checkExistAssignment.rows[0]) {
      return res.status(404).json({
        "message": "Server could not find a requested assignment to delete",
      })
    }
    results = await connectionPool.query(`DELETE FROM assignments WHERE assignment_id = $1`, [req.params.assignmentId]);
    return res.status(200).json({
      "message": "Deleted assignment successfully",
      "data": results.rows
    })
  } catch (error) {
    return res.status(500).json({
      "message": "Server could not delete assignment because database connection"
    })
  }
})


app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
