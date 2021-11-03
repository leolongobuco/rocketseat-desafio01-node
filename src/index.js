const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameIsAlreadyInUse = users.some(
    (user) => user.username === username
  );

  if (usernameIsAlreadyInUse) {
    return response
      .status(400)
      .json({ error: "This username is already being used" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const tasks = user.todos;

  return response.json(tasks);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(task);

  return response.status(201).json(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const taskExists = user.todos.some((task) => task.id === id);

  if (!taskExists) {
    return response.status(404).json({ error: "Todo not found" });
  }
  const task = user.todos.find((task) => task.id === id);

  task.title = title;
  task.deadline = new Date(deadline);

  return response.json(task);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskExists = user.todos.some((task) => task.id === id);

  if (!taskExists) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const task = user.todos.find((task) => task.id === id);

  task.done = true;

  return response.json(task);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskExists = user.todos.some((task) => task.id === id);

  if (!taskExists) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const task = user.todos.find((task) => task.id === id);

  user.todos.splice(user.todos.indexOf(task), 1);

  return response.status(204).send();
});

module.exports = app;
