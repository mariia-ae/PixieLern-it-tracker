document.addEventListener("DOMContentLoaded", () => { 

    const logoutBtn = document.querySelector(".logout-btn");

    logoutBtn.addEventListener('click', () => {
        alert("Logout funktiomiert später mit Backend");
    });
    const topicsContainer = document.querySelector(".topics-section");
    const addBtn = document.querySelector("#addTopicBtn");
    const input = document.querySelector("#newTopicInput");

    function renderTopic(topic) {
        const topicDiv = document.createElement("div");
        topicDiv.classList.add("topic-item");

        topicDiv.innerHTML = `
            <label>
                <input type="checkbox" ${topic.completed ? "checked": ""}>
                <span class="topic-text">${topic.name}</span>
            </label>
            <div class="topic-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">X</button>
            </div>
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
            }).then(() =>  {
                updateProgress();
                sortTopics();
            });
        });

        const editBtn = topicDiv.querySelector(".edit-btn");
        const textSpan = topicDiv.querySelector(".topic-text");

        editBtn.addEventListener("click", () => {

            const textSpan = topicDiv.querySelector(".topic-text");
            const originalText = textSpan.textContent;

            const inputEdit = document.createElement("input");
            inputEdit.type ="text";
            inputEdit.value = originalText;
            inputEdit.classList.add("edit-input");

            textSpan.replaceWith(inputEdit);
            editBtn.textContent = "Save";
            inputEdit.focus();

            function saveEdit() {
                const newName = inputEdit.value.trim();
                if (!newName) return;

                fetch(`http://localhost:3000/topics/${topic.id}`, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({name: newName})
                }).then(() => {
                    const newSpan = document.createElement("span");
                    newSpan.classList.add("topic-text");
                    newSpan.textContent = newName;

                    inputEdit.replaceWith(newSpan);
                    editBtn.textContent = "Edit";
                });
            }
            function cancelEdit() {
                const originalSpan = document.createElement("span");
                originalSpan.classList.add("topic-text");
                originalSpan.textContent = originalText;

                inputEdit.replaceWith(originalSpan);
                editBtn.textContent ="Edit";
            }

            inputEdit.addEventListener("keydown", (e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
            });

            inputEdit.addEventListener("blur", saveEdit);
            });

        const deleteBtn = topicDiv.querySelector(".delete-btn");

        deleteBtn.addEventListener("click", () => {

            const confirmed = confirm("Möchtest du dieses Thema wirklich löschen)");

            if (!confirmed) return;

            fetch(`http://localhost:3000/topics/${topic.id}`, {
                method: "DELETE"
            }).then(() => {
                topicDiv.remove();
                updateProgress();
            });
        });
    }

    function loadTopics() {
        fetch("http://localhost:3000/topics")
            .then(res => res.json())
            .then(data => {
                topicsContainer.innerHTML = "";
                data.forEach(topic => renderTopic(topic));
                updateProgress();
                sortTopics();
            });
    }

    addBtn.addEventListener("click", () => {
        const name = input.value.trim();

        if (!name) return;

        fetch("http://localhost:3000/topics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name})
        })
        .then(res => res.json())
        .then(newTopic => {
            
            renderTopic(newTopic);
            input.value ="";
            updateProgress();
        });
    });

    function updateProgress() {
        const checkboxes = document.querySelectorAll(".topics-section input[type=checkbox]");
        const checked = document.querySelectorAll(".topics-section input[type=checkbox]:checked");

        const total = checkboxes.length;
        const completed = checked.length;

        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.querySelector(".progress-section p").textContent = `Fortschritt: ${percent}%`;
        document.querySelector(".progress-fill").style.width = percent + "%";
    }

    function sortTopics() {
        const items = Array.from(topicsContainer.children);

        items.sort((a, b) => {
            const aChecked = a.querySelector("input").checked;
            const bChecked = b.querySelector("input").checked;

            return aChecked - bChecked;
        });

        items.forEach(item => topicsContainer.appendChild(item));
    }
     loadTopics();
     });
    



