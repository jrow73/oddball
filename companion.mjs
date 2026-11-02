import { PITCH_DIE_SIDES, resolveAtBat } from "./rules/deadball/modern.mjs";

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

function clearFieldErrors() {
  for (const field of form.querySelectorAll("[aria-invalid='true']")) {
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
  document.querySelector(`#${errors[0].field}`)?.focus();
}

function setManualDiceAvailability() {
  const manual = selectedDiceMode() === "manual";
  for (const id of ["swing-roll", "pitch-roll", "def-roll"]) {
    document.querySelector(`#${id}`).disabled = !manual;
  }
  document.querySelector("#dice-help").textContent = manual
    ? "Enter physical or known rolls."
    : "ODDBALL will roll d100, the selected Pitch Die, and d12 DEF.";
}

function updateContextDiamond() {
  for (const base of ["first", "second", "third"]) {
    const occupied = form.elements.namedItem(`runner-${base}`).checked;
    document.querySelector(`.mini-base.${base}`).classList.toggle("occupied", occupied);
  }
}

function collectInput() {
  const pitchDieSides = numberValue("pitch-die");
  const automatic = selectedDiceMode() === "automatic";

  if (automatic) {
    document.querySelector("#swing-roll").value = String(rollDie(100));
    document.querySelector("#pitch-roll").value = String(rollDie(pitchDieSides));
    document.querySelector("#def-roll").value = String(rollDie(12));
  }

  return {
    outs: Number(form.elements.namedItem("outs").value),
    bases: {
      first: form.elements.namedItem("runner-first").checked,
      second: form.elements.namedItem("runner-second").checked,
      third: form.elements.namedItem("runner-third").checked,
    },
    bt: numberValue("bt"),
    obt: numberValue("obt"),
    pitchDieSides,
    swingRoll: numberValue("swing-roll"),
    pitchRoll: numberValue("pitch-roll"),
    defRoll: numberValue("def-roll"),
    defModifier: numberValue("def-modifier"),
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

  document.querySelector("#mss-output").textContent = String(result.mss);
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
  confirmMessage.textContent = outsAfter === 3
    ? "Inning-ending context confirmed; bases cleared."
    : "Suggested outs and baserunners confirmed.";
  confirmMessage.hidden = false;
  applyContextButton.disabled = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFieldErrors();
  renderResult(resolveAtBat(collectInput()));
});

form.addEventListener("change", (event) => {
  if (event.target.name === "dice-mode") setManualDiceAvailability();
  if (event.target.name?.startsWith("runner-")) updateContextDiamond();
});

editInputsButton.addEventListener("click", () => {
  document.querySelector("#bt").focus();
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

for (const sides of PITCH_DIE_SIDES) {
  if (!document.querySelector(`#pitch-die option[value='${sides}']`)) {
    console.warn(`Missing Pitch Die option: d${sides}`);
  }
}

setManualDiceAvailability();
updateContextDiamond();

