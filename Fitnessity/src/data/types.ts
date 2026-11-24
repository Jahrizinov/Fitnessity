export type Exercise = {
  id: string;
  name: string;
  group: string;
  equipment: string;
  sets: number;
  reps: number;
  rest: number;
  measurement?: 'seconds';
  movement?: string;
};

export type Workout = {
  id: string;
  name: string;
  category: string;
  description: string;
  ids: string[];
  sets?: number;
  prescriptions?: { sets: number; reps: number }[];
  person?: string;
  initials?: string;
  source?: string;
  sourceLabel?: string;
  sourceNote?: string;
};

export type LoggedSet = {
  reps: number;
  weightKg: number;
  measurement?: 'seconds';
};
export type HistoryEntry = {
  id: string;
  name: string;
  date: string;
  minutes: number;
  sets: (LoggedSet & { exercise: string })[];
};
export type SessionExercise = Exercise & {
  done: (LoggedSet | null)[];
  drafts: { reps: string; weight: string; unit: 'kg' | 'lbs' }[];
  replacedFrom?: string;
};
export type Session = {
  id: string;
  workoutId: string;
  name: string;
  start: number;
  restUntil: number;
  archivedSets: (LoggedSet & { exercise: string })[];
  exercises: SessionExercise[];
};
export type Profile = {
  name: string;
  goal: string;
  kcal: number;
  unit: 'kg' | 'lbs';
};
export type Meal = {
  id: string;
  name: string;
  type: string;
  kcal: number;
  protein: number;
  date: string;
};
export type AppState = {
  profile: Profile;
  favorites: string[];
  avoidedExercises: string[];
  workoutPreferences: Record<string, 'like' | 'avoid'>;
  workoutChoices: Record<string, Record<number, string | null>>;
  customExercises: Exercise[];
  customWorkouts: Workout[];
  history: HistoryEntry[];
  meals: Meal[];
  pulse: 'low' | 'medium' | 'high';
  session: Session | null;
};
