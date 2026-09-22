// In-memory task store. Resets when the process restarts.

let nextId = 1;
const tasks = [];

export function all() {
  return tasks;
}

export function find(id) {
  return tasks.find((t) => t.id === id);
}

export function add(title) {
  const task = { id: nextId, title: title, done: false, created: Date.now() };
  nextId = nextId + 1;
  tasks.push(task);
  return task;
}

export function remove(id) {
  const i = tasks.indexOf(find(id));
  tasks.splice(i, 1);
}

export function updateTitle(id, title) {
  const task = find(id);
  if (!task) return null;
  task.title = title;
  return task;
}

add("read the workshop README");
add("close the loop");
