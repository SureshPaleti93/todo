const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET STATUS DATA API-1

app.get("/todos/", async (request, response) => {
  const { search_q, status, priority } = request.query;
  console.log(status, priority, search_q);
  try {
    if (status != undefined && priority != undefined) {
      getstatusQuery = `
  SELECT *
  FROM todo
  WHERE 
    status = '${status}' AND priority = '${priority}';`;
      const todoStatus = await db.all(getstatusQuery);
      response.send(todoStatus);
    } else if (status != undefined || priority != undefined) {
      getstatusQuery = `
  SELECT *
  FROM todo
  WHERE 
    status = '${status}' OR priority = '${priority}';`;
      const todoStatus = await db.all(getstatusQuery);
      response.send(todoStatus);
    } else if (search_q != undefined) {
      const getSearchQuery = `
        SELECT *
        FROM todo
        WHERE title LIKE '%${search_q}%';`;

      const searchResults = await db.all(getSearchQuery);
      response.send(searchResults);
    } else {
      response.send("Filed to load");
    }
  } catch (e) {
    response.send("failed");
  }
});
module.exports = app;

//GET TODO BASED ON ID API-2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
        SELECT *
        FROM todo
        WHERE id = ${todoId};
    `;
  const todoData = await db.get(getTodoQuery);
  response.send(todoData);
});
module.exports = app;

//POST TODO DATA API-3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
        INSERT INTO todo(id, todo, priority, status)
        VALUES(${id}, '${todo}', '${priority}', '${status}');
    `;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});
module.exports = app;

//TODO UPDATE API-4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo = "", priority = "", status = "" } = request.body;
  console.log(todo, priority, status);

  if (todo != "") {
    const updateTodoQuery = `
        UPDATE todo
        SET todo = '${todo}'
        WHERE id = ${todoId};
    `;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
  if (priority != "") {
    const updateTodoQuery = `
        UPDATE todo
        SET priority = '${priority}'
        WHERE id = ${todoId};
    `;
    await db.run(updateTodoQuery);
    response.send("Priority Updated");
  }
  if (status != "") {
    const updateTodoQuery = `
        UPDATE todo
        SET todo = '${status}'
        WHERE id = ${todoId};
    `;
    await db.run(updateTodoQuery);
    response.send("Status Updated");
  }
});
module.exports = app;

//DELETE TODO API-5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.expoprts = app;
