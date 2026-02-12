document.addEventListener("DOMContentLoaded", function() {

    console.log("JS loaded");

    const checkboxes = document.querySelectorAll('.topic-item input');
    console.log("Checkbox count", checkboxes.length);
    const progressText = document.querySelector('.progress-section p');
    const progressFill = document.querySelector('.progress-fill');

    function updateProgress() {
        const total = checkboxes.length;
        const checked = document.querySelectorAll('.topic-item input:checked').length;

        const percent = Math.round((checked / total) * 100);
        progressText.textContent = `Fortschritt: ${percent}%`;
        progressFill.style.width = percent + "%";
    }

    checkboxes.forEach(box => {

        box.addEventListener('change', updateProgress);

    });
});

document.querySelector('.logout-btn')
    .addEventListener('click', function() {
        alert("Logout funktiomiert später mit Backend");
    });

document.addEventListener("DOMContentLoaded", () =>{

    const topicsContainer = document.querySelector(".topics-section");

    function updateProgress() {
        const checkboxes = document.querySelectorAll(".topics-section input[type=checkbox]");
        const checked = document.querySelectorAll(".topics-section input[type=checkbox]:checked");

        const total = checkboxes.length;
        const completed = checked.length;

        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.querySelector(".progress-section p").textContent = `Fortschritt: ${percent}%`;
        document.querySelector(".progress-fill").style.width = percent + "%";
    }

    fetch("http://localhost:3000/topics")
   .then(res => res.json())
   .then(data => {
     topicsContainer.innerHTML = "";

     data.forEach(topic => {
        const topicDiv = document.createElement("div");
        topicDiv.classList.add("topic-item");

        topicDiv.innerHTML = `
            <label>
              <input type="checkbox" ${topic.completed ? "checked" : ""} >
              ${topic.name}
            </label>
            `;
            topicsContainer.appendChild(topicDiv);

            const checkbox = topicDiv.querySelector("input");
            checkbox.addEventListener("change", () => {
                fetch(`http://localhost:3000/topics/${topic.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        completed: checkbox.checked ? 1 : 0
                    })
              })
              .then(res => res.json())
              .then(() => {
                updateProgress();
              });
            });
     });
     updateProgress();
   });
});




