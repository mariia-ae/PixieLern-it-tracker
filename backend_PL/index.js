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
    CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         username TEXT UNIQUE,
         password TEXT
    )
`);

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
       "JWT Authentication",
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
    const {completed, name} = req.body;
    const {id} = req.params;

    db.run(
        "UPDATE topics SET completed = COALESCE (?, completed), name = COALESCE(?, name) WHERE id = ?",
        [completed ,name , id],
        function (err) {
            if (err) {
                return res.status(500).json({rerror: err.message});
            }
            res.json({ message: "Topic updated"});
        }
    );
});
app.post("/topics", (req, res) => {
    const {name} = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({error: "Name is required"});
    }

    db.run(
        "INSERT INTO topics (name, completed) VALUES (?, 0)",
        [name.trim()],
        function (err) {
            if (err) {
                return res.status(500),json({error: err.message});
            }

            res.json({
                id: this.lastID,
                name: name.trim(),
                completed: 0
            });
        }
    );
});

app.delete("/topics/:id", (req, res) => {
    const {id} = req.params;

    db.run(
        "DELETE FROM topics WHERE id = ?",
        [id],
        function(err) {
            if (err) {
                return res.status(500).json({error: err.message});
            }

            res.json({ message: "Topic deleted"});
        }
    );
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({error: "Username and password required"});
    }
    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username.trim(), password],
        function(err) {
            if (err) {
                return res.status(400).json({error: err.message});
            }

            res.json({
                id: this.lastID,
                username: username.trim()
            });
        }
    );
});
