const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasSearchproperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryProperty = (requestQuery) =>
  requestQuery.category !== undefined;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTOdoQuery = "";
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          const getTOdoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        status = '${status}' and priority ='${priority}'
        ;`;
          const playersArray = await database.all(getTOdoQuery);
          response.send(
            playersArray.map((eachPlayer) =>
              convertDbObjectToResponseObject(eachPlayer)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    case hasCategoryAndStatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          const getTOdoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        status = '${status}' and category ='${category}'
        ;`;
          const playersArray = await database.all(getTOdoQuery);
          response.send(
            playersArray.map((eachPlayer) =>
              convertDbObjectToResponseObject(eachPlayer)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo category");
      }

      break;

    case hasPriorityAndStatusProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          const getTOdoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        category = '${category}' and priority ='${priority}'
        ;`;
          const playersArray = await database.all(getTOdoQuery);
          response.send(
            playersArray.map((eachPlayer) =>
              convertDbObjectToResponseObject(eachPlayer)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const getTOdoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        status = '${status}'
        ;`;
        const playersArray = await database.all(getTOdoQuery);
        response.send(
          playersArray.map((eachPlayer) =>
            convertDbObjectToResponseObject(eachPlayer)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasSearchproperty(request.query):
      const getTOdoQuery = `
        SELECT
        *
        FROM
        todo LIKE '%${search_q}%'
        ;`;
      const playersArray = await database.all(getTOdoQuery);
      response.send(
        playersArray.map((eachPlayer) =>
          convertDbObjectToResponseObject(eachPlayer)
        )
      );

      break;

    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const getTOdoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        category = '${category}'
        ;`;
        const playersArray = await database.all(getTOdoQuery);
        response.send(
          playersArray.map((eachPlayer) =>
            convertDbObjectToResponseObject(eachPlayer)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const getTOdoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        priority = '${priority}'
        ;`;
        const playersArray = await database.all(getTOdoQuery);
        response.send(
          playersArray.map((eachPlayer) =>
            convertDbObjectToResponseObject(eachPlayer)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    default:
      getTOdoQuery = "SELECT * FROM todo";
      response.send(
        playersArray.map((eachPlayer) =>
          convertDbObjectToResponseObject(eachPlayer)
        )
      );
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  console.log(isMatch(date, "yyyy-MM-dd"));

  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");

    console.log(newDate);

    const requestQuery = `select * from todo where due_date='${newDate}'`;
    const responseResult = await database.all(requestQuery);
    response.send(
      responseResult.map((eachItem) =>
        convertDbObjectToResponseObject(eachItem)
      )
    );
  } else {
    response.status(400);

    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const postTodoQuery = ` 
                INSERT 
                INTO
                todo (id, todo, category, priority, status, due_date)
                VALUES
                (${id}, '${todo}', '${category}', '${priority}', '${status}', '${postNewDueDate}') `;

          await database.run(postTodoQuery);
          //console.log(responseResult);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  console.log(requestBody);
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}; `;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  let updateTodoQuery;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority="${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority="${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    case requestBody.todo !== undefined:
      updateTodoQuery = `UPDATE todo SET todo='${todo}', priority="${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`;

      await database.run(updateTodoQuery);
      response.send("Todo Updated");

      break;

    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority="${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newdueDate = format(new Date(dueDate, "yyyy-MM-dd"));
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority="${priority}', status='${status}', category='${category}', due_date='${newdueDate}' WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }

      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;
  await database.run(deletePlayerQuery);
  response.send("Todo Deleted");
});

module.exports = app;
