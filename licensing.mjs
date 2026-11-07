export const DEADBALL_ACKNOWLEDGMENT_KEY = "oddball.deadballOwnership.v1";
export const DEADBALL_ACKNOWLEDGMENT_VERSION = 1;

export function readDeadballAcknowledgment(storage) {
  try {
    const stored = JSON.parse(storage.getItem(DEADBALL_ACKNOWLEDGMENT_KEY));
    return Boolean(
      stored
      && stored.version === DEADBALL_ACKNOWLEDGMENT_VERSION
      && stored.ownsSecondEdition === true,
    );
  } catch {
    return false;
  }
}

export function writeDeadballAcknowledgment(storage, acknowledgedAt = new Date().toISOString()) {
  try {
    storage.setItem(DEADBALL_ACKNOWLEDGMENT_KEY, JSON.stringify({
      version: DEADBALL_ACKNOWLEDGMENT_VERSION,
      ownsSecondEdition: true,
      acknowledgedAt,
    }));
    return true;
  } catch {
    return false;
  }
}
