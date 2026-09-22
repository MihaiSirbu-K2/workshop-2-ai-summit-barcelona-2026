import { test } from "node:test";
import assert from "node:assert/strict";
import { listTasks, updateTaskTitle, deleteTask } from "./handlers.js";
import * as store from "./store.js";

const req = { headers: {} };

function makeRes() {
  const res = { statusCode: null, body: "" };
  res.writeHead = (code) => { res.statusCode = code; };
  res.end = (data) => { res.body = data; };
  return res;
}

test("listTasks: 400 when page is less than 1", () => {
  const res = makeRes();
  listTasks({ headers: {}, url: "/tasks?page=0" }, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "invalid page" });
});

test("listTasks: 400 when page is not an integer", () => {
  const res = makeRes();
  listTasks({ headers: {}, url: "/tasks?page=abc" }, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "invalid page" });
});

test("listTasks: 400 when limit exceeds 100", () => {
  const res = makeRes();
  listTasks({ headers: {}, url: "/tasks?limit=101" }, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "invalid limit" });
});

test("listTasks: 200 with defaults returns first page", () => {
  const res = makeRes();
  listTasks({ headers: {}, url: "/tasks" }, res);
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.page, 1);
  assert.equal(body.limit, 20);
  assert.ok(Array.isArray(body.items));
  assert.ok(typeof body.total === "number");
  assert.ok(body.items.length <= 20);
});

test("listTasks: 200 returns different items for page 2", () => {
  store.add("pagination-test-a");
  store.add("pagination-test-b");

  const res1 = makeRes();
  listTasks({ headers: {}, url: "/tasks?page=1&limit=1" }, res1);
  assert.equal(res1.statusCode, 200);
  const body1 = JSON.parse(res1.body);

  const res2 = makeRes();
  listTasks({ headers: {}, url: "/tasks?page=2&limit=1" }, res2);
  assert.equal(res2.statusCode, 200);
  const body2 = JSON.parse(res2.body);

  assert.equal(body1.items.length, 1);
  assert.equal(body2.items.length, 1);
  assert.notDeepEqual(body1.items[0], body2.items[0]);
});

test("deleteTask: 400 when id is not a positive integer", () => {
  const res = makeRes();
  deleteTask(req, res, "abc");
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "invalid id" });
});

test("deleteTask: 404 when task does not exist", () => {
  const res = makeRes();
  deleteTask(req, res, "99999");
  assert.equal(res.statusCode, 404);
  assert.deepEqual(JSON.parse(res.body), { error: "task not found" });
});

test("deleteTask: 204 and task is removed on success", () => {
  const task = store.add("to be deleted");
  const res = makeRes();
  deleteTask(req, res, String(task.id));
  assert.equal(res.statusCode, 204);
  assert.equal(store.find(task.id), undefined);
});

test("updateTaskTitle: 400 when title field is missing", () => {
  const res = makeRes();
  updateTaskTitle(req, res, "1", "{}");
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "title is required" });
});

test("updateTaskTitle: 400 when title is empty string", () => {
  const res = makeRes();
  updateTaskTitle(req, res, "1", JSON.stringify({ title: "" }));
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "title is required" });
});

test("updateTaskTitle: 400 when title exceeds 140 characters", () => {
  const res = makeRes();
  updateTaskTitle(req, res, "1", JSON.stringify({ title: "x".repeat(141) }));
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "title too long" });
});

test("updateTaskTitle: 400 on invalid JSON body", () => {
  const res = makeRes();
  updateTaskTitle(req, res, "1", "not-json");
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "invalid JSON" });
});

test("updateTaskTitle: 400 when id is not a positive integer", () => {
  const res = makeRes();
  updateTaskTitle(req, res, "abc", JSON.stringify({ title: "hi" }));
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { error: "invalid id" });
});

test("updateTaskTitle: 404 when task does not exist", () => {
  const res = makeRes();
  updateTaskTitle(req, res, "99999", JSON.stringify({ title: "new title" }));
  assert.equal(res.statusCode, 404);
  assert.deepEqual(JSON.parse(res.body), { error: "task not found" });
});

test("updateTaskTitle: 200 with updated task on success", () => {
  const task = store.add("original title");
  const res = makeRes();
  updateTaskTitle(req, res, String(task.id), JSON.stringify({ title: "updated title" }));
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.id, task.id);
  assert.equal(body.title, "updated title");
  assert.equal(body.done, false);
});
