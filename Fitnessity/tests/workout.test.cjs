const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

// Run the actual TypeScript workout model without adding a test framework or native mocks.
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};
const { exercises, templates } = require('../src/data/catalog.ts');
const {
  allWorkouts,
  availableExercises,
  completeSet,
  createSession,
  defaultState,
  finishSession,
  fromKg,
  recommendWorkout,
  replaceSessionExercise,
  sessionStats,
  toKg,
  workoutSlots,
} = require('../src/state/workout.ts');
const workout = (id) => templates.find((w) => w.id === id);
function active(id = 'legs') {
  const state = defaultState();
  state.session = createSession(state, workout(id), 1000);
  return state;
}

test('the original catalog has 42 exercises and 12 valid workout templates', () => {
  assert.equal(exercises.length, 42);
  assert.equal(templates.length, 12);
  for (const w of templates) {
    assert.ok(w.ids.every((id) => exercises.some((ex) => ex.id === id)));
  }
});

test('FIT PULSE respects energy, favorites, and avoided workouts', () => {
  const state = defaultState();
  assert.equal(recommendWorkout(state).workout.id, 'full');
  state.pulse = 'high';
  assert.equal(recommendWorkout(state).workout.id, 'legs');
  state.workoutPreferences.upper = 'like';
  assert.equal(recommendWorkout(state).workout.id, 'upper');
  for (const w of allWorkouts(state)) state.workoutPreferences[w.id] = 'avoid';
  assert.equal(recommendWorkout(state).workout, undefined);
});

test('planning swaps, skips, prescriptions, and avoided exercises carry into a session', () => {
  const state = defaultState();
  state.workoutChoices.legs = { 0: 'goblet', 1: null };
  const slots = workoutSlots(state, workout('legs'));
  assert.equal(slots[0].exercise.id, 'goblet');
  assert.equal(slots[1].skipped, true);
  assert.deepEqual(
    availableExercises(state, workout('legs')).map((ex) => ex.id),
    ['goblet', 'plank']
  );
  assert.equal(availableExercises(state, workout('arnold'))[1].sets, 2);
  state.avoidedExercises = ['goblet', 'plank'];
  assert.equal(createSession(state, workout('legs')), null);
});

test('completing a set saves kilograms and an absolute rest deadline', () => {
  const state = active();
  state.session.exercises[0].drafts[0] = {
    reps: '8',
    weight: '132,2772',
    unit: 'lbs',
  };
  const updated = completeSet(state, 0, 0, 10000);
  assert.ok(
    Math.abs(updated.session.exercises[0].done[0].weightKg - 60) < 0.001
  );
  assert.equal(updated.session.restUntil, 130000);
  assert.equal(state.session.exercises[0].done[0], null);
  assert.equal(completeSet(updated, 0, 0), updated);
  assert.ok(Math.abs(fromKg(toKg(100, 'lbs'), 'lbs') - 100) < 0.001);
});

test('invalid set input is rejected without changing the session', () => {
  for (const [reps, weight] of [
    ['', '20'],
    ['-1', '20'],
    ['8.5', '20'],
    ['8', ''],
    ['8', '-1'],
    ['8', 'Infinity'],
    ['1001', '20'],
  ]) {
    const state = active();
    state.session.exercises[0].drafts[0] = { reps, weight, unit: 'kg' };
    assert.equal(completeSet(state, 0, 0), state);
  }
});

test('session drafts, completed sets, and rest deadlines survive JSON persistence', () => {
  let state = active();
  state.session.exercises[1].drafts[1].weight = '42.5';
  state = completeSet(state, 0, 0, 10000);
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(restored.session.exercises[1].drafts[1].weight, '42.5');
  assert.equal(restored.session.exercises[0].done[0].reps, 8);
  assert.equal(restored.session.restUntil, 130000);
});

test('avoiding an exercise keeps its completed sets and excludes remaining sets', () => {
  let state = completeSet(active(), 0, 0);
  state.avoidedExercises = ['squat'];
  assert.deepEqual(sessionStats(state), { done: 1, total: 7 });
  assert.equal(completeSet(state, 0, 1), state);
  const saved = finishSession(state);
  assert.equal(saved.history[0].sets.length, 1);
  assert.equal(saved.history[0].sets[0].exercise, 'Squat');
});

test('swapping during training archives completed sets and preserves them when finishing', () => {
  let state = completeSet(active(), 0, 0);
  state = replaceSessionExercise(
    state,
    0,
    exercises.find((ex) => ex.id === 'goblet')
  );
  assert.equal(state.session.archivedSets.length, 1);
  assert.equal(state.session.exercises[0].sets, 3);
  assert.equal(state.session.exercises[0].id, 'goblet');
  state = completeSet(state, 0, 0);
  const finished = finishSession(state, 121000);
  assert.equal(finished.history[0].sets.length, 2);
  assert.equal(finished.history[0].minutes, 2);
  assert.equal(finished.session, null);
  assert.equal(finishSession(finished), finished);
});

test('empty workouts cannot be recorded', () => {
  const state = active();
  assert.equal(finishSession(state), state);
  assert.equal(state.history.length, 0);
});
