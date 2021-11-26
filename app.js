let tasks = [];
let loadedTasks  = false;
let username = "";
var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
// Selectors
document.querySelector('form').addEventListener('submit', handleSubmitForm);

// Event Handlers
function handleSubmitForm(e) {
    e.preventDefault();
    let input = document.querySelector("div.main input[id='fname']");
    if (input.value != '')
        addTodoFromWebsite(input.value);
    input.value = '';
}

function getSliderValues(id) {
  var moodNow = document.getElementById(id) 
  if(id == "physical"){
    var output = document.getElementById("value");
    
  }
  if(id =="creative"){
    var output = document.getElementById("value2");
  }
  if(id == "logical"){
    var output = document.getElementById("value3");
  }
 
  let update = () => output.innerHTML = moodNow.value;
  moodNow.addEventListener('input', update);
  update();
}

function addTodoFromWebsite(todo){
    var due = document.getElementById("due").value; 
    var desc = document.getElementById("description").value;
    var attention = document.getElementById("attentionSpan").value;
    var creative = document.getElementById("creativeDemand").value;
    var physical = document.getElementById("physicalDemand").value;
    console.log(desc);
    let id = storeNewTodo(todo, username, false, due, desc, attention, creative, physical);
    addTodo(todo, due, false, desc, id, attention, creative, physical);
    document.getElementById("newTodo").open = false;
    //we have to clear the values again, otherwise they'll stay like that
}

// Helpers
function addTodo(todo, due, done, description, id, attention, creative, physical) {
    let ul = document.querySelector('ul');
    let li = document.createElement('li');

    li.innerHTML = `
        <details>
          <summary>
            <span class="todo-item">${todo}<br><br>${due}</span>            
            <button name="checkButton"><i class="fas fa-square"></i></button>
            <button name="deleteButton" ><i class="fas fa-trash"></i></button>
            <span class="hidden">${id}</span>
          </summary>
          <p>${description}</p>
          <p>${attention}</p>
          <p>${creative}</p>
          <p>${physical}</p>
        </details>
    `;    
    // the buttons are not yet positioned in the right place.
    //li.classList.add(window.localStorage.setItem('todo', 'clean my room'));
    li.classList.add('todo-list-item');
    ul.appendChild(li);
    if(done){
      actuallyCheckTodo(li.children[0].children[0].children[1]); //give the check the checkbutton
    }
}

//sorting the todos according to the mood
function sortPlanner(){


}
/**
 * stores a new todo in the tasks and stores it
 * @param {the title of the todo} title 
 * @param {username} user 
 * @param {is it done} done 
 * @param {the due date} due 
 * @param {description} description 
 * @param {attention} attention
 * @param {creative} creative
 * @param {physical} physical
 */
function storeNewTodo(title, user, done, due, description, attention, creative, physical){
  let highestId = 0;
  let priority = today;
  tasks.forEach(todo =>{
    highestId = todo.id > highestId ? todo.id : highestId;
    priority = todo.due >= today ? todo.due : priority;
  })
  
  tasks.push({"id": ++highestId, "title": title, "user": user, "done": done, "due": due, "description": description, "attention": attention, "creative": creative, "physical": physical});
  localStorage.setItem("tasks", JSON.stringify(tasks));
  tasks.sort(function (a, b) {
    if (a.due > b.due) return 1;
    if (a.due < b.due) return -1;
    return 0;
   
  });
  return highestId;


}

console.log(tasks)
document.querySelector('ul').addEventListener('click', handleClickDeleteOrCheck);

function handleClickDeleteOrCheck(e) {
    if (e.target.name == 'checkButton')
        checkTodo(e);

    if (e.target.name == 'deleteButton')
        deleteTodo(e);
}

function actuallyCheckTodo(node){
  let item = node.parentNode;  
  if (item.style.textDecoration == 'line-through'){
    item.style.textDecoration = 'none';
    node.children[0].classList.replace("fa-check-square", "fa-square");
  }
  else{
      item.style.textDecoration = 'line-through';
      node.children[0].classList.replace("fa-square", "fa-check-square");
  }
}

function checkTodo(e) {
    let item = e.target;
    let id = item.parentNode.children[3].innerHTML;
    tasks.forEach(todo =>{
      if(todo.id == id){
        todo.done = !todo.done;
      }
    })     
    localStorage.setItem("tasks", JSON.stringify(tasks));
    actuallyCheckTodo(item);    
}

function deleteTodo(e) {
    let item = e.target.parentNode;
    console.log(item);
    let id = item.children[3].innerHTML;    
    let newTasks = [];
    let idx = 0;
    tasks.forEach(todo =>{
      if (todo.id != id){
        newTasks[idx++] = todo;
      }
    })
    tasks = newTasks;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    item.addEventListener('transitionend', function () {
        item.remove(); 
    });

    item.classList.add('todo-list-item-fall');
    item.parentNode.parentNode.remove() //deletes the li element
}

document.getElementById('clearAll').addEventListener('click', handleClearAll);

function handleClearAll(e) {
    document.querySelector('ul').innerHTML = '';
}



/**
 * loads all todos from a user and displays them
 * @param {username} name 
 * @returns 
 */
function loadTodos(name){  
  handleClearAll(null);
  
  //show new user name "form"
  if(name == "new User"){
    document.getElementById("newUserName").classList.remove("hidden");
  }
  else{
    document.getElementById("newUserName").classList.add("hidden");
  }

  //show the webpage if a valid user has been chosen
  if( name == "" || name == "new User"){
    document.getElementById("webpage").classList.add("hidden");
    return;
  }
  document.getElementById("webpage").classList.remove("hidden");

  console.log("1");
  username = name;
  tasks.forEach(todo => {
    if(todo.user == name){
      addTodo(todo.title, todo.due, todo.done, todo.description, todo.id, todo.attention, todo.creative, todo.physical);
      console.log(todo.id);
    }
  });
}

/**
 * get tasks if not there yet and load usernames
 */
async function loadUsernames(){ 
  await loadTasks().catch((error) => {console.log(error);});  
  let usernames = [];
  tasks.forEach(todo => {
    if (usernames.lastIndexOf(todo.user) == -1){
      usernames.push(todo.user);
    }
  });

  let usernamesMarkup = document.querySelector("select");
 
  usernames.forEach(username => {
    let option = document.createElement("option");
    option.value = username;
    option.innerText = username;
    usernamesMarkup.appendChild(option);
  });     
}

/**
 * locally stores the username
 * @param {username} name 
 */
function changeUsername(name){    
  username = name;
  let usernamesMarkup = document.querySelector("select");
  let option = document.createElement("option");
  option.value = username;
  option.innerText = username;
  usernamesMarkup.appendChild(option);
  usernamesMarkup.value = username;
  document.getElementById("newUserName").classList.add("hidden");
  loadTodos(name);
}

/**
 * loads the tasks either from localstorage or from server
 */
async function loadTasks(){
  if (!loadedTasks){
    if (localStorage.getItem("tasks") == null){
      let response = await fetch("/tasks.json");  
      tasks = await response.json();    
      loadedTasks = true;
    }
    else{
      tasks = JSON.parse(localStorage.getItem("tasks"));
      loadedTasks = true;
    }
  }
}