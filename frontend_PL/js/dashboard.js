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