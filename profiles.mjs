export const PROFILE_STORAGE_KEY = "oddball.playerProfiles.v1";
export const PROFILE_SCHEMA_VERSION = 1;
export const DEADBALL_RULESET_ID = "deadball-2e-modern";
export const PROFILE_BACKUP_FORMAT = "oddball-player-profiles";
export const PROFILE_BACKUP_VERSION = 1;

export function createEmptyProfileStore() {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    identities: [],
    ratings: [],
  };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseProfileStore(serialized) {
  if (!serialized) return createEmptyProfileStore();

  try {
    const parsed = JSON.parse(serialized);
    if (
      !isRecord(parsed)
      || parsed.schemaVersion !== PROFILE_SCHEMA_VERSION
      || !Array.isArray(parsed.identities)
      || !Array.isArray(parsed.ratings)
    ) {
      return createEmptyProfileStore();
    }

    const identities = parsed.identities.filter((identity) => (
      isRecord(identity)
      && typeof identity.id === "string"
      && identity.id.length > 0
      && typeof identity.name === "string"
      && identity.name.trim().length > 0
    )).map((identity) => ({ id: identity.id, name: identity.name.trim() }));
    const identityIds = new Set(identities.map((identity) => identity.id));
    const ratings = parsed.ratings.filter((rating) => (
      isRecord(rating)
      && typeof rating.id === "string"
      && rating.id.length > 0
      && identityIds.has(rating.identityId)
      && rating.rulesetId === DEADBALL_RULESET_ID
      && ["batter", "pitcher"].includes(rating.role)
      && isRecord(rating.values)
    )).map((rating) => ({
      id: rating.id,
      identityId: rating.identityId,
      rulesetId: rating.rulesetId,
      role: rating.role,
      values: { ...rating.values },
    }));

    return { schemaVersion: PROFILE_SCHEMA_VERSION, identities, ratings };
  } catch {
    return createEmptyProfileStore();
  }
}

export function readProfileStore(storage) {
  return parseProfileStore(storage.getItem(PROFILE_STORAGE_KEY));
}

export function writeProfileStore(storage, store) {
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(store));
}

export function createProfileBackup(store, exportedAt = new Date().toISOString()) {
  return {
    format: PROFILE_BACKUP_FORMAT,
    backupVersion: PROFILE_BACKUP_VERSION,
    exportedAt,
    profileStore: {
      schemaVersion: PROFILE_SCHEMA_VERSION,
      identities: store.identities.map((identity) => ({ ...identity })),
      ratings: store.ratings.map((rating) => ({ ...rating, values: { ...rating.values } })),
    },
  };
}

export function serializeProfileBackup(store, exportedAt) {
  return `${JSON.stringify(createProfileBackup(store, exportedAt), null, 2)}\n`;
}

export function parseProfileBackup(serialized) {
  let backup;
  try {
    backup = JSON.parse(serialized);
  } catch {
    throw new Error("This is not a readable JSON backup file.");
  }

  if (!isRecord(backup) || backup.format !== PROFILE_BACKUP_FORMAT) {
    throw new Error("This file is not an ODDBALL player-profile backup.");
  }
  if (backup.backupVersion !== PROFILE_BACKUP_VERSION) {
    throw new Error("This backup version is not supported by this build of ODDBALL.");
  }
  const source = backup.profileStore;
  if (
    !isRecord(source)
    || source.schemaVersion !== PROFILE_SCHEMA_VERSION
    || !Array.isArray(source.identities)
    || !Array.isArray(source.ratings)
  ) {
    throw new Error("The backup does not contain a supported player-profile library.");
  }

  const store = parseProfileStore(JSON.stringify(source));
  const identityIds = store.identities.map((identity) => identity.id);
  const ratingIds = store.ratings.map((rating) => rating.id);
  if (
    store.identities.length !== source.identities.length
    || store.ratings.length !== source.ratings.length
    || new Set(identityIds).size !== identityIds.length
    || new Set(ratingIds).size !== ratingIds.length
    || !store.ratings.every((rating) => isValidBackupRatings(rating.role, rating.values))
  ) {
    throw new Error("The backup contains incomplete, invalid, or duplicate player records.");
  }
  return store;
}

function isValidBackupRatings(role, values) {
  if (role === "batter") {
    return Number.isInteger(values.bt)
      && values.bt >= 5
      && values.bt <= 99
      && Number.isInteger(values.obt)
      && values.obt >= values.bt
      && values.obt <= 99
      && ["none", "right", "left", "switch"].includes(values.hand)
      && ["none", "p-plus", "p-plus-plus", "p-minus", "p-minus-minus"].includes(values.powerTrait)
      && [values.contactPlus, values.speedPlus, values.freeSwinger].every((value) => typeof value === "boolean");
  }
  return [-20, -12, -8, -4, 4, 8, 12, 20].includes(values.pitchDieSides)
    && ["none", "right", "left"].includes(values.hand)
    && ["starter", "reliever"].includes(values.role)
    && ["none", "cn-plus", "cn-minus"].includes(values.controlTrait)
    && [values.kPlus, values.groundballPlus].every((value) => typeof value === "boolean");
}

export function mergeProfileStores(currentStore, importedStore) {
  const identities = new Map(currentStore.identities.map((identity) => [identity.id, { ...identity }]));
  const ratings = new Map(currentStore.ratings.map((rating) => [rating.id, { ...rating, values: { ...rating.values } }]));

  for (const identity of importedStore.identities) identities.set(identity.id, { ...identity });
  for (const rating of importedStore.ratings) ratings.set(rating.id, { ...rating, values: { ...rating.values } });

  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    identities: [...identities.values()],
    ratings: [...ratings.values()],
  };
}

export function listPlayerProfiles(store, role) {
  const identities = new Map(store.identities.map((identity) => [identity.id, identity]));
  return store.ratings
    .filter((rating) => rating.role === role)
    .map((rating) => ({
      id: rating.id,
      identityId: rating.identityId,
      name: identities.get(rating.identityId)?.name ?? "Unknown player",
      role: rating.role,
      ratings: { ...rating.values },
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getPlayerProfile(store, ratingId) {
  const rating = store.ratings.find((candidate) => candidate.id === ratingId);
  if (!rating) return null;
  const identity = store.identities.find((candidate) => candidate.id === rating.identityId);
  if (!identity) return null;
  return {
    id: rating.id,
    identityId: identity.id,
    name: identity.name,
    role: rating.role,
    ratings: { ...rating.values },
  };
}

export function savePlayerProfile(store, profile, createId = () => crypto.randomUUID()) {
  const name = String(profile.name ?? "").trim();
  if (!name) throw new Error("Enter a player name before saving a profile.");
  if (!["batter", "pitcher"].includes(profile.role)) throw new Error("Choose a batter or pitcher profile.");
  if (!isRecord(profile.ratings)) throw new Error("Player ratings are required.");

  const nextStore = {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    identities: store.identities.map((identity) => ({ ...identity })),
    ratings: store.ratings.map((rating) => ({ ...rating, values: { ...rating.values } })),
  };
  const existingRating = profile.id
    ? nextStore.ratings.find((rating) => rating.id === profile.id && rating.role === profile.role)
    : null;

  if (existingRating) {
    const identity = nextStore.identities.find((candidate) => candidate.id === existingRating.identityId);
    if (identity) identity.name = name;
    existingRating.values = { ...profile.ratings };
    return { store: nextStore, profileId: existingRating.id };
  }

  const identityId = createId();
  const ratingId = createId();
  nextStore.identities.push({ id: identityId, name });
  nextStore.ratings.push({
    id: ratingId,
    identityId,
    rulesetId: DEADBALL_RULESET_ID,
    role: profile.role,
    values: { ...profile.ratings },
  });
  return { store: nextStore, profileId: ratingId };
}

export function removePlayerProfile(store, ratingId) {
  const removed = store.ratings.find((rating) => rating.id === ratingId);
  if (!removed) return store;

  const ratings = store.ratings
    .filter((rating) => rating.id !== ratingId)
    .map((rating) => ({ ...rating, values: { ...rating.values } }));
  const identityStillUsed = ratings.some((rating) => rating.identityId === removed.identityId);
  const identities = store.identities
    .filter((identity) => identity.id !== removed.identityId || identityStillUsed)
    .map((identity) => ({ ...identity }));
  return { schemaVersion: PROFILE_SCHEMA_VERSION, identities, ratings };
}
