export const PITCH_DIE_SIDES = Object.freeze([-20, -12, -8, -4, 4, 8, 12, 20]);

export function formatPitchDie(pitchDie) {
  return pitchDie < 0 ? `-d${Math.abs(pitchDie)}` : `d${pitchDie}`;
}

function pitchDieMaximum(pitchDie) {
  return Math.abs(pitchDie);
}

function signedPitchResult(pitchDie, roll) {
  return pitchDie < 0 ? -roll : roll;
}

function describeMssCalculation(input, mss) {
  const pitchDie = input.effectivePitchDieSides ?? input.pitchDieSides;
  const operator = pitchDie < 0 ? "-" : "+";
  return `Swing ${input.swingRoll} ${operator} Pitch Die ${input.pitchRoll} = MSS ${mss}`;
}

const POWER_TRAITS = Object.freeze({
  none: { label: "No power trait", modifier: 0 },
  "p-plus": { label: "P+", modifier: 1 },
  "p-plus-plus": { label: "P++", modifier: 2 },
  "p-minus": { label: "P-", modifier: -1 },
  "p-minus-minus": { label: "P--", modifier: -2 },
});

const CONTROL_TRAITS = Object.freeze(["none", "cn-plus", "cn-minus"]);
const BATTER_HANDS = Object.freeze(["none", "right", "left", "switch"]);
const PITCHER_HANDS = Object.freeze(["none", "right", "left"]);
const PITCHER_ROLES = Object.freeze(["starter", "reliever"]);

const POSSIBLE_ERROR_PLAYS = Object.freeze({
  0: { position: "SS", fielder: "shortstop", number: 6, kind: "groundball", score: "6-3" },
  1: { position: "SS", fielder: "shortstop", number: 6, kind: "groundball", score: "6-3" },
  2: { position: "2B", fielder: "second baseman", number: 4, kind: "groundball", score: "4-3" },
  3: { position: "1B", fielder: "first baseman", number: 3, kind: "groundball", score: "G-3" },
  4: { position: "2B", fielder: "second baseman", number: 4, kind: "groundball", score: "4-3" },
  5: { position: "3B", fielder: "third baseman", number: 5, kind: "groundball", score: "5-3" },
  6: { position: "SS", fielder: "shortstop", number: 6, kind: "groundball", score: "6-3" },
  7: { position: "LF", fielder: "left fielder", number: 7, kind: "popup", score: "F-7" },
  8: { position: "CF", fielder: "center fielder", number: 8, kind: "popup", score: "F-8" },
  9: { position: "RF", fielder: "right fielder", number: 9, kind: "popup", score: "F-9" },
});

const OUT_PLAYS = Object.freeze({
  0: { position: "K", fielder: "pitcher", kind: "strikeout", score: "K" },
  1: { position: "K", fielder: "pitcher", kind: "strikeout", score: "K" },
  2: { position: "K", fielder: "pitcher", kind: "strikeout", score: "K" },
  3: { position: "1B", fielder: "first baseman", kind: "groundball", score: "G-3" },
  4: { position: "2B", fielder: "second baseman", kind: "groundball", score: "4-3" },
  5: { position: "3B", fielder: "third baseman", kind: "groundball", score: "5-3" },
  6: { position: "SS", fielder: "shortstop", kind: "groundball", score: "6-3" },
  7: { position: "LF", fielder: "left fielder", kind: "popup", score: "F-7" },
  8: { position: "CF", fielder: "center fielder", kind: "popup", score: "F-8" },
  9: { position: "RF", fielder: "right fielder", kind: "popup", score: "F-9" },
});

const ODDITIES = Object.freeze({
  2: "Fan interference",
  3: "Animal on field",
  4: "Rain delay",
  5: "Fielder appears injured",
  6: "Pitcher appears injured",
  7: "TOOTBLAN",
  8: "Pick-off",
  9: "Call blown at first",
  10: "Call blown at home plate",
  11: "Hit by pitch",
  12: "Wild pitch",
  13: "Pitcher distracted",
  14: "Dropped third strike",
  15: "Passed ball",
  16: "Current batter appears injured",
  17: "Previous batter appears injured",
  18: "Pitcher error",
  19: "Balk",
  20: "Catcher interference",
});

function isIntegerBetween(value, minimum, maximum) {
  return Number.isInteger(value) && value >= minimum && value <= maximum;
}

function copyBases(bases = {}) {
  return {
    first: Boolean(bases.first),
    second: Boolean(bases.second),
    third: Boolean(bases.third),
  };
}

function validateCoreInput(input) {
  const errors = [];
  const effectivePitchDie = calculateEffectivePitchDie(input);

  if (!isIntegerBetween(input.outs, 0, 2)) {
    errors.push({ field: "outs", message: "Choose 0, 1, or 2 outs." });
  }

  if (!isIntegerBetween(input.bt, 5, 99)) {
    errors.push({ field: "bt", message: "BT must be a whole number from 5 through 99." });
  }

  if (!isIntegerBetween(input.obt, 6, 99)) {
    errors.push({ field: "obt", message: "OBT must be a whole number from 6 through 99." });
  } else if (Number.isInteger(input.bt) && input.obt < input.bt) {
    errors.push({ field: "obt", message: "OBT cannot be lower than BT." });
  }

  if (!PITCH_DIE_SIDES.includes(input.pitchDieSides)) {
    errors.push({ field: "pitch-die", message: "Choose a supported Pitch Die." });
  }

  if (!isIntegerBetween(input.swingRoll, 1, 100)) {
    errors.push({ field: "swing-roll", message: "The Swing Score must be from 1 through 100." });
  }

  if (
    PITCH_DIE_SIDES.includes(input.pitchDieSides) &&
    !isIntegerBetween(input.pitchRoll, 1, pitchDieMaximum(effectivePitchDie.sides))
  ) {
    const die = formatPitchDie(effectivePitchDie.sides);
    errors.push({
      field: "pitch-roll",
      message: `The Pitch Die result for ${die} must be from 1 through ${pitchDieMaximum(effectivePitchDie.sides)}.`,
    });
  }

  if (!CONTROL_TRAITS.includes(input.pitcherControlTrait ?? "none")) {
    errors.push({ field: "pitcher-control-trait", message: "Choose no control trait, CN+, or CN-." });
  }

  if (!BATTER_HANDS.includes(input.batterHand ?? "none")) {
    errors.push({ field: "batter-hand", message: "Choose right, left, switch, or not set for the batter." });
  }

  if (!PITCHER_HANDS.includes(input.pitcherHand ?? "none")) {
    errors.push({ field: "pitcher-hand", message: "Choose right, left, or not set for the pitcher." });
  }

  if (!PITCHER_ROLES.includes(input.pitcherRole ?? "starter")) {
    errors.push({ field: "pitcher-role", message: "Choose starter or reliever." });
  }

  return errors;
}

export function calculateEffectivePitchDie(input) {
  const baseSides = input.pitchDieSides;
  const bases = copyBases(input.bases);
  const basesLoaded = bases.first && bases.second && bases.third;
  if (!PITCH_DIE_SIDES.includes(baseSides)) return { sides: baseSides, calculations: [] };

  const calculations = [];
  let sides = baseSides;
  const batterHand = input.batterHand ?? "none";
  const pitcherHand = input.pitcherHand ?? "none";
  const pitcherRole = input.pitcherRole ?? "starter";
  const sameHanded = (batterHand === "right" && pitcherHand === "right")
    || (batterHand === "left" && pitcherHand === "left");

  if (sameHanded) {
    const matchupMaximum = pitcherRole === "reliever" ? 20 : 12;
    const currentIndex = PITCH_DIE_SIDES.indexOf(sides);
    const maximumIndex = PITCH_DIE_SIDES.indexOf(matchupMaximum);
    const adjustedIndex = currentIndex < maximumIndex ? currentIndex + 1 : currentIndex;
    const adjustedSides = PITCH_DIE_SIDES[adjustedIndex];
    const matchup = `${batterHand === "right" ? "R/R" : "L/L"} ${pitcherRole}`;
    calculations.push(adjustedSides === sides
      ? `Same-handed matchup (${matchup}) -> Pitch Die remains ${formatPitchDie(sides)} (${formatPitchDie(matchupMaximum)} matchup maximum)`
      : `Same-handed matchup (${matchup}) -> Pitch Die ${formatPitchDie(sides)} increases one level to ${formatPitchDie(adjustedSides)}`);
    sides = adjustedSides;
  }

  if (input.pitcherGroundballPlus && basesLoaded) {
    const currentIndex = PITCH_DIE_SIDES.indexOf(sides);
    const adjustedSides = PITCH_DIE_SIDES[Math.min(currentIndex + 1, PITCH_DIE_SIDES.length - 1)];
    calculations.push(adjustedSides === sides
      ? `GB+ with bases loaded -> Pitch Die remains ${formatPitchDie(sides)} (d20 maximum)`
      : `GB+ with bases loaded -> Pitch Die ${formatPitchDie(sides)} increases one level to ${formatPitchDie(adjustedSides)}`);
    sides = adjustedSides;
  }

  return { sides, calculations };
}

export function calculateEffectiveTargets(input) {
  const bases = copyBases(input.bases);
  const freeSwingerActive = Boolean(input.hitterFreeSwinger) && (bases.second || bases.third);
  const btModifier = (freeSwingerActive ? -3 : 0) + (input.pitcherKPlus ? -1 : 0);
  const controlTrait = input.pitcherControlTrait ?? "none";
  const obtModifier = (freeSwingerActive ? -3 : 0) + (controlTrait === "cn-plus" ? -2 : controlTrait === "cn-minus" ? 3 : 0);
  const calculations = [];

  if (freeSwingerActive) calculations.push("C- active with a runner on second or third -> BT -3 and OBT -3");
  if (input.pitcherKPlus) calculations.push("K+ -> opposing batter BT -1; OBT unchanged");
  if (controlTrait === "cn-plus") calculations.push("CN+ -> opposing batter OBT -2; BT unchanged");
  if (controlTrait === "cn-minus") calculations.push("CN- -> opposing batter OBT +3; BT unchanged");
  if (calculations.length > 0) {
    calculations.push(`Effective targets: BT ${input.bt} ${btModifier >= 0 ? "+" : "-"} ${Math.abs(btModifier)} = ${input.bt + btModifier}; OBT ${input.obt} ${obtModifier >= 0 ? "+" : "-"} ${Math.abs(obtModifier)} = ${input.obt + obtModifier}`);
  }

  return { bt: input.bt + btModifier, obt: input.obt + obtModifier, calculations };
}

export function resolveStealAttempt(input) {
  const errors = [];
  const bases = copyBases(input.bases);
  const target = input.stealTarget;
  const runnerTrait = input.stealRunnerTrait ?? "none";
  const catcherModifier = input.catcherStealModifier ?? 0;

  if (!isIntegerBetween(input.outs, 0, 2)) {
    errors.push({ field: "outs", message: "Choose 0, 1, or 2 outs." });
  }
  if (!["second", "third"].includes(target)) {
    errors.push({ field: "steal-target", message: "Choose a steal of second or third." });
  }
  if (!["none", "s-plus", "s-minus"].includes(runnerTrait)) {
    errors.push({ field: "steal-runner-trait", message: "Choose no running trait, S+, or S-." });
  }
  if (![-1, 0, 1].includes(catcherModifier)) {
    errors.push({ field: "catcher-steal-modifier", message: "Choose D+, no catcher trait, or D-." });
  }
  if (!isIntegerBetween(input.stealRoll, 1, 8)) {
    errors.push({ field: "steal-roll", message: "The stolen-base d8 must be from 1 through 8." });
  }

  const origin = target === "third" ? "second" : "first";
  if (["second", "third"].includes(target) && !bases[origin]) {
    errors.push({ field: `runner-${origin}`, message: `A runner must occupy ${origin} base to steal ${target}.` });
  }
  if (["second", "third"].includes(target) && bases[target]) {
    errors.push({ field: `runner-${target}`, message: `${target[0].toUpperCase()}${target.slice(1)} base must be empty for this steal attempt.` });
  }
  if (errors.length > 0) return { supported: false, outcomeCode: "invalid-input", errors };

  const targetModifier = target === "third" ? -1 : 0;
  const runnerModifier = runnerTrait === "s-plus" ? 1 : runnerTrait === "s-minus" ? -2 : 0;
  const modifiedRoll = input.stealRoll + targetModifier + runnerModifier + catcherModifier;
  const calculations = [`Base Stealing d8 ${input.stealRoll}`];
  if (targetModifier) calculations.push("Attempting third -> steal roll -1");
  if (runnerModifier) calculations.push(`${runnerTrait === "s-plus" ? "S+ Speedy Runner" : "S- Slow Runner"} -> steal roll ${runnerModifier > 0 ? "+1" : "-2"}`);
  if (catcherModifier) calculations.push(`${catcherModifier < 0 ? "D+" : "D-"} catcher -> opposing steal roll ${catcherModifier > 0 ? "+1" : "-1"}`);
  calculations.push(`Modified steal roll = ${modifiedRoll}`);

  const safe = modifiedRoll >= 4;
  const nextBases = copyBases(bases);
  nextBases[origin] = false;
  let outsAfter = input.outs;
  let detail;
  let runnerMoves;

  if (safe) {
    nextBases[target] = true;
    detail = `Runner on ${origin} reaches ${target}.`;
    runnerMoves = [`Runner on ${origin} to ${target}`];
    calculations.push("Modified roll 4 or higher -> runner safe");
  } else {
    outsAfter += 1;
    detail = `Runner on ${origin} is out attempting to steal ${target}.`;
    runnerMoves = [`Runner on ${origin} out attempting to steal ${target}`];
    calculations.push("Modified roll 3 or lower -> runner caught stealing");
    if (outsAfter === 3) {
      nextBases.first = false;
      nextBases.second = false;
      nextBases.third = false;
      detail += " Inning over; bases clear.";
    }
  }

  return {
    supported: true,
    outcomeCode: safe ? "stolen-base" : "caught-stealing",
    classification: "steal-attempt",
    score: safe ? "SB" : "CS",
    summary: safe ? `Stolen base: ${target}.` : `Caught stealing ${target}.`,
    detail,
    modifiedStealRoll: modifiedRoll,
    calculations,
    stateDelta: {
      outsBefore: input.outs,
      outsAfter,
      outsAdded: safe ? 0 : 1,
      runsScored: 0,
      bases: nextBases,
      runnerMoves,
    },
    sourceRefs: ["Deadball 2E pp. 24, 31"],
  };
}

export function classifyMss(mss, bt, obt, odditiesEnabled = true) {
  if (odditiesEnabled && mss === 1) return "oddity";
  if (odditiesEnabled && mss === 99) return "oddity";
  if (mss <= 5) return "critical-hit";
  if (mss <= bt) return "ordinary-hit";
  if (mss <= obt) return "walk";
  if (mss <= obt + 5) return "possible-error";
  if (mss <= 69) return "productive-out";
  return "out";
}

function describeUnsupported(classification, mss, bt, obt) {
  const labels = {
    oddity: "an oddity",
    "critical-hit": "a critical hit",
    "ordinary-hit": "an ordinary hit without a Hit Table roll",
    "productive-out": "a productive-out result",
    out: "an out outside the possible-error range",
  };

  return {
    outcomeCode: "outside-first-slice",
    classification,
    supported: false,
    summary: `MSS ${mss} is ${labels[classification]}.`,
    detail: "This build resolves six play-state oddities plus Hit Table batting traits, hits, walks, possible errors, and outs. Oddities requiring broader game state remain outside the slice.",
    calculations: [
      `Swing Score + Pitch Die = MSS ${mss}`,
      `BT ${bt}; OBT ${obt}; walk range ${bt + 1}-${obt}; possible-error range ${obt + 1}-${obt + 5}`,
    ],
  };
}

function moveRunnersOnHit(bases, batterBases, runnerAdvance) {
  const nextBases = { first: false, second: false, third: false };
  const runnerMoves = [];
  let runsScored = 0;

  for (const [base, startingBase] of [["third", 3], ["second", 2], ["first", 1]]) {
    if (!bases[base]) continue;
    const destination = startingBase + runnerAdvance;
    if (destination > 3) {
      runsScored += 1;
      runnerMoves.push(`Runner on ${base} scores`);
    } else {
      const destinationName = destination === 2 ? "second" : "third";
      nextBases[destinationName] = true;
      runnerMoves.push(`Runner on ${base} to ${destinationName}`);
    }
  }

  if (batterBases > 3) {
    runsScored += 1;
    runnerMoves.push("Batter scores");
  } else {
    const batterDestination = batterBases === 1 ? "first" : batterBases === 2 ? "second" : "third";
    nextBases[batterDestination] = true;
    runnerMoves.push(`Batter to ${batterDestination}`);
  }

  return { bases: nextBases, runnerMoves, runsScored };
}

function hitTableResult(hitRoll) {
  if (hitRoll <= 2 || (hitRoll >= 7 && hitRoll <= 9)) {
    return { score: "1B", label: "Single", batterBases: 1, runnerAdvance: 1 };
  }
  if (hitRoll >= 3 && hitRoll <= 6) {
    const fielders = {
      3: { position: "1B", fielder: "first baseman", number: 3 },
      4: { position: "2B", fielder: "second baseman", number: 4 },
      5: { position: "3B", fielder: "third baseman", number: 5 },
      6: { position: "SS", fielder: "shortstop", number: 6 },
    };
    const play = fielders[hitRoll];
    return {
      defensive: true,
      label: `Single, DEF (${play.position})`,
      score: "1B",
      batterBases: 1,
      runnerAdvance: 1,
      play,
    };
  }
  if (hitRoll <= 14) {
    return { score: "1B", label: "Single", batterBases: 1, runnerAdvance: 2 };
  }
  if (hitRoll <= 17) {
    const fielders = {
      15: { position: "LF", fielder: "left fielder", number: 7 },
      16: { position: "CF", fielder: "center fielder", number: 8 },
      17: { position: "RF", fielder: "right fielder", number: 9 },
    };
    const play = fielders[hitRoll];
    return {
      defensive: true,
      label: `Double, DEF (${play.position})`,
      score: "2B",
      batterBases: 2,
      runnerAdvance: 2,
      play,
    };
  }
  if (hitRoll === 18) {
    return { score: "2B", label: "Double", batterBases: 2, runnerAdvance: 3 };
  }
  return { score: "HR", label: "Home run", batterBases: 4, runnerAdvance: 4 };
}

function traitAdjustedHitTableResult(hitRoll, traits = {}) {
  const powerTrait = POWER_TRAITS[traits.powerTrait ?? "none"];
  if (!powerTrait) return null;

  const adjustedRoll = hitRoll + powerTrait.modifier;
  const calculations = [];
  if (powerTrait.modifier !== 0) {
    calculations.push(
      `Hit Table d20 ${hitRoll} ${powerTrait.modifier > 0 ? "+" : "-"} ${Math.abs(powerTrait.modifier)} (${powerTrait.label}) = modified Hit Table ${adjustedRoll}`,
    );
  }

  if (traits.speedPlus && adjustedRoll === 2) {
    calculations.push(
      `${powerTrait.modifier === 0 ? `Hit Table d20 ${adjustedRoll}` : `Modified Hit Table ${adjustedRoll}`} with S+ -> triple; no DEF roll`,
    );
    return {
      tableResult: { score: "3B", label: "S+ triple", batterBases: 3, runnerAdvance: 3 },
      adjustedRoll,
      calculations,
      specialTrait: "s-plus",
    };
  }

  if ((traits.contactPlus || traits.speedPlus) && adjustedRoll === 1) {
    const labels = [traits.contactPlus ? "C+" : null, traits.speedPlus ? "S+" : null].filter(Boolean).join("/ ").replace("/ ", "/");
    calculations.push(
      `${powerTrait.modifier === 0 ? `Hit Table d20 ${adjustedRoll}` : `Modified Hit Table ${adjustedRoll}`} with ${labels} -> double; runners advance 2; no DEF roll`,
    );
    return {
      tableResult: { score: "2B", label: `${labels} double`, batterBases: 2, runnerAdvance: 2 },
      adjustedRoll,
      calculations,
      specialTrait: traits.speedPlus ? "s-plus" : "c-plus",
    };
  }

  if (traits.contactPlus && adjustedRoll === 2) {
    calculations.push(
      `${powerTrait.modifier === 0 ? `Hit Table d20 ${adjustedRoll}` : `Modified Hit Table ${adjustedRoll}`} with C+ -> double; runners advance 2; no DEF roll`,
    );
    return {
      tableResult: { score: "2B", label: "C+ double", batterBases: 2, runnerAdvance: 2 },
      adjustedRoll,
      calculations,
      specialTrait: "c-plus",
    };
  }

  const tableResult = hitTableResult(adjustedRoll);
  const calculation = powerTrait.modifier === 0
    ? `Hit Table d20 ${hitRoll} -> ${tableResult.label}`
    : `Modified Hit Table ${adjustedRoll} -> ${tableResult.label}`;
  calculations.push(calculation);
  return { tableResult, adjustedRoll, calculations };
}

function validateHitterTraits(input, mss) {
  const powerTrait = input.hitterPowerTrait ?? "none";
  if (POWER_TRAITS[powerTrait]) return null;
  return {
    supported: false,
    outcomeCode: "invalid-input",
    errors: [{ field: "hitter-power-trait", message: "Choose a supported P trait." }],
    mss,
  };
}

export function requiresHitDefense(hitRoll, traits = {}, classification = "ordinary-hit") {
  if (classification !== "ordinary-hit" || !isIntegerBetween(hitRoll, 1, 20)) return false;
  return Boolean(traitAdjustedHitTableResult(hitRoll, traits)?.tableResult.defensive);
}

function resolveDefensiveHit({ bases, calculations, input, mss, tableResult }) {
  const defenseErrors = [];
  if (!isIntegerBetween(input.defRoll, 1, 12)) {
    defenseErrors.push({ field: "def-roll", message: "The DEF roll must be from 1 through 12." });
  }
  if (![-1, 0, 1].includes(input.defModifier)) {
    defenseErrors.push({ field: "def-modifier", message: "Choose D-, no trait, or D+." });
  }
  if (defenseErrors.length > 0) {
    return { supported: false, outcomeCode: "invalid-input", errors: defenseErrors, mss };
  }

  const modifiedDef = input.defRoll + input.defModifier;
  calculations.push(
    `DEF ${input.defRoll} ${input.defModifier >= 0 ? "+" : "-"} ${Math.abs(input.defModifier)} = modified DEF ${modifiedDef}`,
  );

  if (modifiedDef <= 2) {
    const doubleWithError = tableResult.score === "2B";
    const errorState = doubleWithError
      ? moveRunnersOnHit(bases, tableResult.batterBases + 1, tableResult.runnerAdvance + 1)
      : advanceAllOnError(bases);
    calculations.push(doubleWithError
      ? "Modified DEF 0-2 -> error after double; batter reaches third and runners take one extra base"
      : "Modified DEF 0-2 -> error; batter safe and runners advance one base");
    return {
      supported: true,
      outcomeCode: doubleWithError ? "double-with-error" : "error",
      classification: "ordinary-hit",
      mss,
      hitRoll: input.hitRoll,
      modifiedDef,
      play: tableResult.play,
      score: `${doubleWithError ? "2B + " : ""}E-${tableResult.play.number}`,
      summary: doubleWithError
        ? `Double; error by ${tableResult.play.fielder}.`
        : `Error by ${tableResult.play.fielder}.`,
      detail: errorState.runnerMoves.join("; ") + ".",
      calculations,
      stateDelta: {
        outsBefore: input.outs,
        outsAfter: input.outs,
        outsAdded: 0,
        runsScored: errorState.runsScored,
        bases: errorState.bases,
        runnerMoves: errorState.runnerMoves,
      },
      sourceRefs: ["Deadball 2E pp. 24, 26, 28"],
    };
  }

  if (modifiedDef >= 12) {
    const outsAfter = input.outs + 1;
    const nextBases = outsAfter === 3
      ? { first: false, second: false, third: false }
      : copyBases(bases);
    const runnerMoves = Object.values(bases).some(Boolean) ? ["Existing runners hold"] : [];
    calculations.push("Modified DEF 12+ -> hit turned into an out");
    return {
      supported: true,
      outcomeCode: "defensive-out",
      classification: "ordinary-hit",
      mss,
      hitRoll: input.hitRoll,
      modifiedDef,
      play: tableResult.play,
      score: "OUT",
      summary: `Outstanding defensive play by ${tableResult.play.position}.`,
      detail: runnerMoves.length > 0 ? "Batter out. Existing runners hold." : "Batter out; no runners advance.",
      calculations,
      stateDelta: {
        outsBefore: input.outs,
        outsAfter,
        outsAdded: 1,
        runsScored: 0,
        bases: nextBases,
        runnerMoves,
      },
      sourceRefs: ["Deadball 2E pp. 24, 26, 28"],
    };
  }

  let score = tableResult.score;
  let label = tableResult.score === "2B" ? "Double" : "Single";
  let batterBases = tableResult.batterBases;
  let runnerAdvance = tableResult.runnerAdvance;

  if (modifiedDef >= 10 && tableResult.score === "2B") {
    score = "1B";
    label = "Single";
    batterBases = 1;
    runnerAdvance = 1;
    calculations.push("Modified DEF 10-11 -> double reduced one level to a single");
  } else if (modifiedDef >= 10) {
    calculations.push("Modified DEF 10-11 -> single remains a single; only 12+ turns it into an out");
  } else {
    calculations.push("Modified DEF 3-9 -> hit unchanged");
  }

  const movement = moveRunnersOnHit(bases, batterBases, runnerAdvance);
  return {
    supported: true,
    outcomeCode: score === "2B" ? "double" : "single",
    classification: "ordinary-hit",
    mss,
    hitRoll: input.hitRoll,
    modifiedDef,
    play: tableResult.play,
    score,
    summary: `${label} after DEF check.`,
    detail: movement.runnerMoves.join("; ") + ".",
    calculations,
    stateDelta: {
      outsBefore: input.outs,
      outsAfter: input.outs,
      outsAdded: 0,
      runsScored: movement.runsScored,
      bases: movement.bases,
      runnerMoves: movement.runnerMoves,
    },
    sourceRefs: ["Deadball 2E pp. 24, 26, 28"],
  };
}

function resolveOrdinaryHit({ bases, input, mss }) {
  if (!isIntegerBetween(input.hitRoll, 1, 20)) {
    return {
      supported: false,
      outcomeCode: "invalid-input",
      errors: [{ field: "hit-roll", message: "The Hit Table roll must be from 1 through 20." }],
      mss,
    };
  }

  const traitError = validateHitterTraits(input, mss);
  if (traitError) return traitError;

  const adjusted = traitAdjustedHitTableResult(input.hitRoll, {
    powerTrait: input.hitterPowerTrait,
    contactPlus: input.hitterContactPlus,
    speedPlus: input.hitterSpeedPlus,
  });
  const tableResult = adjusted.tableResult;
  const calculations = [
    describeMssCalculation(input, mss),
    ...(input.targetCalculations ?? []),
    `MSS 6 through BT ${input.bt} -> ordinary hit`,
    ...adjusted.calculations,
  ];

  if (tableResult.defensive) {
    return resolveDefensiveHit({ bases, calculations, input, mss, tableResult });
  }

  const movement = moveRunnersOnHit(
    bases,
    tableResult.batterBases,
    tableResult.runnerAdvance,
  );
  const advancementText = tableResult.score === "HR"
    ? "batter and all runners score"
    : `existing runners advance ${tableResult.runnerAdvance} ${tableResult.runnerAdvance === 1 ? "base" : "bases"}`;
  calculations.push(`${tableResult.label} -> ${advancementText}`);

  return {
    supported: true,
    outcomeCode: tableResult.score === "HR" ? "home-run" : tableResult.score === "3B" ? "triple" : tableResult.score === "2B" ? "double" : "single",
    classification: "ordinary-hit",
    mss,
    hitRoll: input.hitRoll,
    score: tableResult.score,
    summary: `${tableResult.label}.`,
    detail: movement.runnerMoves.join("; ") + ".",
    calculations,
    stateDelta: {
      outsBefore: input.outs,
      outsAfter: input.outs,
      outsAdded: 0,
      runsScored: movement.runsScored,
      bases: movement.bases,
      runnerMoves: movement.runnerMoves,
    },
    sourceRefs: ["Deadball 2E pp. 24, 26-28"],
  };
}

function resolveCriticalHit({ bases, input, mss }) {
  if (!isIntegerBetween(input.hitRoll, 1, 20)) {
    return {
      supported: false,
      outcomeCode: "invalid-input",
      errors: [{ field: "hit-roll", message: "The Hit Table roll must be from 1 through 20." }],
      mss,
    };
  }

  const traitError = validateHitterTraits(input, mss);
  if (traitError) return traitError;

  const adjusted = traitAdjustedHitTableResult(input.hitRoll, {
    powerTrait: input.hitterPowerTrait,
    contactPlus: input.hitterContactPlus,
    speedPlus: input.hitterSpeedPlus,
  });
  const tableResult = adjusted.tableResult;
  const isSpeedyInsideThePark = adjusted.specialTrait === "s-plus" && adjusted.adjustedRoll === 2;
  const upgraded = tableResult.score === "1B"
    ? { score: "2B", label: "Critical double", batterBases: 2 }
    : tableResult.score === "2B"
      ? { score: "3B", label: "Critical triple", batterBases: 3 }
      : {
          score: "HR",
          label: isSpeedyInsideThePark ? "Inside-the-park home run" : "Critical home run",
          batterBases: 4,
        };
  const runnerAdvance = Math.min(4, tableResult.runnerAdvance + 1);
  const movement = moveRunnersOnHit(bases, upgraded.batterBases, runnerAdvance);
  const calculations = [
    describeMssCalculation(input, mss),
    `MSS ${mss} (5 or less, except oddity 1) -> critical hit`,
    ...adjusted.calculations,
    `${tableResult.score} increases one level to ${upgraded.score}; existing runners take one extra base`,
  ];
  if (isSpeedyInsideThePark) {
    calculations.push("S+ modified Hit Table 2 on a critical hit -> inside-the-park home run");
  }
  if (tableResult.defensive) {
    calculations.push("Critical hit cannot be taken away by defense -> no DEF roll");
  }

  return {
    supported: true,
    outcomeCode: upgraded.score === "HR" ? "critical-home-run" : upgraded.score === "3B" ? "critical-triple" : "critical-double",
    classification: "critical-hit",
    mss,
    hitRoll: input.hitRoll,
    score: upgraded.score,
    summary: `${upgraded.label}.`,
    detail: movement.runnerMoves.join("; ") + ".",
    calculations,
    stateDelta: {
      outsBefore: input.outs,
      outsAfter: input.outs,
      outsAdded: 0,
      runsScored: movement.runsScored,
      bases: movement.bases,
      runnerMoves: movement.runnerMoves,
    },
    sourceRefs: ["Deadball 2E pp. 24, 27-28"],
  };
}

function resolveWalk({ bases, bt, input, mss }) {
  const nextBases = {
    first: true,
    second: bases.first || bases.second,
    third: (bases.first && bases.second) || bases.third,
  };
  const runnerMoves = ["Batter to first"];
  let runsScored = 0;

  if (bases.first) runnerMoves.push("Runner on first to second");
  if (bases.first && bases.second) runnerMoves.push("Runner on second to third");
  else if (bases.second) runnerMoves.push("Runner on second holds");

  if (bases.first && bases.second && bases.third) {
    runnerMoves.push("Runner on third scores");
    runsScored = 1;
  } else if (bases.third) {
    runnerMoves.push("Runner on third holds");
  }

  return {
    supported: true,
    outcomeCode: "walk",
    classification: "walk",
    mss,
    score: "BB",
    summary: "Walk.",
    detail: runnerMoves.join("; ") + ".",
    calculations: [
      describeMssCalculation(input, mss),
      ...(input.targetCalculations ?? []),
      `BT ${bt} + 1 through OBT ${input.obt} -> walk`,
      runsScored > 0
        ? "Bases loaded -> every runner is forced forward; runner on third scores"
        : "Existing runners advance only when forced by the batter taking first",
    ],
    stateDelta: {
      outsBefore: input.outs,
      outsAfter: input.outs,
      outsAdded: 0,
      runsScored,
      bases: nextBases,
      runnerMoves,
    },
    sourceRefs: ["Deadball 2E pp. 24, 26-27"],
  };
}

function advanceAllOnError(bases) {
  const runnerMoves = ["Batter to first"];
  let runsScored = 0;

  if (bases.third) {
    runnerMoves.push("Runner on third scores");
    runsScored += 1;
  }
  if (bases.second) runnerMoves.push("Runner on second to third");
  if (bases.first) runnerMoves.push("Runner on first to second");

  return {
    outs: 0,
    runsScored,
    bases: {
      first: true,
      second: bases.first,
      third: bases.second,
    },
    runnerMoves,
  };
}

function advanceExistingRunnersOneBase(bases) {
  const runnerMoves = [];
  let runsScored = 0;

  if (bases.third) {
    runnerMoves.push("Runner on third scores");
    runsScored += 1;
  }
  if (bases.second) runnerMoves.push("Runner on second to third");
  if (bases.first) runnerMoves.push("Runner on first to second");

  return {
    runsScored,
    bases: {
      first: false,
      second: bases.first,
      third: bases.second,
    },
    runnerMoves,
  };
}

function awardBatterFirst(bases) {
  const nextBases = {
    first: true,
    second: bases.first || bases.second,
    third: (bases.first && bases.second) || bases.third,
  };
  const runnerMoves = ["Batter to first"];
  let runsScored = 0;

  if (bases.first) runnerMoves.push("Runner on first to second");
  if (bases.first && bases.second) runnerMoves.push("Runner on second to third");
  else if (bases.second) runnerMoves.push("Runner on second holds");
  if (bases.first && bases.second && bases.third) {
    runnerMoves.push("Runner on third scores");
    runsScored = 1;
  } else if (bases.third) {
    runnerMoves.push("Runner on third holds");
  }

  return { bases: nextBases, runnerMoves, runsScored };
}

function resolveOddity({ bases, input, mss }) {
  const errors = [];
  if (!isIntegerBetween(input.oddityRollOne, 1, 10)) {
    errors.push({ field: "oddity-roll-one", message: "The first Oddities die must be from 1 through 10." });
  }
  if (!isIntegerBetween(input.oddityRollTwo, 1, 10)) {
    errors.push({ field: "oddity-roll-two", message: "The second Oddities die must be from 1 through 10." });
  }
  if (errors.length > 0) return { supported: false, outcomeCode: "invalid-input", errors, mss };

  const oddityRoll = input.oddityRollOne + input.oddityRollTwo;
  const oddity = ODDITIES[oddityRoll];
  const calculations = [
    describeMssCalculation(input, mss),
    `Oddities enabled and MSS ${mss} -> roll 2d10`,
    `Oddities ${input.oddityRollOne} + ${input.oddityRollTwo} = ${oddityRoll} -> ${oddity}`,
  ];

  if (![11, 12, 15, 18, 19, 20].includes(oddityRoll)) {
    return {
      supported: false,
      outcomeCode: "oddity-needs-game-state",
      classification: "oddity",
      mss,
      oddityRoll,
      score: "—",
      summary: `${oddity}.`,
      detail: "This oddity requires game, roster, injury, strategy, or era state beyond the current Dice Companion slice. Apply it manually from the rulebook.",
      calculations,
      sourceRefs: ["Deadball 2E pp. 42-44"],
    };
  }

  if (oddityRoll === 11 || oddityRoll === 20) {
    const movement = awardBatterFirst(bases);
    const score = oddityRoll === 11 ? "HBP" : "CI";
    calculations.push(`${oddity} -> batter takes first; forced runners advance`);
    return {
      supported: true,
      outcomeCode: oddityRoll === 11 ? "hit-by-pitch" : "catcher-interference",
      classification: "oddity",
      mss,
      oddityRoll,
      score,
      summary: `${oddity}.`,
      detail: movement.runnerMoves.join("; ") + ".",
      calculations,
      stateDelta: {
        outsBefore: input.outs,
        outsAfter: input.outs,
        outsAdded: 0,
        runsScored: movement.runsScored,
        bases: movement.bases,
        runnerMoves: movement.runnerMoves,
      },
      sourceRefs: ["Deadball 2E pp. 42-43"],
    };
  }

  if (oddityRoll === 18) {
    const movement = advanceAllOnError(bases);
    calculations.push("Pitcher error -> batter reaches first and all runners advance one base");
    return {
      supported: true,
      outcomeCode: "pitcher-error",
      classification: "oddity",
      mss,
      oddityRoll,
      score: "E-1",
      summary: "Pitcher error.",
      detail: movement.runnerMoves.join("; ") + ".",
      calculations,
      stateDelta: {
        outsBefore: input.outs,
        outsAfter: input.outs,
        outsAdded: 0,
        runsScored: movement.runsScored,
        bases: movement.bases,
        runnerMoves: movement.runnerMoves,
      },
      sourceRefs: ["Deadball 2E pp. 42-43"],
    };
  }

  const movement = advanceExistingRunnersOneBase(bases);
  const score = oddityRoll === 12 ? "WP" : oddityRoll === 15 ? "PB" : "BK";
  calculations.push(`${oddity} -> all existing runners advance one base; at-bat continues`);
  return {
    supported: true,
    outcomeCode: oddityRoll === 12 ? "wild-pitch" : oddityRoll === 15 ? "passed-ball" : "balk",
    classification: "oddity",
    mss,
    oddityRoll,
    score,
    summary: `${oddity}.`,
    detail: `${movement.runnerMoves.length > 0 ? movement.runnerMoves.join("; ") + ". " : "No runners advance. "}At-bat continues; roll a new MSS.`,
    calculations,
    stateDelta: {
      outsBefore: input.outs,
      outsAfter: input.outs,
      outsAdded: 0,
      runsScored: movement.runsScored,
      bases: movement.bases,
      runnerMoves: movement.runnerMoves,
    },
    sourceRefs: ["Deadball 2E pp. 42-43"],
  };
}

function advanceForcedRunnersOnGroundball(bases, nextBases, runnerMoves) {
  if (!bases.first || !bases.second) return 0;

  let runsScored = 0;
  if (bases.third) {
    nextBases.third = false;
    runsScored = 1;
    runnerMoves.push("Runner on third scores on the force");
  }
  nextBases.second = false;
  nextBases.third = true;
  runnerMoves.push("Runner on second to third on the force");
  return runsScored;
}

function resolveSuccessfulOut({ bases, mss, outs, play }) {
  const nextBases = copyBases(bases);
  const runnerMoves = [];
  let requestedOuts = 1;
  let runsScored = 0;
  let outcomeCode = play.kind;
  let score = play.score;

  if (outs === 2) {
    const outsAfter = 3;
    return {
      outcomeCode,
      score,
      summary: `${play.kind === "strikeout" ? "Strikeout" : play.kind === "popup" ? `Pop-up to ${play.position}` : `Groundball to ${play.position}`} — third out.`,
      stateDelta: {
        outsBefore: outs,
        outsAfter,
        outsAdded: 1,
        runsScored: 0,
        bases: { first: false, second: false, third: false },
        runnerMoves: [],
      },
    };
  }

  if (play.kind === "strikeout") {
    if (Object.values(bases).some(Boolean)) runnerMoves.push("Runners hold");
  } else if (play.kind === "popup") {
    if (mss < 70) {
      if (bases.third) {
        nextBases.third = false;
        runsScored += 1;
        runnerMoves.push("Runner on third scores");
      }
      if (bases.second) {
        nextBases.second = false;
        nextBases.third = true;
        runnerMoves.push("Runner on second to third");
      }
      if (bases.first) runnerMoves.push("Runner on first holds");
    } else {
      if (bases.first) runnerMoves.push("Runner on first holds");
      if (bases.second) runnerMoves.push("Runner on second holds");
      if (bases.third) runnerMoves.push("Runner on third holds");
    }
  } else {
    const isRightSide = play.position === "1B" || play.position === "2B";

    if (play.automaticDoublePlay && bases.first) {
      requestedOuts = 2;
      outcomeCode = "double-play";
      score = "DP";
      runsScored += advanceForcedRunnersOnGroundball(bases, nextBases, runnerMoves);
      nextBases.first = false;
      runnerMoves.push("Runner on first and batter out on automatic double play");
    } else if (mss >= 100 && bases.first && bases.second && outs === 0) {
      requestedOuts = 3;
      outcomeCode = "triple-play";
      score = "TP";
      runnerMoves.push("Runners on first and second and batter out on triple play");
    } else if (mss >= 70 && bases.first) {
      requestedOuts = 2;
      outcomeCode = "double-play";
      score = "DP";
      runsScored += advanceForcedRunnersOnGroundball(bases, nextBases, runnerMoves);
      nextBases.first = false;
      runnerMoves.push("Runner on first and batter out on double play");
    } else if (mss >= 50 && bases.first) {
      outcomeCode = "fielders-choice";
      score = "FC";
      nextBases.first = true;
      runnerMoves.push("Runner on first out at second");
      runnerMoves.push("Batter safe at first on fielder's choice");

      runsScored += advanceForcedRunnersOnGroundball(bases, nextBases, runnerMoves);

      if (isRightSide) {
        if (bases.third && !bases.second) {
          nextBases.third = false;
          runsScored += 1;
          runnerMoves.push("Runner on third scores");
        }
      }
    } else if (mss < 50 && bases.first) {
      runsScored += advanceForcedRunnersOnGroundball(bases, nextBases, runnerMoves);
      nextBases.first = false;
      if (isRightSide && bases.third && !bases.second) {
        nextBases.third = false;
        runsScored += 1;
        runnerMoves.push("Runner on third scores");
      }
      nextBases.second = true;
      runnerMoves.push("Runner on first to second");
    } else if (isRightSide && mss < 70) {
      if (bases.third) {
        nextBases.third = false;
        runsScored += 1;
        runnerMoves.push("Runner on third scores");
      }
      if (bases.second) {
        nextBases.second = false;
        nextBases.third = true;
        runnerMoves.push("Runner on second to third");
      }
    }
  }

  const outsAdded = Math.min(requestedOuts, 3 - outs);
  const outsAfter = outs + outsAdded;
  if (outsAfter === 3) {
    if (runsScored > 0) {
      runsScored = 0;
      const scoringMove = runnerMoves.indexOf("Runner on third scores on the force");
      if (scoringMove >= 0) runnerMoves[scoringMove] = "Runner on third does not score; the inning ends on the double play";
      const advancingMove = runnerMoves.indexOf("Runner on second to third on the force");
      if (advancingMove >= 0) runnerMoves[advancingMove] = "Runner on second was advancing when the inning ended";
    }
    nextBases.first = false;
    nextBases.second = false;
    nextBases.third = false;
  }

  const playLabel = play.kind === "strikeout"
    ? "Strikeout"
    : play.kind === "popup"
      ? `Pop-up to ${play.position}`
      : `Groundball to ${play.position}`;
  const rulingLabel = outcomeCode === "fielders-choice"
    ? `Fielder's choice to ${play.position}`
    : outcomeCode === "double-play"
      ? `Double play to ${play.position}`
      : outcomeCode === "triple-play"
        ? `Triple play to ${play.position}`
        : playLabel;

  return {
    outcomeCode,
    score,
    summary: `${rulingLabel}.`,
    stateDelta: {
      outsBefore: outs,
      outsAfter,
      outsAdded,
      runsScored,
      bases: nextBases,
      runnerMoves,
    },
  };
}

function resolveOut({ bases, classification, input, mss }) {
  const lastDigit = Math.abs(mss) % 10;
  const play = input.pitcherKPlus && lastDigit === 3
    ? { position: "K", fielder: "pitcher", kind: "strikeout", score: "K" }
    : input.pitcherGroundballPlus && lastDigit === 2
      ? { position: "SS", fielder: "shortstop", kind: "groundball", score: "6-3", automaticDoublePlay: true }
      : OUT_PLAYS[lastDigit];
  const calculations = [
    describeMssCalculation(input, mss),
    ...(input.targetCalculations ?? []),
    `MSS ${mss} -> ${classification === "productive-out" ? "productive-out band" : "out band"}`,
    `Last digit ${lastDigit} -> ${play.kind === "strikeout" ? "strikeout" : play.kind === "popup" ? `pop-up to ${play.position}` : `groundball to ${play.position}`}`,
  ];
  if (input.pitcherKPlus && lastDigit === 3) {
    calculations.push("K+ changes Out Table result 3 from a groundball to a strikeout");
  }
  if (input.pitcherGroundballPlus && lastDigit === 2) {
    calculations.push("GB+ changes Out Table result 2 from a strikeout to a 6-3 groundball");
  }
  const resolved = resolveSuccessfulOut({ bases, mss, outs: input.outs, play });

  if (play.automaticDoublePlay && bases.first && resolved.outcomeCode === "double-play") {
    calculations.push("GB+ result 2 with a runner on first -> automatic double play");
  } else if (resolved.outcomeCode === "fielders-choice") {
    calculations.push("MSS 50-69 with a runner on first -> fielder's choice");
  } else if (resolved.outcomeCode === "double-play") {
    calculations.push("MSS 70+ on the infield with a runner on first -> double play");
  } else if (resolved.outcomeCode === "triple-play") {
    calculations.push("MSS 100+ on the infield with runners on first and second and no outs -> triple play");
  } else if (mss < 70 && resolved.stateDelta.runnerMoves.length > 0) {
    calculations.push("MSS below 70 -> apply eligible productive-out advancement");
  } else {
    calculations.push("No eligible runner advancement");
  }

  return {
    supported: true,
    classification,
    mss,
    play,
    ...resolved,
    detail: resolved.stateDelta.runnerMoves.length > 0
      ? resolved.stateDelta.runnerMoves.join("; ") + "."
      : "No runners advance.",
    calculations,
    sourceRefs: ["Deadball 2E pp. 24, 27, 29-30"],
  };
}

export function resolveAtBat(input) {
  const errors = validateCoreInput(input);
  if (errors.length > 0) {
    return { supported: false, outcomeCode: "invalid-input", errors };
  }

  const targets = calculateEffectiveTargets(input);
  const pitchDie = calculateEffectivePitchDie(input);
  const effectiveInput = {
    ...input,
    bt: targets.bt,
    obt: targets.obt,
    effectivePitchDieSides: pitchDie.sides,
    targetCalculations: [...pitchDie.calculations, ...targets.calculations],
  };
  const bases = copyBases(input.bases);
  const mss = input.swingRoll + signedPitchResult(pitchDie.sides, input.pitchRoll);
  const classification = classifyMss(mss, targets.bt, targets.obt, input.odditiesEnabled !== false);
  const finalizeResult = (result) => {
    if (!pitchDie.calculations.some((calculation) => calculation.startsWith("Same-handed matchup"))) return result;
    return {
      ...result,
      sourceRefs: [...(result.sourceRefs ?? []), "Deadball 2E p. 34"],
    };
  };

  if (classification === "oddity") {
    return finalizeResult(resolveOddity({ bases, input: effectiveInput, mss }));
  }

  if (classification === "ordinary-hit") {
    return finalizeResult(resolveOrdinaryHit({ bases, input: effectiveInput, mss }));
  }

  if (classification === "critical-hit") {
    return finalizeResult(resolveCriticalHit({ bases, input: effectiveInput, mss }));
  }

  if (classification === "walk") {
    return finalizeResult(resolveWalk({ bases, bt: targets.bt, input: effectiveInput, mss }));
  }

  if (classification === "productive-out" || classification === "out") {
    return finalizeResult(resolveOut({ bases, classification, input: effectiveInput, mss }));
  }

  if (classification !== "possible-error") {
    return finalizeResult({
      ...describeUnsupported(classification, mss, targets.bt, targets.obt),
      mss,
    });
  }

  const defenseErrors = [];
  if (!isIntegerBetween(input.defRoll, 1, 12)) {
    defenseErrors.push({ field: "def-roll", message: "The DEF roll must be from 1 through 12." });
  }
  if (![-1, 0, 1].includes(input.defModifier)) {
    defenseErrors.push({ field: "def-modifier", message: "Choose D-, no trait, or D+." });
  }
  if (defenseErrors.length > 0) {
    return { supported: false, outcomeCode: "invalid-input", errors: defenseErrors, mss };
  }

  const lastDigit = Math.abs(mss) % 10;
  const play = POSSIBLE_ERROR_PLAYS[lastDigit];
  const modifiedDef = input.defRoll + input.defModifier;
  const calculations = [
    describeMssCalculation(effectiveInput, mss),
    ...(effectiveInput.targetCalculations ?? []),
    `OBT ${effectiveInput.obt} -> possible-error range ${effectiveInput.obt + 1}-${effectiveInput.obt + 5}`,
    `Last digit ${lastDigit} -> ${play.kind === "popup" ? "pop-up" : "groundball"} to ${play.position}`,
    `DEF ${input.defRoll} ${input.defModifier >= 0 ? "+" : "-"} ${Math.abs(input.defModifier)} = modified DEF ${modifiedDef}`,
  ];

  if (modifiedDef <= 2) {
    const errorState = advanceAllOnError(bases);
    const outsAfter = input.outs;
    calculations.push("Modified DEF 2 or less -> error; batter safe and all runners advance one base");
    return finalizeResult({
      supported: true,
      outcomeCode: "error",
      classification,
      mss,
      play,
      modifiedDef,
      score: `E-${play.number}`,
      summary: `Error by ${play.fielder}.`,
      detail: errorState.runnerMoves.join("; ") + ".",
      calculations,
      stateDelta: {
        outsBefore: input.outs,
        outsAfter,
        outsAdded: 0,
        runsScored: errorState.runsScored,
        bases: errorState.bases,
        runnerMoves: errorState.runnerMoves,
      },
      sourceRefs: ["Deadball 2E pp. 24, 27-29"],
    });
  }

  const successfulOut = resolveSuccessfulOut({ bases, mss, outs: input.outs, play });
  calculations.push("Modified DEF 3 or higher -> make the out normally");
  return finalizeResult({
    supported: true,
    classification,
    mss,
    play,
    modifiedDef,
    ...successfulOut,
    detail: successfulOut.stateDelta.runnerMoves.join("; ") || "No runners advance.",
    calculations,
    sourceRefs: ["Deadball 2E pp. 24, 27-30"],
  });
}

export const resolvePossibleError = resolveAtBat;

