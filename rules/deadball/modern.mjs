export const PITCH_DIE_SIDES = Object.freeze([4, 6, 8, 10, 12, 20]);

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
    !isIntegerBetween(input.pitchRoll, 1, input.pitchDieSides)
  ) {
    errors.push({
      field: "pitch-roll",
      message: `The Pitch Die result must be from 1 through ${input.pitchDieSides}.`,
    });
  }

  return errors;
}

export function classifyMss(mss, bt, obt) {
  if (mss === 1) return "oddity";
  if (mss === 99) return "oddity";
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
    detail: "This build resolves neutral-trait critical hits, ordinary hits, walks, possible errors, productive outs, and ordinary outs. Oddities and batting bonus traits remain outside the slice.",
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
    const errorState = advanceAllOnError(bases);
    calculations.push("Modified DEF 0-2 -> error; batter safe and runners advance one base");
    return {
      supported: true,
      outcomeCode: "error",
      classification: "ordinary-hit",
      mss,
      hitRoll: input.hitRoll,
      modifiedDef,
      play: tableResult.play,
      score: `E-${tableResult.play.number}`,
      summary: `Error by ${tableResult.play.fielder}.`,
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
      sourceRefs: ["Deadball 2E pp. 26, 28"],
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
      sourceRefs: ["Deadball 2E pp. 26, 28"],
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
    sourceRefs: ["Deadball 2E pp. 26, 28"],
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

  const tableResult = hitTableResult(input.hitRoll);
  const calculations = [
    `Swing ${input.swingRoll} + Pitch Die ${input.pitchRoll} = MSS ${mss}`,
    `MSS 6 through BT ${input.bt} -> ordinary hit`,
    `Hit Table d20 ${input.hitRoll} -> ${tableResult.label}`,
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
    outcomeCode: tableResult.score === "HR" ? "home-run" : tableResult.score === "2B" ? "double" : "single",
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
    sourceRefs: ["Deadball 2E pp. 26-27"],
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

  const tableResult = hitTableResult(input.hitRoll);
  const upgraded = tableResult.score === "1B"
    ? { score: "2B", label: "Critical double", batterBases: 2 }
    : tableResult.score === "2B"
      ? { score: "3B", label: "Critical triple", batterBases: 3 }
      : { score: "HR", label: "Critical home run", batterBases: 4 };
  const runnerAdvance = Math.min(4, tableResult.runnerAdvance + 1);
  const movement = moveRunnersOnHit(bases, upgraded.batterBases, runnerAdvance);
  const calculations = [
    `Swing ${input.swingRoll} + Pitch Die ${input.pitchRoll} = MSS ${mss}`,
    `MSS 2-5 -> critical hit`,
    `Hit Table d20 ${input.hitRoll} -> ${tableResult.label}`,
    `${tableResult.score} increases one level to ${upgraded.score}; existing runners take one extra base`,
  ];
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
    sourceRefs: ["Deadball 2E pp. 27-28"],
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
      `Swing ${input.swingRoll} + Pitch Die ${input.pitchRoll} = MSS ${mss}`,
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
    sourceRefs: ["Deadball 2E pp. 26-27"],
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

    if (mss >= 100 && bases.first && bases.second && outs === 0) {
      requestedOuts = 3;
      outcomeCode = "triple-play";
      score = "TP";
      runnerMoves.push("Runners on first and second and batter out on triple play");
    } else if (mss >= 70 && bases.first) {
      requestedOuts = 2;
      outcomeCode = "double-play";
      score = "DP";
      nextBases.first = false;
      runnerMoves.push("Runner on first and batter out on double play");
    } else if (mss >= 50 && bases.first) {
      outcomeCode = "fielders-choice";
      score = "FC";
      nextBases.first = true;
      runnerMoves.push("Runner on first out at second");
      runnerMoves.push("Batter safe at first on fielder's choice");

      if (isRightSide) {
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
    } else if (mss < 50 && bases.first) {
      nextBases.first = false;
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
  const play = OUT_PLAYS[lastDigit];
  const calculations = [
    `Swing ${input.swingRoll} + Pitch Die ${input.pitchRoll} = MSS ${mss}`,
    `MSS ${mss} -> ${classification === "productive-out" ? "productive-out band" : "out band"}`,
    `Last digit ${lastDigit} -> ${play.kind === "strikeout" ? "strikeout" : play.kind === "popup" ? `pop-up to ${play.position}` : `groundball to ${play.position}`}`,
  ];
  const resolved = resolveSuccessfulOut({ bases, mss, outs: input.outs, play });

  if (resolved.outcomeCode === "fielders-choice") {
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
    sourceRefs: ["Deadball 2E pp. 27, 29-30"],
  };
}

export function resolveAtBat(input) {
  const errors = validateCoreInput(input);
  if (errors.length > 0) {
    return { supported: false, outcomeCode: "invalid-input", errors };
  }

  const bases = copyBases(input.bases);
  const mss = input.swingRoll + input.pitchRoll;
  const classification = classifyMss(mss, input.bt, input.obt);

  if (classification === "ordinary-hit") {
    return resolveOrdinaryHit({ bases, input, mss });
  }

  if (classification === "critical-hit") {
    return resolveCriticalHit({ bases, input, mss });
  }

  if (classification === "walk") {
    return resolveWalk({ bases, bt: input.bt, input, mss });
  }

  if (classification === "productive-out" || classification === "out") {
    return resolveOut({ bases, classification, input, mss });
  }

  if (classification !== "possible-error") {
    return {
      ...describeUnsupported(classification, mss, input.bt, input.obt),
      mss,
    };
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
    `Swing ${input.swingRoll} + Pitch Die ${input.pitchRoll} = MSS ${mss}`,
    `OBT ${input.obt} -> possible-error range ${input.obt + 1}-${input.obt + 5}`,
    `Last digit ${lastDigit} -> ${play.kind === "popup" ? "pop-up" : "groundball"} to ${play.position}`,
    `DEF ${input.defRoll} ${input.defModifier >= 0 ? "+" : "-"} ${Math.abs(input.defModifier)} = modified DEF ${modifiedDef}`,
  ];

  if (modifiedDef <= 2) {
    const errorState = advanceAllOnError(bases);
    const outsAfter = input.outs;
    calculations.push("Modified DEF 2 or less -> error; batter safe and all runners advance one base");
    return {
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
      sourceRefs: ["Deadball 2E pp. 27-29"],
    };
  }

  const successfulOut = resolveSuccessfulOut({ bases, mss, outs: input.outs, play });
  calculations.push("Modified DEF 3 or higher -> make the out normally");
  return {
    supported: true,
    classification,
    mss,
    play,
    modifiedDef,
    ...successfulOut,
    detail: successfulOut.stateDelta.runnerMoves.join("; ") || "No runners advance.",
    calculations,
    sourceRefs: ["Deadball 2E pp. 27-30"],
  };
}

export const resolvePossibleError = resolveAtBat;

