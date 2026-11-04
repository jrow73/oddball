import test from "node:test";
import assert from "node:assert/strict";
import { calculateEffectivePitchDie, calculateEffectiveTargets, classifyMss, requiresHitDefense, resolveAtBat } from "../rules/deadball/modern.mjs";

const example = {
  outs: 0,
  bases: { first: true, second: false, third: false },
  bt: 31,
  obt: 42,
  pitchDieSides: 8,
  swingRoll: 39,
  pitchRoll: 8,
  hitRoll: 8,
  defRoll: 2,
  defModifier: 1,
};

test("classifies the documented MSS bands", () => {
  assert.equal(classifyMss(22, 31, 42), "ordinary-hit");
  assert.equal(classifyMss(35, 31, 42), "walk");
  assert.equal(classifyMss(47, 31, 42), "possible-error");
  assert.equal(classifyMss(48, 31, 42), "productive-out");
});

test("resolves MSS 47 and modified DEF 3 as an F-7 with runner holding", () => {
  const result = resolveAtBat(example);

  assert.equal(result.supported, true);
  assert.equal(result.mss, 47);
  assert.equal(result.modifiedDef, 3);
  assert.equal(result.score, "F-7");
  assert.match(result.summary, /Pop-up to LF/);
  assert.equal(result.stateDelta.outsAfter, 1);
  assert.deepEqual(result.stateDelta.bases, {
    first: true,
    second: false,
    third: false,
  });
  assert.deepEqual(result.stateDelta.runnerMoves, ["Runner on first holds"]);
});

test("resolves modified DEF 2 as an error and advances all runners one base", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    defModifier: 0,
  });

  assert.equal(result.outcomeCode, "error");
  assert.equal(result.stateDelta.outsAfter, 0);
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, {
    first: true,
    second: true,
    third: true,
  });
});

test("maps possible-error endings 0 and 1 to shortstop and 2 to second base", () => {
  const baseInput = {
    ...example,
    obt: 49,
    pitchRoll: 6,
    defRoll: 3,
    defModifier: 0,
  };

  const endingZero = resolveAtBat({ ...baseInput, swingRoll: 44 });
  const endingOne = resolveAtBat({ ...baseInput, swingRoll: 45 });
  const endingTwo = resolveAtBat({ ...baseInput, swingRoll: 46 });

  assert.equal(endingZero.play.position, "SS");
  assert.equal(endingOne.play.position, "SS");
  assert.equal(endingTwo.play.position, "2B");
});

test("resolves an Out Table strikeout with runners holding", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 42,
  });

  assert.equal(result.score, "K");
  assert.equal(result.stateDelta.outsAfter, 1);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
});

test("rejects missing and out-of-range dice instead of treating them as zero", () => {
  const result = resolveAtBat({ ...example, pitchRoll: Number.NaN });

  assert.equal(result.outcomeCode, "invalid-input");
  assert.match(result.errors[0].message, /Pitch Die result/);
});

test("puts the batter on first after a walk with empty bases", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: false, second: false, third: false },
    swingRoll: 30,
  });

  assert.equal(result.score, "BB");
  assert.equal(result.stateDelta.outsAfter, 0);
  assert.equal(result.stateDelta.runsScored, 0);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: false, third: false });
});

test("forces a runner from first to second on a walk", () => {
  const result = resolveAtBat({ ...example, swingRoll: 30 });

  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: false });
  assert.deepEqual(result.stateDelta.runnerMoves, ["Batter to first", "Runner on first to second"]);
});

test("loads the bases when first and second are occupied", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: false },
    swingRoll: 30,
  });

  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
  assert.equal(result.stateDelta.runsScored, 0);
});

test("scores exactly one run on a bases-loaded walk", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 30,
  });

  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
  assert.equal(result.stateDelta.runsScored, 1);
  assert.match(result.detail, /Runner on third scores/);
});

test("does not advance unforced runners on second and third", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: false, second: true, third: true },
    swingRoll: 30,
  });

  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
  assert.equal(result.stateDelta.runsScored, 0);
  assert.match(result.detail, /Runner on second holds; Runner on third holds/);
});

test("resolves a standard single with runners advancing one base", () => {
  const result = resolveAtBat({ ...example, swingRoll: 20, hitRoll: 8 });

  assert.equal(result.score, "1B");
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: false });
  assert.equal(result.stateDelta.runsScored, 0);
});

test("resolves a Hit Table 10-14 single with runners advancing two bases", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: false, second: true, third: false },
    swingRoll: 20,
    hitRoll: 11,
  });

  assert.equal(result.score, "1B");
  assert.deepEqual(result.stateDelta.bases, { first: true, second: false, third: false });
  assert.equal(result.stateDelta.runsScored, 1);
});

test("resolves Hit Table 18 as a double with runners advancing three bases", () => {
  const result = resolveAtBat({ ...example, swingRoll: 20, hitRoll: 18 });

  assert.equal(result.score, "2B");
  assert.deepEqual(result.stateDelta.bases, { first: false, second: true, third: false });
  assert.equal(result.stateDelta.runsScored, 1);
});

test("resolves a bases-loaded home run as four runs with empty bases", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 20,
    hitRoll: 20,
  });

  assert.equal(result.score, "HR");
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: false });
  assert.equal(result.stateDelta.runsScored, 4);
});

test("resolves a defensive single error with one-base advancement", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 20,
    hitRoll: 3,
    defRoll: 2,
    defModifier: 0,
  });

  assert.equal(result.score, "E-3");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
});

test("leaves a defensive single unchanged on modified DEF 3-9", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 3,
    defRoll: 5,
    defModifier: 0,
  });

  assert.equal(result.score, "1B");
  assert.equal(result.modifiedDef, 5);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: false });
});

test("keeps a defensive single at modified DEF 10-11", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 3,
    defRoll: 11,
    defModifier: 0,
  });

  assert.equal(result.score, "1B");
  assert.match(result.calculations.at(-1), /single remains a single/);
});

test("reduces a defensive double to a single on modified DEF 10-11", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 15,
    defRoll: 10,
    defModifier: 0,
  });

  assert.equal(result.score, "1B");
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: false });
});

test("turns a defensive hit into an out at modified DEF 12+", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 3,
    defRoll: 11,
    defModifier: 1,
  });

  assert.equal(result.score, "OUT");
  assert.equal(result.outcomeCode, "defensive-out");
  assert.equal(result.stateDelta.outsAfter, 1);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: false, third: false });
});

test("clears the bases when a defensive play makes the third out", () => {
  const result = resolveAtBat({
    ...example,
    outs: 2,
    bases: { first: true, second: true, third: true },
    swingRoll: 20,
    hitRoll: 16,
    defRoll: 12,
    defModifier: 0,
  });

  assert.equal(result.stateDelta.outsAfter, 3);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: false });
});

test("requires a valid Hit Table roll for an ordinary hit", () => {
  const result = resolveAtBat({ ...example, swingRoll: 20, hitRoll: Number.NaN });

  assert.equal(result.outcomeCode, "invalid-input");
  assert.match(result.errors[0].message, /Hit Table roll/);
});

test("upgrades a defensive single to a critical double without a DEF roll", () => {
  const result = resolveAtBat({
    ...example,
    pitchDieSides: 4,
    swingRoll: 1,
    pitchRoll: 1,
    hitRoll: 6,
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "2B");
  assert.equal(result.outcomeCode, "critical-double");
  assert.deepEqual(result.stateDelta.bases, { first: false, second: true, third: true });
  assert.match(result.calculations.at(-1), /no DEF roll/);
});

test("gives existing runners the extra base on a critical upgraded single", () => {
  const result = resolveAtBat({
    ...example,
    pitchDieSides: 4,
    swingRoll: 1,
    pitchRoll: 1,
    hitRoll: 11,
  });

  assert.equal(result.score, "2B");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: true, third: false });
});

test("upgrades a defensive double to a critical triple without defense", () => {
  const result = resolveAtBat({
    ...example,
    pitchDieSides: 4,
    swingRoll: 1,
    pitchRoll: 1,
    hitRoll: 15,
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "3B");
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: true });
  assert.equal(result.stateDelta.runsScored, 1);
});

test("adds one runner base to Hit Table 18 on a critical triple", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    pitchDieSides: 4,
    swingRoll: 1,
    pitchRoll: 1,
    hitRoll: 18,
  });

  assert.equal(result.score, "3B");
  assert.equal(result.stateDelta.runsScored, 3);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: true });
});

test("keeps a critical Hit Table home run at home-run level", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    pitchDieSides: 4,
    swingRoll: 1,
    pitchRoll: 1,
    hitRoll: 20,
  });

  assert.equal(result.score, "HR");
  assert.equal(result.stateDelta.runsScored, 4);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: false });
});

test("requires a valid Hit Table roll for a critical hit", () => {
  const result = resolveAtBat({
    ...example,
    pitchDieSides: 4,
    swingRoll: 1,
    pitchRoll: 1,
    hitRoll: Number.NaN,
  });

  assert.equal(result.outcomeCode, "invalid-input");
  assert.match(result.errors[0].message, /Hit Table roll/);
});

test("applies P+ before resolving an ordinary defensive hit", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: false, second: false, third: false },
    swingRoll: 20,
    hitRoll: 14,
    hitterPowerTrait: "p-plus",
    defRoll: 5,
    defModifier: 0,
  });

  assert.equal(result.score, "2B");
  assert.equal(result.play.position, "LF");
  assert.match(result.calculations[2], /14 \+ 1 \(P\+\) = modified Hit Table 15/);
  assert.equal(requiresHitDefense(14, { powerTrait: "p-plus" }), true);
});

test("applies P- before looking up the Hit Table result", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 19,
    hitterPowerTrait: "p-minus",
  });

  assert.equal(result.score, "2B");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.match(result.calculations[2], /19 - 1 \(P-\) = modified Hit Table 18/);
});

test("turns a modified Hit Table value of 1 or 2 into a C+ double without DEF", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 1,
    hitterContactPlus: true,
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "2B");
  assert.deepEqual(result.stateDelta.bases, { first: false, second: true, third: true });
  assert.equal(requiresHitDefense(1, { contactPlus: true }), false);
});

test("turns a modified Hit Table value of 2 into an S+ triple without DEF", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 2,
    hitterSpeedPlus: true,
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "3B");
  assert.equal(result.outcomeCode, "triple");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: true });
});

test("applies P+ before evaluating C+ against the modified Hit Table value", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 1,
    hitterPowerTrait: "p-plus",
    hitterContactPlus: true,
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "2B");
  assert.match(result.calculations[2], /1 \+ 1 \(P\+\) = modified Hit Table 2/);
  assert.match(result.calculations[3], /Modified Hit Table 2 with C\+ -> double/);
  assert.equal(requiresHitDefense(1, { powerTrait: "p-plus", contactPlus: true }), false);
});

test("applies P- before evaluating S+ against the modified Hit Table value", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 3,
    hitterPowerTrait: "p-minus",
    hitterSpeedPlus: true,
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "3B");
  assert.match(result.calculations[2], /3 - 1 \(P-\) = modified Hit Table 2/);
  assert.match(result.calculations[3], /Modified Hit Table 2 with S\+ -> triple/);
});

test("uses the stronger S+ result when C+ and S+ both match modified Hit Table 2", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitRoll: 2,
    hitterContactPlus: true,
    hitterSpeedPlus: true,
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "3B");
  assert.match(result.calculations[2], /with S\+ -> triple/);
});

test("applies P+ before upgrading a critical hit", () => {
  const result = resolveAtBat({
    ...example,
    pitchDieSides: 4,
    swingRoll: 1,
    pitchRoll: 1,
    hitRoll: 14,
    hitterPowerTrait: "p-plus",
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "3B");
  assert.match(result.calculations[2], /14 \+ 1 \(P\+\) = modified Hit Table 15/);
  assert.match(result.calculations.at(-1), /no DEF roll/);
});

test("resolves an S+ modified value of 2 critical hit as an inside-the-park home run", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    pitchDieSides: 4,
    swingRoll: 1,
    pitchRoll: 1,
    hitRoll: 2,
    hitterSpeedPlus: true,
    defRoll: Number.NaN,
  });

  assert.equal(result.score, "HR");
  assert.equal(result.summary, "Inside-the-park home run.");
  assert.equal(result.stateDelta.runsScored, 4);
  assert.match(result.calculations[4], /inside-the-park home run/);
});

test("rejects an unknown power trait on a hit path", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 20,
    hitterPowerTrait: "unknown",
  });

  assert.equal(result.outcomeCode, "invalid-input");
  assert.match(result.errors[0].message, /supported P trait/);
});

test("treats MSS 99 as an ordinary out when optional oddities are disabled", () => {
  const result = resolveAtBat({ ...example, swingRoll: 91, pitchRoll: 8, odditiesEnabled: false });

  assert.equal(classifyMss(99, 31, 42, false), "out");
  assert.equal(result.classification, "out");
  assert.equal(result.score, "F-9");
});

test("resolves a wild-pitch oddity and keeps the at-bat in progress", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 91,
    pitchRoll: 8,
    odditiesEnabled: true,
    oddityRollOne: 6,
    oddityRollTwo: 6,
  });

  assert.equal(result.score, "WP");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: true, third: true });
  assert.match(result.detail, /At-bat continues; roll a new MSS/);
});

test("resolves passed-ball and balk oddities with one-base runner advancement", () => {
  const passedBall = resolveAtBat({
    ...example, swingRoll: 91, pitchRoll: 8, odditiesEnabled: true, oddityRollOne: 7, oddityRollTwo: 8,
  });
  const balk = resolveAtBat({
    ...example, swingRoll: 91, pitchRoll: 8, odditiesEnabled: true, oddityRollOne: 9, oddityRollTwo: 10,
  });

  assert.equal(passedBall.score, "PB");
  assert.equal(balk.score, "BK");
  assert.deepEqual(passedBall.stateDelta.bases, { first: false, second: true, third: false });
  assert.deepEqual(balk.stateDelta.bases, { first: false, second: true, third: false });
});

test("forces every runner forward on a bases-loaded hit by pitch", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 91,
    pitchRoll: 8,
    odditiesEnabled: true,
    oddityRollOne: 5,
    oddityRollTwo: 6,
  });

  assert.equal(result.score, "HBP");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
});

test("awards first on catcher interference without moving unforced runners", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: false, second: true, third: true },
    swingRoll: 91,
    pitchRoll: 8,
    odditiesEnabled: true,
    oddityRollOne: 10,
    oddityRollTwo: 10,
  });

  assert.equal(result.score, "CI");
  assert.equal(result.stateDelta.runsScored, 0);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
});

test("resolves a pitcher error with the batter and every runner advancing", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 91,
    pitchRoll: 8,
    odditiesEnabled: true,
    oddityRollOne: 9,
    oddityRollTwo: 9,
  });

  assert.equal(result.score, "E-1");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
});

test("identifies oddities that need broader game state without inventing a ruling", () => {
  const result = resolveAtBat({
    ...example, swingRoll: 91, pitchRoll: 8, odditiesEnabled: true, oddityRollOne: 1, oddityRollTwo: 1,
  });

  assert.equal(result.supported, false);
  assert.equal(result.outcomeCode, "oddity-needs-game-state");
  assert.equal(result.summary, "Fan interference.");
  assert.match(result.detail, /Apply it manually/);
});

test("requires two valid d10 results on the oddity path", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 91,
    pitchRoll: 8,
    odditiesEnabled: true,
    oddityRollOne: Number.NaN,
    oddityRollTwo: 6,
  });

  assert.equal(result.outcomeCode, "invalid-input");
  assert.match(result.errors[0].message, /first Oddities die/);
});

test("combines C-, K+, and CN+ into visible effective targets", () => {
  const targets = calculateEffectiveTargets({
    ...example,
    bases: { first: false, second: true, third: false },
    hitterFreeSwinger: true,
    pitcherKPlus: true,
    pitcherControlTrait: "cn-plus",
  });

  assert.equal(targets.bt, 27);
  assert.equal(targets.obt, 37);
  assert.match(targets.calculations.at(-1), /BT 31 - 4 = 27; OBT 42 - 5 = 37/);
});

test("does not activate C- with only a runner on first", () => {
  const targets = calculateEffectiveTargets({
    ...example,
    hitterFreeSwinger: true,
  });

  assert.equal(targets.bt, 31);
  assert.equal(targets.obt, 42);
  assert.deepEqual(targets.calculations, []);
});

test("uses combined effective targets to classify a possible error", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: false, second: true, third: false },
    swingRoll: 30,
    pitchRoll: 8,
    hitterFreeSwinger: true,
    pitcherKPlus: true,
    pitcherControlTrait: "cn-plus",
    defRoll: 3,
    defModifier: 0,
  });

  assert.equal(result.classification, "possible-error");
  assert.equal(result.score, "F-8");
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: true });
  assert.ok(result.calculations.some((line) => /possible-error range 38-42/.test(line)));
});

test("K+ can move an MSS from the hit band into the walk band", () => {
  const result = resolveAtBat({
    ...example,
    swingRoll: 23,
    pitchRoll: 8,
    pitcherKPlus: true,
  });

  assert.equal(result.score, "BB");
  assert.match(result.calculations.at(1), /K\+/);
  assert.match(result.calculations.at(2), /BT 31 - 1 = 30/);
});

test("CN- widens the walk band while CN+ narrows it", () => {
  const wildPitcher = resolveAtBat({
    ...example,
    swingRoll: 36,
    pitchRoll: 8,
    pitcherControlTrait: "cn-minus",
  });
  const controlPitcher = resolveAtBat({
    ...example,
    swingRoll: 33,
    pitchRoll: 8,
    pitcherControlTrait: "cn-plus",
    defRoll: 3,
    defModifier: 0,
  });

  assert.equal(wildPitcher.score, "BB");
  assert.equal(controlPitcher.classification, "possible-error");
  assert.match(wildPitcher.calculations.at(1), /CN-/);
  assert.match(controlPitcher.calculations.at(1), /CN\+/);
});

test("K+ changes Out Table result 3 into a strikeout", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 65,
    pitchRoll: 8,
    pitcherKPlus: true,
  });

  assert.equal(result.score, "K");
  assert.equal(result.stateDelta.outsAfter, 1);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
  assert.match(result.calculations.at(-2), /K\+ changes Out Table result 3/);
});

test("GB+ increases the Pitch Die one level with the bases loaded", () => {
  const pitchDie = calculateEffectivePitchDie({
    ...example,
    bases: { first: true, second: true, third: true },
    pitcherGroundballPlus: true,
  });

  assert.equal(pitchDie.sides, 12);
  assert.match(pitchDie.calculations[0], /d8 increases one level to d12/);
});

test("GB+ leaves the Pitch Die unchanged unless the bases are loaded", () => {
  const pitchDie = calculateEffectivePitchDie({
    ...example,
    bases: { first: true, second: true, third: false },
    pitcherGroundballPlus: true,
  });

  assert.equal(pitchDie.sides, 8);
  assert.deepEqual(pitchDie.calculations, []);
});

test("GB+ respects the d20 maximum with the bases loaded", () => {
  const pitchDie = calculateEffectivePitchDie({
    ...example,
    bases: { first: true, second: true, third: true },
    pitchDieSides: 20,
    pitcherGroundballPlus: true,
  });

  assert.equal(pitchDie.sides, 20);
  assert.match(pitchDie.calculations[0], /remains d20/);
});

test("GB+ loaded-bases fixture uses d12 and makes an automatic double play", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 60,
    pitchRoll: 12,
    pitcherGroundballPlus: true,
  });

  assert.equal(result.mss, 72);
  assert.equal(result.score, "DP");
  assert.equal(result.play.position, "SS");
  assert.equal(result.stateDelta.outsAfter, 2);
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: true });
  assert.match(result.detail, /Runner on third scores on the force/);
  assert.match(result.detail, /Runner on second to third on the force/);
  assert.match(result.calculations[1], /d8 increases one level to d12/);
  assert.match(result.calculations.at(-1), /automatic double play/);
});

test("loaded infield double play advances every forced lead runner", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 68,
    pitchRoll: 8,
  });

  assert.equal(result.mss, 76);
  assert.equal(result.score, "DP");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: true });
});

test("loaded shortstop fielder's choice advances every forced lead runner", () => {
  const result = resolveAtBat({
    ...example,
    bt: 20,
    obt: 30,
    bases: { first: true, second: true, third: true },
    swingRoll: 48,
    pitchRoll: 8,
  });

  assert.equal(result.mss, 56);
  assert.equal(result.score, "FC");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: false, third: true });
});

test("inning-ending loaded GB+ double play suppresses the forced run", () => {
  const result = resolveAtBat({
    ...example,
    outs: 1,
    bases: { first: true, second: true, third: true },
    swingRoll: 60,
    pitchRoll: 12,
    pitcherGroundballPlus: true,
  });

  assert.equal(result.score, "DP");
  assert.equal(result.stateDelta.outsAfter, 3);
  assert.equal(result.stateDelta.runsScored, 0);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: false });
  assert.match(result.detail, /does not score/);
});

test("GB+ Out Table result 2 is a 6-3 groundball without a runner on first", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: false, second: false, third: false },
    swingRoll: 64,
    pitchRoll: 8,
    pitcherGroundballPlus: true,
  });

  assert.equal(result.mss, 72);
  assert.equal(result.score, "6-3");
  assert.equal(result.outcomeCode, "groundball");
  assert.equal(result.play.position, "SS");
  assert.match(result.calculations.at(-2), /GB\+ changes Out Table result 2/);
});

test("rejects a loaded-bases d12 roll when GB+ is not active", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: true, second: true, third: true },
    swingRoll: 60,
    pitchRoll: 12,
  });

  assert.equal(result.outcomeCode, "invalid-input");
  assert.match(result.errors[0].message, /1 through 8/);
});

test("rejects an unknown pitcher control trait", () => {
  const result = resolveAtBat({ ...example, pitcherControlTrait: "unknown" });

  assert.equal(result.outcomeCode, "invalid-input");
  assert.match(result.errors[0].message, /CN\+/);
});

test("advances runners on a productive outfield out below MSS 70", () => {
  const result = resolveAtBat({
    ...example,
    bases: { first: false, second: true, third: true },
    swingRoll: 59,
  });

  assert.equal(result.score, "F-7");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: true });
});

test("advances a loaded set of runners legally on an MSS below 50 groundball", () => {
  const result = resolveAtBat({
    ...example,
    bt: 20,
    obt: 30,
    bases: { first: true, second: true, third: true },
    swingRoll: 38,
  });

  assert.equal(result.score, "6-3");
  assert.equal(result.stateDelta.runsScored, 1);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: true, third: true });
});

test("resolves MSS 50-69 on the infield as a fielder's choice", () => {
  const result = resolveAtBat({ ...example, swingRoll: 48 });

  assert.equal(result.score, "FC");
  assert.equal(result.outcomeCode, "fielders-choice");
  assert.deepEqual(result.stateDelta.bases, { first: true, second: false, third: false });
});

test("resolves MSS 70+ on the infield as a double play", () => {
  const result = resolveAtBat({ ...example, swingRoll: 68 });

  assert.equal(result.score, "DP");
  assert.equal(result.stateDelta.outsAfter, 2);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: false });
});

test("resolves an eligible MSS 100+ infield result as a triple play", () => {
  const result = resolveAtBat({
    ...example,
    outs: 0,
    bases: { first: true, second: true, third: false },
    swingRoll: 98,
  });

  assert.equal(result.score, "TP");
  assert.equal(result.stateDelta.outsAfter, 3);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: false });
});

test("does not score a productive-out run when the batter makes the third out", () => {
  const result = resolveAtBat({
    ...example,
    outs: 2,
    bases: { first: false, second: false, third: true },
    swingRoll: 59,
  });

  assert.equal(result.stateDelta.outsAfter, 3);
  assert.equal(result.stateDelta.runsScored, 0);
  assert.deepEqual(result.stateDelta.bases, { first: false, second: false, third: false });
});

test("describes every loaded-base runner holding on an MSS 70+ outfield out", () => {
  const result = resolveAtBat({
    ...example,
    outs: 1,
    bases: { first: true, second: true, third: true },
    swingRoll: 70,
  });

  assert.equal(result.score, "F-8");
  assert.equal(result.stateDelta.outsAfter, 2);
  assert.deepEqual(result.stateDelta.bases, { first: true, second: true, third: true });
  assert.deepEqual(result.stateDelta.runnerMoves, [
    "Runner on first holds",
    "Runner on second holds",
    "Runner on third holds",
  ]);
  assert.match(result.summary, /Pop-up to CF/);
  assert.match(result.detail, /Runner on first holds; Runner on second holds; Runner on third holds/);
});

