const form = document.getElementById("loginForm");
form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/login", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });
    const data = await res.json();

    if (data.userId) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);

        window.location.href = "dashboard.html";
    }
    else {
        document.getElementById("result").innerText = data.message || data.error;
    }
});
