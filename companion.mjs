import { PITCH_DIE_SIDES, calculateEffectivePitchDie, calculateEffectiveTargets, classifyMss, formatPitchDie, requiresHitDefense, resolveAtBat, resolveBuntAttempt, resolveHitAndRunAttempt, resolveStealAttempt } from "./rules/deadball/modern.mjs?v=0.20";
import { readDeadballAcknowledgment, writeDeadballAcknowledgment } from "./licensing.mjs?v=0.1";
import {
  createEmptyProfileStore,
  getPlayerProfile,
  listPlayerProfiles,
  mergeProfileStores,
  parseProfileBackup,
  readProfileStore,
  removePlayerProfile,
  savePlayerProfile,
  serializeProfileBackup,
  writeProfileStore,
} from "./profiles.mjs?v=0.2";

const form = document.querySelector("#companion-form");
const resultPanel = document.querySelector("#result-panel");
const resultCall = document.querySelector("#result-call");
const resultTitle = document.querySelector("#result-title");
const resultDetail = document.querySelector("#result-detail");
const calculationTrail = document.querySelector("#calculation-trail");
const validationSummary = document.querySelector("#validation-summary");
const overrideForm = document.querySelector("#override-form");
const overrideDisplay = document.querySelector("#override-display");
const applyContextButton = document.querySelector("#apply-context");
const editInputsButton = document.querySelector("#edit-inputs");
const overrideButton = document.querySelector("#override-ruling");
const confirmMessage = document.querySelector("#context-confirmation");
const saveOverrideButton = document.querySelector("#save-override");

let latestResult = null;
let profileStore;
let pendingDefense = null;
let pendingImportedProfileStore = null;
let deadballCreditsMode = "about";
const profileDialogState = new Map();

try {
  profileStore = readProfileStore(window.localStorage);
} catch {
  profileStore = createEmptyProfileStore();
}

function rollDie(sides) {
  const maximum = Math.floor(0x100000000 / sides) * sides;
  const values = new Uint32Array(1);
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= maximum);
  return (values[0] % sides) + 1;
}

function numberValue(id) {
  const value = Number(document.querySelector(`#${id}`).value);
  return Number.isFinite(value) ? value : Number.NaN;
}

function selectedDiceMode() {
  return form.elements.namedItem("dice-mode").value;
}

function selectedPlayType() {
  return form.elements.namedItem("play-type").value;
}

function setProfileStatus(role, message) {
  document.querySelector(`#${role}-profile-status`).textContent = message;
  const dialog = document.querySelector(`#${role}-profile-dialog`);
  if (dialog?.open) {
    document.querySelector(`#${role}-dialog-description`).textContent = message;
  }
}

function persistProfiles() {
  try {
    writeProfileStore(window.localStorage, profileStore);
    return true;
  } catch {
    return false;
  }
}

function profileCounts(store = profileStore) {
  return {
    batters: listPlayerProfiles(store, "batter").length,
    pitchers: listPlayerProfiles(store, "pitcher").length,
  };
}

function profileCountText(store = profileStore) {
  const { batters, pitchers } = profileCounts(store);
  const batterText = `${batters} ${batters === 1 ? "batter" : "batters"}`;
  const pitcherText = `${pitchers} ${pitchers === 1 ? "pitcher" : "pitchers"}`;
  return `${batterText} · ${pitcherText}`;
}

function updateProfileLibrarySummary() {
  const counts = profileCounts();
  const total = counts.batters + counts.pitchers;
  document.querySelector("#profile-library-summary").textContent = total
    ? `${profileCountText()} saved in this browser`
    : "No saved players in this browser";
  document.querySelector("#export-profile-summary").textContent = total
    ? `Download ${profileCountText()} in one portable file.`
    : "Save at least one batter or pitcher before exporting a backup.";
  document.querySelector("#export-profiles").disabled = total === 0;
  document.querySelector("#delete-all-profiles").disabled = total === 0;
}

function setProfileLibraryMessage(message, state = "ready") {
  const display = document.querySelector("#profile-library-message");
  display.textContent = message;
  display.dataset.state = state;
}

function openDeadballCredits({ firstEntry = false } = {}) {
  const dialog = document.querySelector("#deadball-credits-dialog");
  const ownership = document.querySelector("#ownership-acknowledgment");
  const checkbox = document.querySelector("#owns-deadball");
  const continueButton = document.querySelector("#continue-to-companion");
  deadballCreditsMode = firstEntry ? "welcome" : "about";

  document.querySelector("#deadball-credits-kicker").textContent = firstEntry ? "Before you roll" : "About this ruleset";
  document.querySelector("#deadball-credits-title").textContent = firstEntry
    ? "Welcome to the Deadball companion"
    : "Deadball credits";
  document.querySelector("#close-deadball-credits").hidden = firstEntry;
  ownership.hidden = !firstEntry;
  checkbox.disabled = !firstEntry;
  checkbox.checked = false;
  document.querySelector("#ownership-message").textContent = "This honor-system acknowledgment will be remembered in this browser.";
  document.querySelector("#ownership-message").dataset.state = "ready";
  continueButton.textContent = firstEntry ? "Enter Dice Companion" : "Close";
  continueButton.disabled = firstEntry;
  dialog.showModal();
  (firstEntry ? checkbox : continueButton).focus();
}

function finishDeadballCredits() {
  const dialog = document.querySelector("#deadball-credits-dialog");
  if (deadballCreditsMode === "about" || deadballCreditsMode === "unsaved") {
    dialog.close();
    return;
  }

  const checkbox = document.querySelector("#owns-deadball");
  if (!checkbox.checked) return;
  let remembered = false;
  try {
    remembered = writeDeadballAcknowledgment(window.localStorage);
  } catch {
    remembered = false;
  }
  if (!remembered) {
    const message = document.querySelector("#ownership-message");
    message.textContent = "This browser could not remember the acknowledgment. You may continue, but this welcome will appear again next time.";
    message.dataset.state = "warning";
    document.querySelector("#continue-to-companion").textContent = "Continue without saving";
    deadballCreditsMode = "unsaved";
    return;
  }
  deadballCreditsMode = "acknowledged";
  dialog.close();
}

function openProfileLibraryDialog() {
  pendingImportedProfileStore = null;
  document.querySelector("#profile-backup-file").value = "";
  document.querySelector("#import-profiles").disabled = true;
  setProfileLibraryMessage("");
  updateProfileLibrarySummary();
  document.querySelector("#profile-library-dialog").showModal();
  document.querySelector("#export-profiles").focus();
}

function closeProfileLibraryDialog() {
  document.querySelector("#profile-library-dialog").close();
}

function exportProfileBackup() {
  const counts = profileCounts();
  if (counts.batters + counts.pitchers === 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([serializeProfileBackup(profileStore)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `oddball-player-profiles-${today}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  setProfileLibraryMessage(`Downloaded ${profileCountText()} as an ODDBALL backup.`);
}

async function readProfileBackupFile() {
  pendingImportedProfileStore = null;
  const input = document.querySelector("#profile-backup-file");
  const importButton = document.querySelector("#import-profiles");
  importButton.disabled = true;
  const [file] = input.files;
  if (!file) {
    setProfileLibraryMessage("");
    return;
  }
  if (file.size > 5_000_000) {
    setProfileLibraryMessage("That file is too large to be an ODDBALL player-profile backup.", "error");
    return;
  }

  try {
    const importedStore = parseProfileBackup(await file.text());
    if (input.files[0] !== file) return;
    pendingImportedProfileStore = importedStore;
    importButton.disabled = false;
    setProfileLibraryMessage(`Ready to import ${profileCountText(importedStore)} from ${file.name}.`);
  } catch (error) {
    setProfileLibraryMessage(error.message, "error");
  }
}

function importProfileBackup() {
  if (!pendingImportedProfileStore) return;
  const importMode = document.querySelector('input[name="profile-import-mode"]:checked').value;
  const existingCounts = profileCounts();
  const existingTotal = existingCounts.batters + existingCounts.pitchers;
  if (
    importMode === "replace"
    && existingTotal > 0
    && !window.confirm(`Replace the ${profileCountText()} currently saved in this browser?`)
  ) return;

  const previousStore = profileStore;
  profileStore = importMode === "merge"
    ? mergeProfileStores(profileStore, pendingImportedProfileStore)
    : pendingImportedProfileStore;
  if (!persistProfiles()) {
    profileStore = previousStore;
    setProfileLibraryMessage("This browser could not save the imported profiles. Your existing library was not changed.", "error");
    return;
  }

  for (const role of ["batter", "pitcher"]) {
    refreshProfileSelect(role);
    setProfileStatus(role, "Player library updated; current play ratings were left unchanged.");
  }
  updateProfileLibrarySummary();
  const resultText = profileCountText();
  pendingImportedProfileStore = null;
  document.querySelector("#profile-backup-file").value = "";
  document.querySelector("#import-profiles").disabled = true;
  setProfileLibraryMessage(`${importMode === "merge" ? "Merged" : "Restored"} successfully. The library now contains ${resultText}.`);
}

function deleteAllProfiles() {
  const counts = profileCounts();
  const total = counts.batters + counts.pitchers;
  if (total === 0) return;
  if (!window.confirm(`Delete all saved players (${profileCountText()}) from this browser? This cannot be undone unless you have a backup.`)) return;

  const previousStore = profileStore;
  profileStore = createEmptyProfileStore();
  if (!persistProfiles()) {
    profileStore = previousStore;
    setProfileLibraryMessage("This browser could not delete the player library. No saved profiles were changed.", "error");
    return;
  }

  for (const role of ["batter", "pitcher"]) {
    refreshProfileSelect(role);
    setProfileStatus(role, "Saved players deleted; current play ratings were left unchanged.");
  }
  updateProfileLibrarySummary();
  setProfileLibraryMessage("Deleted all saved player profiles. Current play ratings were left unchanged.");
}

function refreshProfileSelect(role, selectedId = "") {
  const select = document.querySelector(`#${role}-profile-select`);
  select.replaceChildren(new Option("Enter ratings manually", ""));
  for (const profile of listPlayerProfiles(profileStore, role)) {
    select.add(new Option(profile.name, profile.id));
  }
  select.value = selectedId;
  document.querySelector(`#remove-${role}-profile`).disabled = !select.value;
  document.querySelector(`#save-${role}-profile`).textContent = select.value ? "Update profile" : "Save new profile";
  updateParticipantSummary(role);
  updateProfileLibrarySummary();
}

function batterProfileValues() {
  return {
    bt: numberValue("bt"),
    obt: numberValue("obt"),
    hand: document.querySelector("#batter-hand").value,
    powerTrait: document.querySelector("#hitter-power-trait").value,
    contactPlus: document.querySelector("#hitter-contact-plus").checked,
    speedPlus: document.querySelector("#hitter-speed-plus").checked,
    freeSwinger: document.querySelector("#hitter-free-swinger").checked,
  };
}

function pitcherProfileValues() {
  return {
    pitchDieSides: numberValue("pitch-die"),
    hand: document.querySelector("#pitcher-hand").value,
    role: document.querySelector("#pitcher-role").value,
    controlTrait: document.querySelector("#pitcher-control-trait").value,
    kPlus: document.querySelector("#pitcher-k-plus").checked,
    groundballPlus: document.querySelector("#pitcher-groundball-plus").checked,
  };
}

function applyBatterProfile(profile) {
  document.querySelector("#batter-name").value = profile.name;
  document.querySelector("#bt").value = String(profile.ratings.bt);
  document.querySelector("#obt").value = String(profile.ratings.obt);
  document.querySelector("#batter-hand").value = profile.ratings.hand;
  document.querySelector("#hitter-power-trait").value = profile.ratings.powerTrait;
  document.querySelector("#hitter-contact-plus").checked = Boolean(profile.ratings.contactPlus);
  document.querySelector("#hitter-speed-plus").checked = Boolean(profile.ratings.speedPlus);
  document.querySelector("#hitter-free-swinger").checked = Boolean(profile.ratings.freeSwinger);
  updateParticipantSummary("batter");
}

function applyPitcherProfile(profile) {
  document.querySelector("#pitcher-name").value = profile.name;
  document.querySelector("#pitch-die").value = String(profile.ratings.pitchDieSides);
  document.querySelector("#pitcher-hand").value = profile.ratings.hand;
  document.querySelector("#pitcher-role").value = profile.ratings.role;
  document.querySelector("#pitcher-control-trait").value = profile.ratings.controlTrait;
  document.querySelector("#pitcher-k-plus").checked = Boolean(profile.ratings.kPlus);
  document.querySelector("#pitcher-groundball-plus").checked = Boolean(profile.ratings.groundballPlus);
  updateEffectivePitchDie();
  updateParticipantSummary("pitcher");
}

function updateParticipantSummary(role) {
  if (role === "batter") {
    const ratings = batterProfileValues();
    const traits = [];
    if (ratings.hand !== "none") traits.push(`Bats ${ratings.hand === "switch" ? "S" : ratings.hand[0].toUpperCase()}`);
    if (ratings.powerTrait !== "none") {
      traits.push({
        "p-plus": "P+",
        "p-plus-plus": "P++",
        "p-minus": "P−",
        "p-minus-minus": "P−−",
      }[ratings.powerTrait]);
    }
    if (ratings.contactPlus) traits.push("C+");
    if (ratings.speedPlus) traits.push("S+");
    if (ratings.freeSwinger) traits.push("C−");
    document.querySelector("#batter-rating-summary").textContent = `BT ${ratings.bt} · OBT ${ratings.obt}`;
    document.querySelector("#batter-trait-summary").textContent = traits.length ? traits.join(" · ") : "No optional traits";
    return;
  }

  const ratings = pitcherProfileValues();
  const traits = [];
  if (ratings.hand !== "none") traits.push(`Throws ${ratings.hand[0].toUpperCase()}`);
  if (ratings.controlTrait === "cn-plus") traits.push("CN+");
  if (ratings.controlTrait === "cn-minus") traits.push("CN−");
  if (ratings.kPlus) traits.push("K+");
  if (ratings.groundballPlus) traits.push("GB+");
  const roleLabel = ratings.role === "reliever" ? "Reliever" : "Starter";
  document.querySelector("#pitcher-rating-summary").textContent = `Pitch Die ${formatPitchDie(ratings.pitchDieSides)} · ${roleLabel}`;
  document.querySelector("#pitcher-trait-summary").textContent = traits.length ? traits.join(" · ") : "No optional traits";
}

function captureProfileDraft(role) {
  return {
    selectedId: document.querySelector(`#${role}-profile-select`).value,
    status: document.querySelector(`#${role}-profile-status`).textContent,
    profile: {
      name: document.querySelector(`#${role}-name`).value,
      ratings: role === "batter" ? batterProfileValues() : pitcherProfileValues(),
    },
  };
}

function restoreProfileDraft(role, draft) {
  document.querySelector(`#${role}-profile-select`).value = draft.selectedId;
  if (role === "batter") applyBatterProfile(draft.profile);
  else applyPitcherProfile(draft.profile);
  document.querySelector(`#remove-${role}-profile`).disabled = !draft.selectedId;
  document.querySelector(`#save-${role}-profile`).textContent = draft.selectedId ? "Update profile" : "Save new profile";
  document.querySelector(`#${role}-profile-status`).textContent = draft.status;
  updateParticipantSummary(role);
}

function applyDefaultProfile(role) {
  if (role === "batter") {
    applyBatterProfile({
      name: "",
      ratings: {
        bt: 31,
        obt: 42,
        hand: "none",
        powerTrait: "none",
        contactPlus: false,
        speedPlus: false,
        freeSwinger: false,
      },
    });
    return;
  }
  applyPitcherProfile({
    name: "",
    ratings: {
      pitchDieSides: 8,
      hand: "none",
      role: "starter",
      controlTrait: "none",
      kPlus: false,
      groundballPlus: false,
    },
  });
}

function loadSelectedProfile(role) {
  const select = document.querySelector(`#${role}-profile-select`);
  document.querySelector(`#remove-${role}-profile`).disabled = !select.value;
  document.querySelector(`#save-${role}-profile`).textContent = select.value ? "Update profile" : "Save new profile";
  if (!select.value) {
    setProfileStatus(role, "Current values are not linked to a saved profile.");
    updateParticipantSummary(role);
    return;
  }
  const profile = getPlayerProfile(profileStore, select.value);
  if (!profile) {
    setProfileStatus(role, "That saved profile is no longer available.");
    refreshProfileSelect(role);
    return;
  }
  if (role === "batter") applyBatterProfile(profile);
  else applyPitcherProfile(profile);
  setProfileStatus(role, `${profile.name} loaded.`);
  updateParticipantSummary(role);
}

function startNewProfile(role) {
  const select = document.querySelector(`#${role}-profile-select`);
  select.value = "";
  applyDefaultProfile(role);
  document.querySelector(`#remove-${role}-profile`).disabled = true;
  document.querySelector(`#save-${role}-profile`).textContent = "Save new profile";
  setProfileStatus(role, `Fill in the ${role}'s ratings. Add a name only if you want to save this player.`);
}

function openProfileDialog(role, { createNew = false } = {}) {
  const dialog = document.querySelector(`#${role}-profile-dialog`);
  profileDialogState.set(role, { snapshot: captureProfileDraft(role), committed: false });
  if (createNew) startNewProfile(role);
  else {
    const selected = document.querySelector(`#${role}-profile-select`).value;
    setProfileStatus(role, selected
      ? `Edit the selected ${role}, then update the saved profile or use adjusted values for this play.`
      : `Adjust the ${role}'s ratings for this play. Add a name if you want to save a profile.`);
  }
  dialog.showModal();
  document.querySelector(`#${role}-dialog-description`).textContent = document.querySelector(`#${role}-profile-status`).textContent;
  document.querySelector(`#${role}-name`).focus();
}

function closeProfileDialog(role, { apply = false } = {}) {
  const dialog = document.querySelector(`#${role}-profile-dialog`);
  const state = profileDialogState.get(role);
  if (apply && state) {
    const ratings = role === "batter" ? batterProfileValues() : pitcherProfileValues();
    if (role === "batter" && (
      !Number.isInteger(ratings.bt)
      || ratings.bt < 5
      || ratings.bt > 99
      || !Number.isInteger(ratings.obt)
      || ratings.obt < 6
      || ratings.obt > 99
      || ratings.obt < ratings.bt
    )) {
      setProfileStatus(role, "Enter valid BT and OBT values before using this batter.");
      document.querySelector("#bt").focus();
      return;
    }
    const before = JSON.stringify(state.snapshot.profile);
    const after = JSON.stringify(captureProfileDraft(role).profile);
    if (state.snapshot.selectedId && before !== after) {
      document.querySelector(`#${role}-profile-select`).value = "";
      document.querySelector(`#remove-${role}-profile`).disabled = true;
      document.querySelector(`#save-${role}-profile`).textContent = "Save new profile";
      setProfileStatus(role, "Using adjusted ratings for this play; the saved profile was not changed.");
    } else {
      setProfileStatus(role, "Current ratings applied to this play.");
    }
    state.committed = true;
    updateEffectivePitchDie();
    updateParticipantSummary(role);
  }
  dialog.close(apply ? "apply" : "cancel");
}

function saveCurrentProfile(role) {
  const name = document.querySelector(`#${role}-name`).value;
  const select = document.querySelector(`#${role}-profile-select`);
  const ratings = role === "batter" ? batterProfileValues() : pitcherProfileValues();

  if (role === "batter" && (
    !Number.isInteger(ratings.bt)
    || ratings.bt < 5
    || ratings.bt > 99
    || !Number.isInteger(ratings.obt)
    || ratings.obt < 6
    || ratings.obt > 99
    || ratings.obt < ratings.bt
  )) {
    setProfileStatus(role, "Enter valid BT and OBT values before saving.");
    document.querySelector("#bt").focus();
    return false;
  }

  try {
    const saved = savePlayerProfile(profileStore, {
      id: select.value || undefined,
      name,
      role,
      ratings,
    });
    profileStore = saved.store;
    if (!persistProfiles()) {
      setProfileStatus(role, "This browser could not save the profile.");
      return false;
    }
    refreshProfileSelect(role, saved.profileId);
    setProfileStatus(role, `${String(name).trim()} saved in this browser.`);
    updateParticipantSummary(role);
    return true;
  } catch (error) {
    setProfileStatus(role, error.message);
    document.querySelector(`#${role}-name`).focus();
    return false;
  }
}

function removeSelectedProfile(role) {
  const select = document.querySelector(`#${role}-profile-select`);
  const profile = getPlayerProfile(profileStore, select.value);
  if (!profile) return false;
  if (!window.confirm(`Remove the saved profile for ${profile.name}?`)) return false;
  profileStore = removePlayerProfile(profileStore, profile.id);
  if (!persistProfiles()) {
    setProfileStatus(role, "This browser could not update saved profiles.");
    return false;
  }
  refreshProfileSelect(role);
  setProfileStatus(role, `${profile.name} removed from this browser.`);
  updateParticipantSummary(role);
  return true;
}

function clearFieldErrors() {
  for (const field of document.querySelectorAll("[aria-invalid='true']")) {
    field.removeAttribute("aria-invalid");
  }
  validationSummary.hidden = true;
  validationSummary.replaceChildren();
}

function showErrors(errors) {
  validationSummary.hidden = false;
  const heading = document.createElement("strong");
  heading.textContent = "Check the play setup:";
  const list = document.createElement("ul");
  for (const error of errors) {
    const item = document.createElement("li");
    item.textContent = error.message;
    list.append(item);
    document.querySelector(`#${error.field}`)?.setAttribute("aria-invalid", "true");
  }
  validationSummary.append(heading, list);
  const firstField = errors[0].field;
  const batterFields = ["bt", "obt", "batter-hand", "hitter-power-trait", "hitter-contact-plus", "hitter-speed-plus", "hitter-free-swinger"];
  const pitcherFields = ["pitch-die", "pitcher-hand", "pitcher-role", "pitcher-control-trait", "pitcher-k-plus", "pitcher-groundball-plus"];
  if (batterFields.includes(firstField)) openProfileDialog("batter");
  if (pitcherFields.includes(firstField)) openProfileDialog("pitcher");
  document.querySelector(`#${firstField}`)?.focus();
}

function setManualDiceAvailability() {
  const manual = selectedDiceMode() === "manual";
  const playType = selectedPlayType();
  const stealing = playType === "steal";
  const bunting = playType === "bunt";
  const hitAndRun = playType === "hit-and-run";
  const atBat = playType === "at-bat";
  const battingPlay = atBat || hitAndRun;
  for (const id of ["swing-roll", "pitch-roll"]) {
    document.querySelector(`#${id}`).disabled = !manual || (!atBat && !hitAndRun);
  }
  for (const id of ["hit-roll", "oddity-roll-one", "oddity-roll-two"]) {
    document.querySelector(`#${id}`).disabled = !manual || !atBat;
  }
  document.querySelector("#steal-roll").disabled = !manual || !stealing;
  document.querySelector("#bunt-roll").disabled = !manual || !bunting;
  document.querySelector("#hit-run-steal-roll").disabled = !manual || !hitAndRun;
  document.querySelector("#at-bat-rolls").hidden = !manual || !battingPlay;
  document.querySelector("#at-bat-secondary-rolls").hidden = !manual || !atBat;
  document.querySelector("#oddity-manual-rolls").hidden = !manual || !atBat;
  document.querySelector("#steal-manual-roll").hidden = !manual || !stealing;
  document.querySelector("#bunt-manual-rolls").hidden = !manual || !bunting;
  document.querySelector("#hit-run-manual-roll").hidden = !manual || !hitAndRun;
  document.querySelector("#dice-help").textContent = manual
    ? "Enter physical or known rolls."
    : `ODDBALL will roll the ${stealing ? "stolen-base d8" : bunting ? "Bunt Table d6 and any required DEF die" : hitAndRun ? "Swing Score, Pitch Die, and stolen-base d8" : "dice required by the resulting rule path"}.`;
}

function updatePlayType() {
  const playType = selectedPlayType();
  const stealing = playType === "steal";
  const bunting = playType === "bunt";
  const hitAndRun = playType === "hit-and-run";
  const atBat = playType === "at-bat";
  const battingPlay = atBat || hitAndRun;
  document.querySelector("#at-bat-participants").hidden = !battingPlay;
  document.querySelector("#oddities-option").hidden = !atBat;
  document.querySelector("#steal-controls").hidden = !stealing;
  document.querySelector("#bunt-controls").hidden = !bunting;
  document.querySelector("#hit-run-controls").hidden = !hitAndRun;
  document.querySelector("#resolve-mode-label").textContent = stealing
    ? "Stolen-base attempt"
    : bunting ? "Bunt attempt" : hitAndRun ? "Hit & Run attempt" : "Common at-bat slice";
  setManualDiceAvailability();
}

function updateContextDiamond() {
  for (const base of ["first", "second", "third"]) {
    const occupied = form.elements.namedItem(`runner-${base}`).checked;
    document.querySelector(`.mini-base.${base}`).classList.toggle("occupied", occupied);
  }
}

function updateEffectivePitchDie() {
  const baseSides = numberValue("pitch-die");
  const pitchDie = calculateEffectivePitchDie({
    pitchDieSides: baseSides,
    batterHand: document.querySelector("#batter-hand").value,
    pitcherHand: document.querySelector("#pitcher-hand").value,
    pitcherRole: document.querySelector("#pitcher-role").value,
    pitcherGroundballPlus: document.querySelector("#pitcher-groundball-plus").checked,
    bases: {
      first: form.elements.namedItem("runner-first").checked,
      second: form.elements.namedItem("runner-second").checked,
      third: form.elements.namedItem("runner-third").checked,
    },
  });
  document.querySelector("#effective-pitch-die").textContent = pitchDie.sides === baseSides
    ? `Current play: ${formatPitchDie(baseSides)}`
    : `Current play: ${formatPitchDie(baseSides)} → ${formatPitchDie(pitchDie.sides)}`;
  document.querySelector("#pitch-operator").textContent = pitchDie.sides < 0 ? "−" : "+";
  document.querySelector("#pitch-roll").max = String(Math.abs(pitchDie.sides));
}

function collectInput() {
  if (selectedPlayType() === "bunt") {
    const automatic = selectedDiceMode() === "automatic";
    const contactPlus = document.querySelector("#bunt-contact-plus").checked;
    const freeSwinger = document.querySelector("#bunt-free-swinger").checked;
    const speedPlus = document.querySelector("#bunt-speed-plus").checked;
    if (automatic) {
      const buntRoll = rollDie(6);
      document.querySelector("#bunt-roll").value = String(buntRoll);
    }
    return {
      playType: "bunt",
      input: {
        outs: Number(form.elements.namedItem("outs").value),
        bases: {
          first: form.elements.namedItem("runner-first").checked,
          second: form.elements.namedItem("runner-second").checked,
          third: form.elements.namedItem("runner-third").checked,
        },
        buntContactPlus: contactPlus,
        buntFreeSwinger: freeSwinger,
        buntSpeedPlus: speedPlus,
        buntRoll: numberValue("bunt-roll"),
        defRoll: numberValue("def-roll"),
        defModifier: numberValue("def-modifier"),
      },
    };
  }

  if (selectedPlayType() === "steal") {
    if (selectedDiceMode() === "automatic") {
      document.querySelector("#steal-roll").value = String(rollDie(8));
    }
    return {
      playType: "steal",
      input: {
        outs: Number(form.elements.namedItem("outs").value),
        bases: {
          first: form.elements.namedItem("runner-first").checked,
          second: form.elements.namedItem("runner-second").checked,
          third: form.elements.namedItem("runner-third").checked,
        },
        stealTarget: document.querySelector("#steal-target").value,
        stealRunnerTrait: document.querySelector("#steal-runner-trait").value,
        catcherStealModifier: numberValue("catcher-steal-modifier"),
        stealRoll: numberValue("steal-roll"),
      },
    };
  }

  if (selectedPlayType() === "hit-and-run") {
    const pitchDieSides = numberValue("pitch-die");
    const bases = {
      first: form.elements.namedItem("runner-first").checked,
      second: form.elements.namedItem("runner-second").checked,
      third: form.elements.namedItem("runner-third").checked,
    };
    const targetInput = {
      bt: numberValue("bt"),
      obt: numberValue("obt"),
      bases,
      batterHand: document.querySelector("#batter-hand").value,
      hitterFreeSwinger: document.querySelector("#hitter-free-swinger").checked,
      pitcherHand: document.querySelector("#pitcher-hand").value,
      pitcherRole: document.querySelector("#pitcher-role").value,
      pitcherKPlus: document.querySelector("#pitcher-k-plus").checked,
      pitcherGroundballPlus: document.querySelector("#pitcher-groundball-plus").checked,
      pitcherControlTrait: document.querySelector("#pitcher-control-trait").value,
    };
    if (selectedDiceMode() === "automatic") {
      const effectivePitchDie = calculateEffectivePitchDie({ ...targetInput, pitchDieSides });
      document.querySelector("#swing-roll").value = String(rollDie(100));
      document.querySelector("#pitch-roll").value = String(rollDie(Math.abs(effectivePitchDie.sides)));
      document.querySelector("#hit-run-steal-roll").value = String(rollDie(8));
    }
    return {
      playType: "hit-and-run",
      input: {
        outs: Number(form.elements.namedItem("outs").value),
        bases,
        bt: targetInput.bt,
        obt: targetInput.obt,
        pitchDieSides,
        swingRoll: numberValue("swing-roll"),
        pitchRoll: numberValue("pitch-roll"),
        hitterContactPlus: document.querySelector("#hitter-contact-plus").checked,
        hitterFreeSwinger: targetInput.hitterFreeSwinger,
        batterHand: targetInput.batterHand,
        pitcherHand: targetInput.pitcherHand,
        pitcherRole: targetInput.pitcherRole,
        pitcherKPlus: targetInput.pitcherKPlus,
        pitcherGroundballPlus: targetInput.pitcherGroundballPlus,
        pitcherControlTrait: targetInput.pitcherControlTrait,
        hitRunRunnerTrait: document.querySelector("#hit-run-runner-trait").value,
        catcherStealModifier: numberValue("hit-run-catcher-modifier"),
        hitRunStealRoll: numberValue("hit-run-steal-roll"),
        defRoll: numberValue("def-roll"),
        defModifier: numberValue("def-modifier"),
        odditiesEnabled: document.querySelector("#oddities-enabled").checked,
      },
    };
  }

  const pitchDieSides = numberValue("pitch-die");
  const automatic = selectedDiceMode() === "automatic";
  const bases = {
    first: form.elements.namedItem("runner-first").checked,
    second: form.elements.namedItem("runner-second").checked,
    third: form.elements.namedItem("runner-third").checked,
  };
  const targetInput = {
    bt: numberValue("bt"),
    obt: numberValue("obt"),
    bases,
    batterHand: document.querySelector("#batter-hand").value,
    hitterFreeSwinger: document.querySelector("#hitter-free-swinger").checked,
    pitcherHand: document.querySelector("#pitcher-hand").value,
    pitcherRole: document.querySelector("#pitcher-role").value,
    pitcherKPlus: document.querySelector("#pitcher-k-plus").checked,
    pitcherGroundballPlus: document.querySelector("#pitcher-groundball-plus").checked,
    pitcherControlTrait: document.querySelector("#pitcher-control-trait").value,
  };

  if (automatic) {
    const swingRoll = rollDie(100);
    const effectivePitchDie = calculateEffectivePitchDie({ ...targetInput, pitchDieSides });
    const pitchRoll = rollDie(Math.abs(effectivePitchDie.sides));
    document.querySelector("#swing-roll").value = String(swingRoll);
    document.querySelector("#pitch-roll").value = String(pitchRoll);
    const targets = calculateEffectiveTargets(targetInput);
    const classification = classifyMss(
      swingRoll + (effectivePitchDie.sides < 0 ? -pitchRoll : pitchRoll),
      targets.bt,
      targets.obt,
      document.querySelector("#oddities-enabled").checked,
    );
    if (classification === "ordinary-hit" || classification === "critical-hit") {
      const hitRoll = rollDie(20);
      document.querySelector("#hit-roll").value = String(hitRoll);
    }
    if (classification === "oddity") {
      document.querySelector("#oddity-roll-one").value = String(rollDie(10));
      document.querySelector("#oddity-roll-two").value = String(rollDie(10));
    }
  }

  return {
    playType: "at-bat",
    input: {
    outs: Number(form.elements.namedItem("outs").value),
    bases,
    bt: targetInput.bt,
    obt: targetInput.obt,
    pitchDieSides,
    swingRoll: numberValue("swing-roll"),
    pitchRoll: numberValue("pitch-roll"),
    hitRoll: numberValue("hit-roll"),
    hitterPowerTrait: document.querySelector("#hitter-power-trait").value,
    hitterContactPlus: document.querySelector("#hitter-contact-plus").checked,
    hitterSpeedPlus: document.querySelector("#hitter-speed-plus").checked,
    hitterFreeSwinger: targetInput.hitterFreeSwinger,
    batterHand: targetInput.batterHand,
    pitcherHand: targetInput.pitcherHand,
    pitcherRole: targetInput.pitcherRole,
    pitcherKPlus: targetInput.pitcherKPlus,
    pitcherGroundballPlus: targetInput.pitcherGroundballPlus,
    pitcherControlTrait: targetInput.pitcherControlTrait,
    defRoll: numberValue("def-roll"),
    defModifier: numberValue("def-modifier"),
    odditiesEnabled: document.querySelector("#oddities-enabled").checked,
    oddityRollOne: numberValue("oddity-roll-one"),
    oddityRollTwo: numberValue("oddity-roll-two"),
    },
  };
}

function renderBases(bases) {
  for (const base of ["first", "second", "third"]) {
    document.querySelector(`#result-base-${base}`).textContent = bases[base] ? "Occupied" : "Empty";
  }
}

function renderCalculations(calculations = []) {
  calculationTrail.replaceChildren();
  calculations.forEach((calculation, index) => {
    const item = document.createElement("li");
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const text = document.createElement("p");
    text.textContent = calculation;
    item.append(number, text);
    calculationTrail.append(item);
  });
}

function resolveCollected(collected) {
  return collected.playType === "steal"
    ? resolveStealAttempt(collected.input)
    : collected.playType === "bunt"
      ? resolveBuntAttempt(collected.input)
      : collected.playType === "hit-and-run"
        ? resolveHitAndRunAttempt(collected.input)
        : resolveAtBat(collected.input);
}

function collectedNeedsDefense(collected) {
  if (collected.playType === "bunt") {
    const input = collected.input;
    const modifiedRoll = input.buntRoll + (input.buntContactPlus ? 1 : 0) - (input.buntFreeSwinger ? 1 : 0);
    return input.buntSpeedPlus && modifiedRoll >= 6;
  }
  if (collected.playType === "hit-and-run") {
    const input = collected.input;
    const effectivePitchDie = calculateEffectivePitchDie(input);
    const targets = calculateEffectiveTargets(input);
    const hitRunBonus = input.hitterFreeSwinger ? 0 : input.hitterContactPlus ? 10 : 5;
    const mss = input.swingRoll + (effectivePitchDie.sides < 0 ? -input.pitchRoll : input.pitchRoll);
    return classifyMss(
      mss,
      targets.bt + hitRunBonus,
      targets.obt + hitRunBonus,
      input.odditiesEnabled,
    ) === "possible-error";
  }
  if (collected.playType !== "at-bat") return false;
  const input = collected.input;
  const effectivePitchDie = calculateEffectivePitchDie(input);
  const targets = calculateEffectiveTargets(input);
  const mss = input.swingRoll + (effectivePitchDie.sides < 0 ? -input.pitchRoll : input.pitchRoll);
  const classification = classifyMss(mss, targets.bt, targets.obt, input.odditiesEnabled);
  return classification === "possible-error"
    || requiresHitDefense(input.hitRoll, {
      powerTrait: input.hitterPowerTrait,
      contactPlus: input.hitterContactPlus,
      speedPlus: input.hitterSpeedPlus,
    }, classification);
}

function beginDefenseCheckpoint(collected) {
  pendingDefense = collected;
  const preview = resolveCollected({
    ...collected,
    input: { ...collected.input, defRoll: 6, defModifier: 0 },
  });
  document.querySelector("#mss-output").textContent = preview.mss == null ? "—" : String(preview.mss);
  const automatic = selectedDiceMode() === "automatic";
  const defRoll = document.querySelector("#def-roll");
  defRoll.disabled = automatic;
  defRoll.value = automatic ? String(rollDie(12)) : "";
  document.querySelector("#def-modifier").value = "0";
  document.querySelector("#defense-fielder").textContent = preview.play?.fielder
    ? preview.play.fielder.replace(/^./, (letter) => letter.toUpperCase())
    : preview.play?.position ?? "Fielder";
  document.querySelector("#defense-instruction").textContent = automatic
    ? `ODDBALL rolled DEF ${defRoll.value}. Confirm the fielder's trait, then finish the ruling.`
    : "Enter the physical DEF d12 and choose the fielder's trait, then finish the ruling.";
  document.querySelector("#defense-checkpoint").hidden = false;
  resultPanel.dataset.state = "ready";
  resultCall.textContent = "DEF";
  resultTitle.textContent = `Defense check: ${document.querySelector("#defense-fielder").textContent}`;
  resultDetail.textContent = "No defensive trait is assumed. None is selected unless you choose D+ or D−.";
  const defIndex = preview.calculations?.findIndex((line) => line.startsWith("DEF ")) ?? -1;
  renderCalculations(defIndex >= 0 ? preview.calculations.slice(0, defIndex) : preview.calculations);
  for (const id of ["outs-delta", "runs-delta", "result-base-first", "result-base-second", "result-base-third"]) {
    document.querySelector(`#${id}`).textContent = "—";
  }
  applyContextButton.disabled = true;
  editInputsButton.disabled = true;
  overrideButton.disabled = true;
  resultPanel.focus();
}

function renderResult(result) {
  latestResult = result;
  document.querySelector("#defense-checkpoint").hidden = true;
  overrideForm.hidden = true;
  overrideDisplay.hidden = true;
  confirmMessage.hidden = true;
  document.querySelector("#mss-output").textContent = result.mss == null ? "—" : String(result.mss);

  if (result.outcomeCode === "invalid-input") {
    showErrors(result.errors);
    return;
  }

  resultPanel.dataset.state = result.supported ? "resolved" : "limited";
  resultCall.textContent = result.supported ? result.score : "—";
  resultTitle.textContent = result.summary;
  resultDetail.textContent = result.detail;
  renderCalculations(result.calculations);

  document.querySelector("#result-source").textContent = result.supported
    ? result.sourceRefs.join(" · ")
    : "Outside the first supported rule path";

  if (result.supported) {
    document.querySelector("#outs-delta").textContent = `${result.stateDelta.outsBefore} → ${result.stateDelta.outsAfter}`;
    document.querySelector("#runs-delta").textContent = String(result.stateDelta.runsScored);
    renderBases(result.stateDelta.bases);
    applyContextButton.disabled = false;
    editInputsButton.disabled = false;
    overrideButton.disabled = false;
  } else {
    document.querySelector("#outs-delta").textContent = "—";
    document.querySelector("#runs-delta").textContent = "—";
    renderBases({ first: false, second: false, third: false });
    applyContextButton.disabled = true;
    editInputsButton.disabled = false;
    overrideButton.disabled = true;
  }

  resultPanel.focus();
}

function applySuggestedContext() {
  if (!latestResult?.supported) return;
  const { bases, outsAfter } = latestResult.stateDelta;
  const outsValue = outsAfter === 3 ? 0 : outsAfter;
  const outsControl = form.querySelector(`input[name='outs'][value='${outsValue}']`);
  if (outsControl) outsControl.checked = true;
  form.elements.namedItem("runner-first").checked = bases.first;
  form.elements.namedItem("runner-second").checked = bases.second;
  form.elements.namedItem("runner-third").checked = bases.third;
  updateContextDiamond();
  updateEffectivePitchDie();
  confirmMessage.textContent = outsAfter === 3
    ? "Inning-ending context confirmed; bases cleared."
    : "Suggested outs and baserunners confirmed.";
  confirmMessage.hidden = false;
  applyContextButton.disabled = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFieldErrors();
  pendingDefense = null;
  document.querySelector("#defense-checkpoint").hidden = true;
  const collected = collectInput();
  if (collectedNeedsDefense(collected)) {
    beginDefenseCheckpoint(collected);
    return;
  }
  renderResult(resolveCollected(collected));
});

document.querySelector("#finish-defense").addEventListener("click", () => {
  if (!pendingDefense) return;
  const defRoll = numberValue("def-roll");
  const defRollInput = document.querySelector("#def-roll");
  if (!Number.isInteger(defRoll) || defRoll < 1 || defRoll > 12) {
    defRollInput.setAttribute("aria-invalid", "true");
    document.querySelector("#defense-instruction").textContent = "Enter a DEF d12 roll from 1 through 12 before finishing the ruling.";
    defRollInput.focus();
    return;
  }

  defRollInput.removeAttribute("aria-invalid");
  const collected = {
    ...pendingDefense,
    input: {
      ...pendingDefense.input,
      defRoll,
      defModifier: numberValue("def-modifier"),
    },
  };
  pendingDefense = null;
  renderResult(resolveCollected(collected));
});

form.addEventListener("change", (event) => {
  if (event.target.name === "play-type") updatePlayType();
  if (event.target.name === "dice-mode") setManualDiceAvailability();
  if (event.target.name?.startsWith("runner-")) {
    updateContextDiamond();
    updateEffectivePitchDie();
  }
  if (["pitch-die", "batter-hand", "pitcher-hand", "pitcher-role", "pitcher-groundball-plus"].includes(event.target.id)) {
    updateEffectivePitchDie();
  }
});

editInputsButton.addEventListener("click", () => {
  if (["at-bat", "hit-and-run"].includes(selectedPlayType())) {
    openProfileDialog("batter");
    return;
  }
  const focusTarget = selectedPlayType() === "steal"
    ? "#steal-target"
    : "#bunt-roll";
  document.querySelector(focusTarget).focus();
});

overrideButton.addEventListener("click", () => {
  overrideForm.hidden = false;
  document.querySelector("#override-outcome").focus();
});

saveOverrideButton.addEventListener("click", () => {
  const outcome = document.querySelector("#override-outcome").value.trim();
  const note = document.querySelector("#override-note").value.trim();
  if (!outcome) return;
  document.querySelector("#override-summary").textContent = outcome;
  document.querySelector("#override-note-display").textContent = note || "No note supplied.";
  overrideDisplay.hidden = false;
  overrideForm.hidden = true;
});

applyContextButton.addEventListener("click", applySuggestedContext);

document.querySelector("#manage-profile-library").addEventListener("click", openProfileLibraryDialog);
document.querySelector("#close-profile-library").addEventListener("click", closeProfileLibraryDialog);
document.querySelector("#export-profiles").addEventListener("click", exportProfileBackup);
document.querySelector("#profile-backup-file").addEventListener("change", readProfileBackupFile);
document.querySelector("#import-profiles").addEventListener("click", importProfileBackup);
document.querySelector("#delete-all-profiles").addEventListener("click", deleteAllProfiles);
document.querySelector("#profile-library-dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  closeProfileLibraryDialog();
});
document.querySelector("#open-deadball-credits").addEventListener("click", () => openDeadballCredits());
document.querySelector("#close-deadball-credits").addEventListener("click", () => document.querySelector("#deadball-credits-dialog").close());
document.querySelector("#owns-deadball").addEventListener("change", (event) => {
  document.querySelector("#continue-to-companion").disabled = !event.target.checked;
});
document.querySelector("#continue-to-companion").addEventListener("click", finishDeadballCredits);
document.querySelector("#deadball-credits-dialog").addEventListener("cancel", (event) => {
  if (deadballCreditsMode !== "about") {
    event.preventDefault();
    return;
  }
  document.querySelector("#deadball-credits-dialog").close();
});
document.querySelector("#deadball-credits-dialog").addEventListener("close", () => {
  if (deadballCreditsMode !== "welcome") return;
  window.setTimeout(() => {
    const dialog = document.querySelector("#deadball-credits-dialog");
    if (!dialog.open) dialog.showModal();
    document.querySelector("#owns-deadball").focus();
  }, 0);
});

for (const role of ["batter", "pitcher"]) {
  const dialog = document.querySelector(`#${role}-profile-dialog`);
  document.querySelector(`#${role}-profile-select`).addEventListener("change", () => loadSelectedProfile(role));
  document.querySelector(`#new-${role}-profile`).addEventListener("click", () => openProfileDialog(role, { createNew: true }));
  document.querySelector(`#edit-${role}-profile`).addEventListener("click", () => openProfileDialog(role));
  document.querySelector(`#use-${role}-profile`).addEventListener("click", () => closeProfileDialog(role, { apply: true }));
  for (const id of [`close-${role}-profile`, `cancel-${role}-profile`]) {
    document.querySelector(`#${id}`).addEventListener("click", () => closeProfileDialog(role));
  }
  document.querySelector(`#save-${role}-profile`).addEventListener("click", () => {
    if (!saveCurrentProfile(role)) return;
    const state = profileDialogState.get(role);
    if (state) state.committed = true;
    updateEffectivePitchDie();
    updateParticipantSummary(role);
    dialog.close("saved");
  });
  document.querySelector(`#remove-${role}-profile`).addEventListener("click", () => {
    if (!removeSelectedProfile(role)) return;
    const state = profileDialogState.get(role);
    if (state) state.committed = true;
    dialog.close("removed");
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeProfileDialog(role);
  });
  dialog.addEventListener("close", () => {
    const state = profileDialogState.get(role);
    if (state && !state.committed) restoreProfileDraft(role, state.snapshot);
    profileDialogState.delete(role);
  });
  refreshProfileSelect(role);
}

for (const sides of PITCH_DIE_SIDES) {
  if (!document.querySelector(`#pitch-die option[value='${sides}']`)) {
    console.warn(`Missing Pitch Die option: ${formatPitchDie(sides)}`);
  }
}

setManualDiceAvailability();
updatePlayType();
updateContextDiamond();
updateEffectivePitchDie();
let ownershipAcknowledged = false;
try {
  ownershipAcknowledged = readDeadballAcknowledgment(window.localStorage);
} catch {
  ownershipAcknowledged = false;
}
if (!ownershipAcknowledged) openDeadballCredits({ firstEntry: true });

