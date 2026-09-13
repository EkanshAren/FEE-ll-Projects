const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

function addTask() {
    const task = input.value.trim();

    if (task === "") {
        return;
    }

    const item = document.createElement("li");

    const text = document.createElement("span");
    text.textContent = task;
    text.className = "task-text";

    text.onclick = function () {
        text.classList.toggle("completed");
    };

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "delete-btn";

    remove.onclick = function () {
        item.remove();
    };

    item.appendChild(text);
    item.appendChild(remove);
    list.appendChild(item);

    input.value = "";
    input.focus();
}

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});
