import test from "node:test";
import assert from "node:assert/strict";
import {
  DEADBALL_ACKNOWLEDGMENT_KEY,
  readDeadballAcknowledgment,
  writeDeadballAcknowledgment,
} from "../licensing.mjs";

function memoryStorage() {
  const memory = new Map();
  return {
    memory,
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
}

test("remembers the Deadball ownership acknowledgment", () => {
  const storage = memoryStorage();
  assert.equal(readDeadballAcknowledgment(storage), false);
  assert.equal(writeDeadballAcknowledgment(storage, "2026-11-06T12:00:00.000Z"), true);
  assert.equal(readDeadballAcknowledgment(storage), true);
  assert.deepEqual(JSON.parse(storage.memory.get(DEADBALL_ACKNOWLEDGMENT_KEY)), {
    version: 1,
    ownsSecondEdition: true,
    acknowledgedAt: "2026-11-06T12:00:00.000Z",
  });
});

test("rejects malformed or unknown acknowledgment records", () => {
  const storage = memoryStorage();
  storage.memory.set(DEADBALL_ACKNOWLEDGMENT_KEY, "not json");
  assert.equal(readDeadballAcknowledgment(storage), false);
  storage.memory.set(DEADBALL_ACKNOWLEDGMENT_KEY, JSON.stringify({ version: 99, ownsSecondEdition: true }));
  assert.equal(readDeadballAcknowledgment(storage), false);
  storage.memory.set(DEADBALL_ACKNOWLEDGMENT_KEY, JSON.stringify({ version: 1, ownsSecondEdition: false }));
  assert.equal(readDeadballAcknowledgment(storage), false);
});

test("fails safely when browser storage is unavailable", () => {
  const storage = {
    getItem: () => { throw new Error("unavailable"); },
    setItem: () => { throw new Error("unavailable"); },
  };
  assert.equal(readDeadballAcknowledgment(storage), false);
  assert.equal(writeDeadballAcknowledgment(storage), false);
});
