import { exercises, movementOf, templates } from '../data/catalog';
import type { AppState, Exercise, Session, Workout } from '../data/types';

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const todayKey = (value: string | number | Date = new Date()) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
export const toKg = (weight: number, unit: string) =>
  unit === 'lbs' ? weight / 2.20462 : weight;
export const fromKg = (weight: number, unit: string) =>
  unit === 'lbs' ? weight * 2.20462 : weight;
export const numberValue = (value: string) =>
  value.trim() ? Number(value.replace(',', '.')) : NaN;
export const defaultState = (): AppState => ({
  profile: { name: 'Sporter', goal: 'Spieropbouw', kcal: 2400, unit: 'kg' },
  favorites: [],
  avoidedExercises: [],
  workoutPreferences: {},
  workoutChoices: {},
  customExercises: [],
  customWorkouts: [],
  history: [],
  meals: [],
  pulse: 'medium',
  session: null,
});
export const allExercises = (state: AppState) => [
  ...exercises,
  ...state.customExercises,
];
export const allWorkouts = (state: AppState) => [
  ...templates,
  ...state.customWorkouts,
];

export function workoutSlots(state: AppState, workout: Workout) {
  return workout.ids.map((baseId, index) => {
    const choices = state.workoutChoices[workout.id] || {};
    const id = Object.hasOwn(choices, index) ? choices[index] : baseId;
    const base = allExercises(state).find((ex) => ex.id === (id || baseId))!;
    const exercise = {
      ...base,
      ...(workout.sets ? { sets: workout.sets } : {}),
      ...workout.prescriptions?.[index],
    };
    return {
      index,
      baseId,
      exercise,
      skipped:
        id === null || !base || state.avoidedExercises.includes(exercise.id),
    };
  });
}
export const availableExercises = (state: AppState, workout: Workout) =>
  workoutSlots(state, workout)
    .filter((s) => !s.skipped)
    .map((s) => s.exercise);

export function recommendWorkout(state: AppState) {
  const suggestions = {
    low: {
      id: 'upper',
      text: 'Doe vandaag een rustige Upper Body workout en neem extra rust.',
    },
    medium: {
      id: 'full',
      text: 'Je voelt je goed: Full Body is een mooie keuze.',
    },
    high: { id: 'legs', text: 'Veel energie? Ga voor een uitdagende Leg Day!' },
  };
  const suggested = suggestions[state.pulse];
  const score = (w: Workout) =>
    (state.workoutPreferences[w.id] === 'like' ? 100 : 0) +
    (w.id === suggested.id ? 10 : 0) +
    availableExercises(state, w).filter((ex) => state.favorites.includes(ex.id))
      .length;
  const workout = allWorkouts(state)
    .filter(
      (w) =>
        state.workoutPreferences[w.id] !== 'avoid' &&
        availableExercises(state, w).length
    )
    .sort((a, b) => score(b) - score(a))[0];
  return {
    workout,
    text:
      workout?.id === suggested.id
        ? suggested.text
        : 'Een training die past bij jouw voorkeuren. Pak je volgende set.',
  };
}

export function createSession(
  state: AppState,
  workout: Workout,
  now = Date.now()
): Session | null {
  const selected = availableExercises(state, workout);
  if (!selected.length) return null;
  return {
    id: uid(),
    workoutId: workout.id,
    name: workout.name,
    start: now,
    restUntil: 0,
    archivedSets: [],
    exercises: selected.map((ex) => ({
      ...ex,
      done: Array.from({ length: ex.sets }, () => null),
      drafts: Array.from({ length: ex.sets }, () => ({
        reps: String(ex.reps),
        weight: '0',
        unit: state.profile.unit,
      })),
    })),
  };
}

export function completeSet(
  state: AppState,
  ei: number,
  si: number,
  now = Date.now()
): AppState {
  const session = state.session;
  const ex = session?.exercises[ei];
  const draft = ex?.drafts[si];
  if (
    !session ||
    !ex ||
    !draft ||
    si < 0 ||
    si >= ex.done.length ||
    ex.done[si] ||
    state.avoidedExercises.includes(ex.id)
  )
    return state;
  const reps = numberValue(draft.reps),
    weight = numberValue(draft.weight);
  if (
    !Number.isInteger(reps) ||
    reps <= 0 ||
    reps > (ex.measurement === 'seconds' ? 3600 : 1000) ||
    !Number.isFinite(weight) ||
    weight < 0 ||
    weight > 2000
  )
    return state;
  return {
    ...state,
    session: {
      ...session,
      restUntil: now + ex.rest * 1000,
      exercises: session.exercises.map((e, i) =>
        i !== ei
          ? e
          : {
              ...e,
              done: e.done.map((s, j) =>
                j !== si
                  ? s
                  : {
                      reps,
                      weightKg: toKg(weight, draft.unit),
                      ...(ex.measurement
                        ? { measurement: ex.measurement }
                        : {}),
                    }
              ),
            }
      ),
    },
  };
}

export function sessionStats(state: AppState) {
  const session = state.session;
  const archived = session?.archivedSets.length || 0;
  const done =
    (session?.exercises.reduce(
      (n, ex) => n + ex.done.filter(Boolean).length,
      0
    ) || 0) + archived;
  const total =
    (session?.exercises.reduce(
      (n, ex) =>
        n +
        (state.avoidedExercises.includes(ex.id)
          ? ex.done.filter(Boolean).length
          : ex.sets),
      0
    ) || 0) + archived;
  return { done, total };
}

export function replaceSessionExercise(
  state: AppState,
  index: number,
  replacement: Exercise
): AppState {
  const session = state.session,
    previous = session?.exercises[index];
  if (!session || !previous) return state;
  const remaining = previous.done.filter((s) => !s).length;
  if (!remaining) return state;
  const archived = previous.done.flatMap((s) =>
    s ? [{ ...s, exercise: previous.name }] : []
  );
  const sets = Math.min(remaining, replacement.sets);
  return {
    ...state,
    session: {
      ...session,
      archivedSets: [...session.archivedSets, ...archived],
      exercises: session.exercises.map((ex, i) =>
        i !== index
          ? ex
          : {
              ...replacement,
              sets,
              replacedFrom: previous.name,
              done: Array.from({ length: sets }, () => null),
              drafts: Array.from({ length: sets }, () => ({
                reps: String(replacement.reps),
                weight: '0',
                unit: state.profile.unit,
              })),
            }
      ),
    },
  };
}

export function finishSession(state: AppState, now = Date.now()): AppState {
  const session = state.session;
  if (!session) return state;
  const sets = [
    ...session.archivedSets,
    ...session.exercises.flatMap((ex) =>
      ex.done.flatMap((s) => (s ? [{ ...s, exercise: ex.name }] : []))
    ),
  ];
  if (!sets.length) return state;
  return {
    ...state,
    session: null,
    history: [
      ...state.history,
      {
        id: session.id,
        name: session.name,
        date: new Date(now).toISOString(),
        minutes: Math.max(1, Math.ceil((now - session.start) / 60000)),
        sets,
      },
    ],
  };
}

export function alternatives(state: AppState, exercise: Exercise) {
  return allExercises(state)
    .filter(
      (ex) =>
        ex.id !== exercise.id &&
        ex.group === exercise.group &&
        !state.avoidedExercises.includes(ex.id)
    )
    .sort(
      (a, b) =>
        Number(movementOf(b) === movementOf(exercise)) -
        Number(movementOf(a) === movementOf(exercise))
    );
}

export function weekHistory(state: AppState, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return state.history.filter((w) => new Date(w.date) >= start);
}
