import test from "node:test";
import assert from "node:assert/strict";
import {
  PROFILE_STORAGE_KEY,
  createEmptyProfileStore,
  getPlayerProfile,
  listPlayerProfiles,
  parseProfileStore,
  readProfileStore,
  removePlayerProfile,
  savePlayerProfile,
  writeProfileStore,
} from "../profiles.mjs";

function idFactory(...ids) {
  let index = 0;
  return () => ids[index++];
}

test("creates separate identity and Deadball rating records for a saved batter", () => {
  const result = savePlayerProfile(createEmptyProfileStore(), {
    name: "Tommie Agee",
    role: "batter",
    ratings: { bt: 27, obt: 33, bats: "right", contactPlus: true },
  }, idFactory("identity-1", "rating-1"));

  assert.deepEqual(result.store.identities, [{ id: "identity-1", name: "Tommie Agee" }]);
  assert.equal(result.store.ratings[0].identityId, "identity-1");
  assert.equal(result.store.ratings[0].rulesetId, "deadball-2e-modern");
  assert.equal(getPlayerProfile(result.store, "rating-1").ratings.bt, 27);
});

test("updates the selected rating profile without creating a duplicate identity", () => {
  const created = savePlayerProfile(createEmptyProfileStore(), {
    name: "Example Pitcher",
    role: "pitcher",
    ratings: { pitchDieSides: 8 },
  }, idFactory("identity-1", "rating-1"));
  const updated = savePlayerProfile(created.store, {
    id: "rating-1",
    name: "Renamed Pitcher",
    role: "pitcher",
    ratings: { pitchDieSides: 12 },
  });

  assert.equal(updated.store.identities.length, 1);
  assert.equal(updated.store.ratings.length, 1);
  assert.equal(getPlayerProfile(updated.store, "rating-1").name, "Renamed Pitcher");
  assert.equal(getPlayerProfile(updated.store, "rating-1").ratings.pitchDieSides, 12);
});

test("lists profiles by role and sorts them by player name", () => {
  let store = createEmptyProfileStore();
  store = savePlayerProfile(store, { name: "Zulu", role: "batter", ratings: {} }, idFactory("i1", "r1")).store;
  store = savePlayerProfile(store, { name: "Alpha", role: "batter", ratings: {} }, idFactory("i2", "r2")).store;
  store = savePlayerProfile(store, { name: "Pitcher", role: "pitcher", ratings: {} }, idFactory("i3", "r3")).store;

  assert.deepEqual(listPlayerProfiles(store, "batter").map((profile) => profile.name), ["Alpha", "Zulu"]);
  assert.deepEqual(listPlayerProfiles(store, "pitcher").map((profile) => profile.name), ["Pitcher"]);
});

test("removes a profile and its now-unused identity", () => {
  const created = savePlayerProfile(createEmptyProfileStore(), {
    name: "Temporary Player",
    role: "batter",
    ratings: {},
  }, idFactory("identity-1", "rating-1"));
  const removed = removePlayerProfile(created.store, "rating-1");

  assert.deepEqual(removed, createEmptyProfileStore());
});

test("round-trips the versioned store through browser-like storage", () => {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  const created = savePlayerProfile(createEmptyProfileStore(), {
    name: "Stored Player",
    role: "batter",
    ratings: { bt: 30 },
  }, idFactory("identity-1", "rating-1"));

  writeProfileStore(storage, created.store);
  assert.ok(memory.has(PROFILE_STORAGE_KEY));
  assert.deepEqual(readProfileStore(storage), created.store);
});

test("invalid or unknown stored data falls back to an empty store", () => {
  assert.deepEqual(parseProfileStore("not json"), createEmptyProfileStore());
  assert.deepEqual(parseProfileStore(JSON.stringify({ schemaVersion: 99 })), createEmptyProfileStore());
});
