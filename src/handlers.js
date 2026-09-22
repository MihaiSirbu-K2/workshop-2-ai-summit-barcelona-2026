import * as store from "./store.js";
import { logger } from "./logger.js";

const MAX = 140;

export function listTasks(req, res) {
  const qs = req.url.includes("?") ? req.url.split("?")[1] : "";
  const params = new URLSearchParams(qs);
  const page = Number(params.get("page") ?? "1");
  const limit = Number(params.get("limit") ?? "20");

  if (!Number.isInteger(page) || page < 1) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid page" }));
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid limit" }));
  }

  const all = store.all();
  const total = all.length;
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ items, total, page, limit }));
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
