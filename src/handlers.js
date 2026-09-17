import * as store from "./store.js";

const MAX = 140;

export function listTasks(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(store.all()));
}

export function createTask(req, res, body) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendError(res, 400, "invalid_json", "body must be valid JSON");
  }

  const invalid = validateTitle(parsed.title);
  if (invalid) {
    return sendError(res, 400, invalid.code, invalid.message);
  }

  const task = store.add(parsed.title);
  console.log("created task " + task.id);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function completeTask(req, res, id) {
  const taskId = Number(id);
  if (!Number.isInteger(taskId)) {
    return sendError(res, 400, "invalid_id", "task id must be an integer");
  }

  const task = store.find(taskId);
  if (!task) {
    return sendError(res, 404, "not_found", "no task with that id");
  }

  task.done = true;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function updateTaskTitle(req, res, id, body) {
  const taskId = Number(id);
  if (!Number.isInteger(taskId)) {
    return sendError(res, 400, "invalid_id", "task id must be an integer");
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendError(res, 400, "invalid_json", "body must be valid JSON");
  }

  const invalid = validateTitle(parsed.title);
  if (invalid) {
    return sendError(res, 400, invalid.code, invalid.message);
  }

  const task = store.find(taskId);
  if (!task) {
    return sendError(res, 404, "not_found", "no task with that id");
  }

  task.title = parsed.title;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function deleteTask(req, res, id) {
  const taskId = Number(id);
  if (!Number.isInteger(taskId)) {
    return sendError(res, 400, "invalid_id", "task id must be an integer");
  }

  const task = store.find(taskId);
  if (!task) {
    return sendError(res, 404, "not_found", "no task with that id");
  }

  store.remove(taskId);
  res.writeHead(204);
  res.end();
}

function validateTitle(title) {
  if (typeof title !== "string" || title.trim() === "") {
    return { code: "invalid_title", message: "title must be a non-empty string" };
  }
  if (title.length > MAX) {
    return { code: "title_too_long", message: "title must be " + MAX + " characters or fewer" };
  }
  return null;
}

function sendError(res, status, code, message) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { code: code, message: message } }));
}
