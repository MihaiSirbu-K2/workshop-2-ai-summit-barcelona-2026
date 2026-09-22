import { test } from "node:test";
import assert from "node:assert/strict";
import { updateTaskTitle } from "./handlers.js";
import * as store from "./store.js";

const req = { headers: {} };

function makeRes() {
  const res = { statusCode: null, body: "" };
  res.writeHead = (code) => { res.statusCode = code; };
  res.end = (data) => { res.body = data; };
  return res;
}

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
