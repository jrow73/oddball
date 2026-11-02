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
    "ordinary-hit": "an ordinary hit",
    "productive-out": "a productive-out result",
    out: "an out outside the possible-error range",
  };

  return {
    outcomeCode: "outside-first-slice",
    classification,
    supported: false,
    summary: `MSS ${mss} is ${labels[classification]}.`,
    detail: `This build resolves walks from ${bt + 1} through ${obt} and possible errors from ${obt + 1} through ${obt + 5}.`,
    calculations: [
      `Swing Score + Pitch Die = MSS ${mss}`,
      `BT ${bt}; OBT ${obt}; walk range ${bt + 1}-${obt}; possible-error range ${obt + 1}-${obt + 5}`,
    ],
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
    summary: "Walk; batter advances to first.",
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
  let outsAdded = 1;
  let runsScored = 0;
  let batterSafe = false;

  if (play.kind === "popup") {
    if (outs < 2 && mss < 70) {
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
    if (bases.first) runnerMoves.push("Runner on first holds");
  } else if (bases.first && mss < 50) {
    nextBases.first = false;
    nextBases.second = true;
    runnerMoves.push("Runner on first to second");
  } else if (bases.first && mss <= 69) {
    nextBases.first = true;
    batterSafe = true;
    runnerMoves.push("Runner on first out at second");
    runnerMoves.push("Batter safe at first on fielder's choice");
  } else if (bases.first && mss >= 70) {
    nextBases.first = false;
    outsAdded = 2;
    runnerMoves.push("Runner on first and batter out on double play");
  }

  const isRightSide = play.position === "1B" || play.position === "2B";
  if (play.kind === "groundball" && isRightSide && outs < 2 && mss < 70) {
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

  const outsAfter = Math.min(3, outs + outsAdded);
  if (outsAfter === 3) {
    nextBases.first = false;
    nextBases.second = false;
    nextBases.third = false;
  }

  const playLabel = play.kind === "popup" ? `Pop-up to ${play.position}` : `Groundball to ${play.position}`;
  const movementLabel = runnerMoves.length > 0 ? runnerMoves.join("; ") : "runners hold";

  return {
    outcomeCode: batterSafe ? "fielders-choice" : play.kind,
    score: batterSafe ? "FC" : play.score,
    summary: `${playLabel}; ${movementLabel}.`,
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

export function resolveAtBat(input) {
  const errors = validateCoreInput(input);
  if (errors.length > 0) {
    return { supported: false, outcomeCode: "invalid-input", errors };
  }

  const bases = copyBases(input.bases);
  const mss = input.swingRoll + input.pitchRoll;
  const classification = classifyMss(mss, input.bt, input.obt);

  if (classification === "walk") {
    return resolveWalk({ bases, bt: input.bt, input, mss });
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
      summary: `Error by ${play.fielder}; batter safe at first.`,
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

