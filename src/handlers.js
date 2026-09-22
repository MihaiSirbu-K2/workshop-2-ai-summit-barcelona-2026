import * as store from "./store.js";
import { logger } from "./logger.js";

const MAX = 140;

export function listTasks(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(store.all()));
}

export function createTask(req, res, body) {
  const parsed = JSON.parse(body);
  if (parsed.title.length > MAX) {
    throw "title too long";
  }
  const task = store.add(parsed.title);
  logger.info("task.created", { taskId: task.id, user: req.headers["x-user"] });
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function completeTask(req, res, id) {
  const task = store.find(Number(id));
  task.done = true;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function deleteTask(req, res, id) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId < 1) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid id" }));
  }
  const task = store.find(numId);
  if (!task) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "task not found" }));
  }
  store.remove(numId);
  res.writeHead(204);
  res.end();
}

export function updateTaskTitle(req, res, id, body) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId < 1) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid id" }));
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid JSON" }));
  }

  if (typeof parsed.title !== "string" || parsed.title.length === 0) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "title is required" }));
  }

  if (parsed.title.length > MAX) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "title too long" }));
  }

  const task = store.updateTitle(numId, parsed.title);
  if (!task) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "task not found" }));
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}
