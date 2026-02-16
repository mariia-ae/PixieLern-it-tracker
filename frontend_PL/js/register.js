async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/register", {
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
    if (data.message) {
        document.getElementById("result").innerText = "Registrierung erfolgreich! Weiterleitung zum Login...";
        setImmediate(() => {
            window.location.href="login.html";
        }, 1500);
    } else {
        document.getElementById("result").innerText= data.error;
        
    }
}
