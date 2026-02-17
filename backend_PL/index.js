const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;


const db = new sqlite3.Database(
    path.join(__dirname, "database.db"), 
    (err) =>{
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend_PL")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend_PL/login.html"));
})
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
    name TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    user_id INTEGER,
    difficulty TEXT DEFAULT 'easy',
    category TEXT DEFAULT 'General',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error("Table creation error", err.message);
        return;
    } 
    console.log("Topics created successfully");

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
    const {name, user_id, difficulty, category} = req.body;

    db.run(
        "INSERT INTO topics (name, completed, user_id, difficulty, category) VALUES (?, 0, ?, ?, ?)",
        [name, user_id, difficulty || 'easy', category || 'General'],
        function (err) {
            if (err) {
                return res.status(500).json({error: err.message});
            }

            res.json({
                id: this.lastID,
                name: name,
                completed: 0,
                difficulty: difficulty || 'easy',
                category: category || 'General'
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

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(

        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],

        function(err) {
            if (err) {
                return res.json({
                    error: err.message
                });
            }

            const userId = this.lastID;

            const defaultTopics = [
                "HTTP Grundlagen",
                "REST API",
                "SQL Grundlagen",
                "JWT Authentication",
                "CRUD Operations",
                "MVC Architecture"
            ];
            defaultTopics.forEach(topic => {
                db.run(
                    "INSERT INTO topics (name, completed, user_id) VALUES (?, 0, ?)",
                    [topic, userId]
                );
            });
            res.json({
                message: "User created"
            });
        }
    );
});
app.post("/login", async (req, res) => {

    const {username, password} = req.body;

    db.get(

        "SELECT * FROM users WHERE username = ?",

        [username],
        async (err, user) => {

            if (err) {
                return res.status(500).json({
                    error: "err.message"
                });
            }
            if (!user){
                return res.status(400).json({
                    error:"User not found"
                });
            }
            const validPassword = await bcrypt.compare( password, user.password);
            if (!validPassword) {
                return res.status(400).json({
                    error: "Wrong password"
                });
            }
            res.json({
                message: "Login succses",
                userId: user.id,
                username: user.username
            });
        }
    );
});
app.get("/topics/:userId", (req, res) =>{
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({error: "No userId provided"});
    }

    db.all(
        "SELECT * FROM topics WHERE user_id = ?",
        [userId],
        (err, rows) => {

            if (err) {
                return res.status(500).json({error: err.message});
            }
            res.json(rows);
        }
    );
});
