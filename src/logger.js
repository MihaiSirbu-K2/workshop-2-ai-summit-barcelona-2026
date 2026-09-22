const log = (level, event, meta = {}) =>
  process.stdout.write(
    JSON.stringify({ level, event, ...meta, ts: new Date().toISOString() }) + "\n"
  );

export const logger = {
  info: (event, meta) => log("info", event, meta),
  error: (event, meta) => log("error", event, meta),
};
