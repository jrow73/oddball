import { PITCH_DIE_SIDES, calculateEffectivePitchDie, calculateEffectiveTargets, classifyMss, formatPitchDie, requiresHitDefense, resolveAtBat, resolveBuntAttempt, resolveHitAndRunAttempt, resolveStealAttempt } from "./rules/deadball/modern.mjs?v=0.19";
import { createEmptyProfileStore, getPlayerProfile, listPlayerProfiles, readProfileStore, removePlayerProfile, savePlayerProfile, writeProfileStore } from "./profiles.mjs?v=0.1";

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

function selectedHitTableTraits() {
  return {
    powerTrait: document.querySelector("#hitter-power-trait").value,
    contactPlus: document.querySelector("#hitter-contact-plus").checked,
    speedPlus: document.querySelector("#hitter-speed-plus").checked,
  };
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
  for (const id of ["swing-roll", "pitch-roll"]) {
    document.querySelector(`#${id}`).disabled = !manual || (!atBat && !hitAndRun);
  }
  for (const id of ["hit-roll", "def-roll", "oddity-roll-one", "oddity-roll-two"]) {
    document.querySelector(`#${id}`).disabled = !manual || !atBat;
  }
  document.querySelector("#steal-roll").disabled = !manual || !stealing;
  document.querySelector("#bunt-roll").disabled = !manual || !bunting;
  document.querySelector("#bunt-def-roll").disabled = !manual || !bunting;
  document.querySelector("#hit-run-steal-roll").disabled = !manual || !hitAndRun;
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
  document.querySelector("#at-bat-rolls").hidden = !battingPlay;
  document.querySelector("#at-bat-secondary-rolls").hidden = hitAndRun;
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
      const modifiedRoll = buntRoll + (contactPlus ? 1 : 0) - (freeSwinger ? 1 : 0);
      if (speedPlus && modifiedRoll >= 6) {
        document.querySelector("#bunt-def-roll").value = String(rollDie(12));
      }
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
        defRoll: numberValue("bunt-def-roll"),
        defModifier: numberValue("bunt-def-modifier"),
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
      if (requiresHitDefense(hitRoll, selectedHitTableTraits(), classification)) {
        document.querySelector("#def-roll").value = String(rollDie(12));
      }
    }
    if (classification === "possible-error") {
      document.querySelector("#def-roll").value = String(rollDie(12));
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

function renderResult(result) {
  latestResult = result;
  overrideForm.hidden = true;
  overrideDisplay.hidden = true;
  confirmMessage.hidden = true;

  if (result.outcomeCode === "invalid-input") {
    showErrors(result.errors);
    return;
  }

  resultPanel.dataset.state = result.supported ? "resolved" : "limited";
  resultCall.textContent = result.supported ? result.score : "—";
  resultTitle.textContent = result.summary;
  resultDetail.textContent = result.detail;
  renderCalculations(result.calculations);

  document.querySelector("#mss-output").textContent = result.mss == null ? "—" : String(result.mss);
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
  const collected = collectInput();
  const result = collected.playType === "steal"
    ? resolveStealAttempt(collected.input)
    : collected.playType === "bunt"
      ? resolveBuntAttempt(collected.input)
      : collected.playType === "hit-and-run"
        ? resolveHitAndRunAttempt(collected.input)
        : resolveAtBat(collected.input);
  renderResult(result);
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

