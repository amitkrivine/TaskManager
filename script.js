let tasks = [];
let currentFilter = "all";
let sortByDate = false;
renderTasks();
fetchInitialTasks();

// get tasks from localStorage
function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

// save tasks to localStorage
function saveTasks(tasks) {
    let jsonString = JSON.stringify(tasks)
    localStorage.removeItem("tasks");
    localStorage.setItem("tasks", jsonString)
}

/////// filter change
// applying the filter
function filterTasks(tasks, filter) {
    switch (filter) {
        case "active":
            return tasks.filter(f => !f.completed);
            
            case "completed":
                return tasks.filter(f => f.completed);
                
            case "all":
                return tasks;
                }
            }
            
// eventListeners
document.getElementById("allBtn").addEventListener("click", () => {
    currentFilter = "all";
    renderTasks();
});
document.getElementById("activeBtn").addEventListener("click", () => {
    currentFilter = "active";
    renderTasks();
});
document.getElementById("completedBtn").addEventListener("click", () => {
    currentFilter = "completed";
    renderTasks();
});


/////// sort the list
function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
        if (a.dueDate < b.dueDate) return -1;
        if (a.dueDate == b.dueDate) return 0;
        if (a.dueDate > b.dueDate) return 1;
    });
};

function sortToggleChange() {
    sortByDate = !!document.getElementById("sortBtn")?.checked;
    renderTasks();
}

document.getElementById("sortBtn").addEventListener("click", sortToggleChange);


/////// render tasks
// date format for display
function formatDate(date) {
    if (!date) return "";
    let parts = date.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// render function
function renderTasks() {
    document.getElementById("taskList").innerHTML = "";

    let tasks = getTasks() || [];
    let filtered = filterTasks(tasks, currentFilter);

    if (sortByDate) {
        filtered = sortTasks(filtered);
    }
    
    function addToList(task) {
        let taskElement = document.createElement("li");
        taskElement.className = "list-group-item text-center row m-0 taskListRow"
        if (!task.completed) {
            taskElement.innerHTML = 
            `<div class="col-12 col-sm-7 text-start">${task.text}</div>
            <div class="col-9 col-sm-3 text-start">${formatDate(task.dueDate)}</div>
            <div data-id="${task.id}" class="col-1 completeBtn"><i class="fa-solid fa-check"></i></div>
            <div data-id="${task.id}" class="col-1 deleteBtn"><i class="fa-solid fa-trash-can"></i></div>`;   
        } else {
            taskElement.innerHTML = 
            `<div class="col-12 col-sm-7 text-start text-secondary text-decoration-line-through">${task.text}</div>
            <div class="col-9 col-sm-3 text-start text-secondary">${formatDate(task.dueDate)}</div>
            <div data-id="${task.id}" class="col-1 completeBtn"><i class="fa-solid fa-check"></i></div>
            <div data-id="${task.id}" class="col-1 deleteBtn"><i class="fa-solid fa-trash-can"></i></div>`;              
        }

        let completeBtn = taskElement.querySelector(".completeBtn");
        let deleteBtn = taskElement.querySelector(".deleteBtn")

        completeBtn.addEventListener('click', function(event) {
            let taskId = parseInt(event.currentTarget.dataset.id);
            completeTask(taskId);
        });
        
        deleteBtn.addEventListener('click', function(event) {
            let taskId = parseInt(event.currentTarget.dataset.id);
            deleteTask(taskId);
        });
        
        document.getElementById("taskList").appendChild(taskElement);
    }

    filtered.forEach(addToList);
}

/////// add task
// addTask function
function addTask() {
    let text = document.getElementById("taskDescription").value;
    let dueDate = document.getElementById("taskDate").value;
    let completed = false;

    if (text == null || text == "" || dueDate == null || dueDate == "") {
        alert("Please make sure all fields were filled properly");
        return;
    } else {
        let tasks = getTasks() || [];
        let id = Math.floor(Math.random() * 10000);
        tasks.push({id, text, dueDate, completed});
        saveTasks(tasks);
        
        document.getElementById("taskDescription").value = "";
        document.getElementById("taskDate").value = "";

        renderTasks();
    }
}

// add task eventListener
document.getElementById("addBtn").addEventListener("click", addTask);



/////// complete task
function completeTask(id) {
    let tasks = getTasks() || [];
    const taskIndex = tasks.findIndex(task => task.id == id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks(tasks);
        renderTasks();
    }
}

/////// delete task
function deleteTask(id) {
    let confirmed = confirm("Are you sure you want to delete the task?");
    if (!confirmed) return;

    let tasks = getTasks() || [];

    const filteredTasks = tasks.filter(task => task.id !== id);

    saveTasks(filteredTasks);
    renderTasks();
}

/////// fetch tasks from API
// used 'axios.get' instead of fetch and response.json --> was told this is allowed in the project kickoff lesson :)
async function fetchInitialTasks() {
    let tasks = getTasks() || [];
    if (tasks.length > 0) return;
    try {
        let response = await axios.get(`https://jsonplaceholder.typicode.com/todos?_limit=5`);
        if (response.status == 200) {
                for (let todo of response.data) {
                    let id = todo.id;
                    let text = todo.title;
                    let dueDate = null;
                    let completed = todo.completed;
    
                    tasks.push({id, text, dueDate, completed});
                    saveTasks(tasks);
                };
                renderTasks();
            };
    } catch (error) {
        console.log(error);
        alert("Fetching example tasks failed");
    }
}