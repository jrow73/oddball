import test from "node:test";
import assert from "node:assert/strict";
import { classifyMss, resolveAtBat } from "../rules/deadball/modern.mjs";

const example = {
  outs: 0,
  bases: { first: true, second: false, third: false },
  bt: 31,
  obt: 42,
  pitchDieSides: 8,
  swingRoll: 39,
  pitchRoll: 8,
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

test("reports outcomes outside the vertical slice without inventing a resolution", () => {
  const result = resolveAtBat({ ...example, swingRoll: 20 });

  assert.equal(result.supported, false);
  assert.equal(result.outcomeCode, "outside-first-slice");
  assert.equal(result.classification, "ordinary-hit");
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

