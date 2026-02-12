const sqlite3 = require("sqlite3").verbose();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const db = new sqlite3.Database("./database.db", (err) =>{
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({message: "Backend is running"});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


db.run(`
    CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    completed INTEGER DEFAULT 0
    )
`, (err) => {
    if (err) {
        console.error("Table creation error", err.message);
        return;
    } 
    console.log("Table created successfully");

    const defaultTopics = [
       "HTTP Grundlagen",
       "REST API",
       "SQL Grundlagen",
       "JWT AUthentication",
       "CRUD Operations",
       "MVC Architekture"
    ];
    defaultTopics.forEach(topic => {
    db.run(
        `INSERT  OR IGNORE INTO topics ( name, completed)
        VALUES (?, 0)`,
        [topic]
    );
   });
});


app.get ("/topics", (req, res) => {
    db.all("SELECT * FROM topics", [], (err, rows) => {
        if (err) {
            res.status(500).json({error:err.message});
        } else {
            res.json(rows);
        }
    });
});

app.put("/topics/:id", (req, res) => {
    const {completed} = req.body;
    const {id} = req.params;

    db.run(
        "UPDATE topics SET completed = ? WHERE id = ?",
        [completed ? 1 : 0, id],
        function (err) {
            if (err) {
                return res.status(500).json({rerror: err.message});
            }
            res.json({ message: "Topic updated"});
        }
    );
});
