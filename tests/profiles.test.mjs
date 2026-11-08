import test from "node:test";
import assert from "node:assert/strict";
import {
  PROFILE_BACKUP_FORMAT,
  PROFILE_STORAGE_KEY,
  createProfileBackup,
  createEmptyProfileStore,
  getPlayerProfile,
  listPlayerProfiles,
  mergeProfileStores,
  parseProfileBackup,
  parseProfileStore,
  readProfileStore,
  removePlayerProfile,
  savePlayerProfile,
  serializeProfileBackup,
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

test("replaces a stored player library with an empty profile store", () => {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  const created = savePlayerProfile(createEmptyProfileStore(), {
    name: "Player to Delete",
    role: "batter",
    ratings: { bt: 30 },
  }, idFactory("identity-1", "rating-1")).store;

  writeProfileStore(storage, created);
  writeProfileStore(storage, createEmptyProfileStore());

  assert.deepEqual(readProfileStore(storage), createEmptyProfileStore());
});

test("invalid or unknown stored data falls back to an empty store", () => {
  assert.deepEqual(parseProfileStore("not json"), createEmptyProfileStore());
  assert.deepEqual(parseProfileStore(JSON.stringify({ schemaVersion: 99 })), createEmptyProfileStore());
});

test("creates and parses a versioned player-profile backup", () => {
  const created = savePlayerProfile(createEmptyProfileStore(), {
    name: "Backup Batter",
    role: "batter",
    ratings: {
      bt: 29,
      obt: 35,
      hand: "right",
      powerTrait: "none",
      contactPlus: false,
      speedPlus: false,
      freeSwinger: false,
    },
  }, idFactory("identity-1", "rating-1")).store;
  const serialized = serializeProfileBackup(created, "2026-11-06T12:00:00.000Z");
  const backup = JSON.parse(serialized);

  assert.equal(backup.format, PROFILE_BACKUP_FORMAT);
  assert.equal(backup.exportedAt, "2026-11-06T12:00:00.000Z");
  assert.deepEqual(parseProfileBackup(serialized), created);
  assert.deepEqual(createProfileBackup(created, backup.exportedAt).profileStore, created);
});

test("rejects malformed, unrelated, and unsupported profile backups", () => {
  assert.throws(() => parseProfileBackup("not json"), /readable JSON/);
  assert.throws(() => parseProfileBackup(JSON.stringify({ format: "something-else" })), /not an ODDBALL/);
  assert.throws(() => parseProfileBackup(JSON.stringify({
    format: PROFILE_BACKUP_FORMAT,
    backupVersion: 99,
  })), /not supported/);
  assert.throws(() => parseProfileBackup(JSON.stringify({
    format: PROFILE_BACKUP_FORMAT,
    backupVersion: 1,
    profileStore: {
      schemaVersion: 1,
      identities: [{ id: "identity-1", name: "Valid" }],
      ratings: [{ id: "rating-1", identityId: "missing", rulesetId: "deadball-2e-modern", role: "batter", values: {} }],
    },
  })), /incomplete, invalid, or duplicate/);
  assert.throws(() => parseProfileBackup(JSON.stringify({
    format: PROFILE_BACKUP_FORMAT,
    backupVersion: 1,
    profileStore: {
      schemaVersion: 1,
      identities: [{ id: "identity-1", name: "Invalid Batter" }],
      ratings: [{ id: "rating-1", identityId: "identity-1", rulesetId: "deadball-2e-modern", role: "batter", values: { bt: 31 } }],
    },
  })), /incomplete, invalid, or duplicate/);
});

test("merges imported profiles while updating matching saved record IDs", () => {
  const current = savePlayerProfile(createEmptyProfileStore(), {
    name: "Current Batter",
    role: "batter",
    ratings: { bt: 30 },
  }, idFactory("identity-1", "rating-1")).store;
  const imported = {
    schemaVersion: 1,
    identities: [
      { id: "identity-1", name: "Updated Batter" },
      { id: "identity-2", name: "Imported Pitcher" },
    ],
    ratings: [
      { id: "rating-1", identityId: "identity-1", rulesetId: "deadball-2e-modern", role: "batter", values: { bt: 32 } },
      { id: "rating-2", identityId: "identity-2", rulesetId: "deadball-2e-modern", role: "pitcher", values: { pitchDieSides: 12 } },
    ],
  };
  const merged = mergeProfileStores(current, imported);

  assert.equal(merged.ratings.length, 2);
  assert.equal(getPlayerProfile(merged, "rating-1").name, "Updated Batter");
  assert.equal(getPlayerProfile(merged, "rating-1").ratings.bt, 32);
  assert.equal(getPlayerProfile(merged, "rating-2").name, "Imported Pitcher");
});
