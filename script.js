
"use strict";

// Alle gegevens blijven in deze browser (localStorage).
const STORAGE_KEY = "fitnessity_bootstrap_v1";
const SESSION_KEY = "fitnessity_active_session_v1";
const $ = (id) => document.getElementById(id);

const iconPaths = {
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  exercises: '<path d="m6 5 13 13M4 7l3-3M2 5l3-3m12 18 3-3m-1 5 3-3M5 12l7-7m0 14 7-7"/>',
  workouts: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6m-6 5h6"/>',
  progress: '<path d="M4 4v16h17M7 15l5-5 4 3 5-8"/>',
  nutrition: '<path d="M7 3v7m-3-7v5a3 3 0 0 0 6 0V3M7 11v10M19 3c-4 2-5 7-4 10h4m0-10v18"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  avoid: '<circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  swap: '<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
const icon = (name) => `<svg class="app-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || ""}</svg>`;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const todayKey = (value = new Date()) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const kgToDisplay = (kg) => state.profile.unit === "lbs" ? kg * 2.20462 : kg;
const displayToKg = (weight) => state.profile.unit === "lbs" ? weight / 2.20462 : weight;

// Standaard oefeningen
const exercises = [
  { id: "bench", name: "Bench press", group: "Borst", equipment: "Barbell", sets: 3, reps: 10, rest: 90 },
  { id: "pushup", name: "Push-ups", group: "Borst", equipment: "Eigen gewicht", sets: 3, reps: 12, rest: 60 },
  { id: "row", name: "Barbell row", group: "Rug", equipment: "Barbell", sets: 3, reps: 10, rest: 90 },
  { id: "pulldown", name: "Lat pulldown", group: "Rug", equipment: "Machine", sets: 3, reps: 12, rest: 75 },
  { id: "squat", name: "Squat", group: "Benen", equipment: "Barbell", sets: 4, reps: 8, rest: 120 },
  { id: "lunge", name: "Lunges", group: "Benen", equipment: "Dumbbells", sets: 3, reps: 12, rest: 75 },
  { id: "shoulder", name: "Shoulder press", group: "Schouders", equipment: "Dumbbells", sets: 3, reps: 10, rest: 75 },
  { id: "curl", name: "Bicep curl", group: "Armen", equipment: "Dumbbells", sets: 3, reps: 12, rest: 60 },
  { id: "plank", name: "Plank", group: "Buik", equipment: "Eigen gewicht", sets: 3, reps: 30, rest: 60, measurement: "seconds" },
  { id: "dbbench", name: "Dumbbell bench press", group: "Borst", equipment: "Dumbbells", sets: 3, reps: 10, rest: 90 },
  { id: "floorpress", name: "Dumbbell floor press", group: "Borst", equipment: "Dumbbells", sets: 3, reps: 10, rest: 75 },
  { id: "inclinepushup", name: "Incline push-up", group: "Borst", equipment: "Eigen gewicht", sets: 3, reps: 10, rest: 60 },
  { id: "inclinebench", name: "Incline dumbbell press", group: "Borst", equipment: "Dumbbells", sets: 3, reps: 10, rest: 90 },
  { id: "fly", name: "Dumbbell fly", group: "Borst", equipment: "Dumbbells", sets: 3, reps: 12, rest: 60 },
  { id: "cablefly", name: "Cable fly", group: "Borst", equipment: "Kabel", sets: 3, reps: 12, rest: 60 },
  { id: "dbrow", name: "Dumbbell row", group: "Rug", equipment: "Dumbbells", sets: 3, reps: 10, rest: 75 },
  { id: "cablerow", name: "Seated cable row", group: "Rug", equipment: "Kabel", sets: 3, reps: 12, rest: 75 },
  { id: "bandrow", name: "Resistance band row", group: "Rug", equipment: "Weerstandsband", sets: 3, reps: 12, rest: 60 },
  { id: "pullup", name: "Pull-up", group: "Rug", equipment: "Optrekstang", sets: 3, reps: 6, rest: 90 },
  { id: "bandpulldown", name: "Band lat pulldown", group: "Rug", equipment: "Weerstandsband", sets: 3, reps: 12, rest: 60 },
  { id: "goblet", name: "Goblet squat", group: "Benen", equipment: "Dumbbells", sets: 3, reps: 12, rest: 75 },
  { id: "bwsquat", name: "Bodyweight squat", group: "Benen", equipment: "Eigen gewicht", sets: 3, reps: 15, rest: 60 },
  { id: "legpress", name: "Leg press", group: "Benen", equipment: "Machine", sets: 3, reps: 12, rest: 90 },
  { id: "split", name: "Split squat", group: "Benen", equipment: "Eigen gewicht", sets: 3, reps: 10, rest: 75 },
  { id: "stepup", name: "Dumbbell step-up", group: "Benen", equipment: "Dumbbells", sets: 3, reps: 10, rest: 75 },
  { id: "rdl", name: "Romanian deadlift", group: "Benen", equipment: "Barbell", sets: 3, reps: 10, rest: 90 },
  { id: "dbrdl", name: "Dumbbell Romanian deadlift", group: "Benen", equipment: "Dumbbells", sets: 3, reps: 10, rest: 90 },
  { id: "hipthrust", name: "Hip thrust", group: "Benen", equipment: "Barbell", sets: 3, reps: 12, rest: 75 },
  { id: "bridge", name: "Glute bridge", group: "Benen", equipment: "Eigen gewicht", sets: 3, reps: 15, rest: 60 },
  { id: "arnoldpress", name: "Arnold press", group: "Schouders", equipment: "Dumbbells", sets: 3, reps: 10, rest: 75 },
  { id: "pikepushup", name: "Pike push-up", group: "Schouders", equipment: "Eigen gewicht", sets: 3, reps: 8, rest: 75 },
  { id: "lateral", name: "Lateral raise", group: "Schouders", equipment: "Dumbbells", sets: 3, reps: 12, rest: 60 },
  { id: "cablelateral", name: "Cable lateral raise", group: "Schouders", equipment: "Kabel", sets: 3, reps: 12, rest: 60 },
  { id: "hammer", name: "Hammer curl", group: "Armen", equipment: "Dumbbells", sets: 3, reps: 12, rest: 60 },
  { id: "bandcurl", name: "Band bicep curl", group: "Armen", equipment: "Weerstandsband", sets: 3, reps: 12, rest: 60 },
  { id: "pushdown", name: "Triceps pushdown", group: "Armen", equipment: "Kabel", sets: 3, reps: 12, rest: 60 },
  { id: "overheadext", name: "Dumbbell triceps extension", group: "Armen", equipment: "Dumbbells", sets: 3, reps: 12, rest: 60 },
  { id: "skullcrusher", name: "Dumbbell skull crusher", group: "Armen", equipment: "Dumbbells", sets: 3, reps: 10, rest: 60 },
  { id: "deadbug", name: "Dead bug", group: "Buik", equipment: "Eigen gewicht", sets: 3, reps: 10, rest: 45 },
  { id: "benchplank", name: "Bench plank", group: "Buik", equipment: "Eigen gewicht", sets: 3, reps: 30, rest: 45, measurement: "seconds" },
  { id: "crunch", name: "Crunch", group: "Buik", equipment: "Eigen gewicht", sets: 3, reps: 15, rest: 45 },
  { id: "cablecrunch", name: "Cable crunch", group: "Buik", equipment: "Kabel", sets: 3, reps: 12, rest: 60 }
];

const movements = {
  press: { label: "Borst · duwen", ids: ["bench", "dbbench", "floorpress", "pushup", "inclinepushup", "inclinebench"], tip: "Houd je schouders stabiel en laat de beweging gecontroleerd zakken." },
  fly: { label: "Borst · fly", ids: ["fly", "cablefly"], tip: "Houd een lichte buiging in je ellebogen en breng je armen rustig samen." },
  row: { label: "Rug · roeien", ids: ["row", "dbrow", "cablerow", "bandrow"], tip: "Trek je ellebogen naar achteren zonder je romp mee te zwaaien." },
  pulldown: { label: "Rug · verticaal trekken", ids: ["pulldown", "pullup", "bandpulldown"], tip: "Trek vanuit je rug en houd je schouders weg van je oren." },
  squat: { label: "Benen · squat", ids: ["squat", "goblet", "bwsquat", "legpress"], tip: "Houd je voeten stevig en laat je knieën in de richting van je tenen bewegen." },
  lunge: { label: "Benen · één been", ids: ["lunge", "split", "stepup"], tip: "Beweeg gecontroleerd en voer de aangegeven herhalingen per been uit." },
  hinge: { label: "Benen · heupbuiging", ids: ["rdl", "dbrdl"], tip: "Duw je heupen naar achteren, houd je rug neutraal en het gewicht dicht bij je benen." },
  hip: { label: "Benen · bilspieren", ids: ["hipthrust", "bridge"], tip: "Duw vanuit je hielen en strek je heupen zonder je onderrug te overstrekken." },
  overhead: { label: "Schouders · duwen", ids: ["shoulder", "arnoldpress", "pikepushup"], tip: "Span je buik aan en houd de beweging rustig, zonder je rug hol te trekken." },
  lateral: { label: "Schouders · zijwaarts heffen", ids: ["lateral", "cablelateral"], tip: "Hef gecontroleerd tot ongeveer schouderhoogte en vermijd zwaaien." },
  curl: { label: "Armen · biceps", ids: ["curl", "hammer", "bandcurl"], tip: "Houd je bovenarmen stil en laat het gewicht langzaam zakken." },
  triceps: { label: "Armen · triceps", ids: ["pushdown", "overheadext", "skullcrusher"], tip: "Houd je bovenarmen zo stil mogelijk terwijl je je ellebogen strekt." },
  brace: { label: "Buik · stabiliteit", ids: ["plank", "deadbug", "benchplank"], tip: "Span je buik aan, blijf ademen en houd je onderrug in een neutrale positie." },
  crunch: { label: "Buik · buigen", ids: ["crunch", "cablecrunch"], tip: "Breng je ribben gecontroleerd richting je bekken en trek niet aan je nek." }
};
const movementOf = (ex) => Object.entries(movements).find(([, movement]) => movement.ids.includes(ex.id))?.[0] || ex.movement || "";
const exerciseTip = (ex) => movements[movementOf(ex)]?.tip || "Voer de oefening rustig en gecontroleerd uit.";
const repUnit = (ex) => ex.measurement === "seconds" ? "sec" : "reps";

// Standaard workouts
const templates = [
  { id: "full", name: "Full Body", category: "Gym", description: "Een sterke basis voor je hele lichaam.", ids: ["squat", "bench", "row", "shoulder", "plank"] },
  { id: "legs", name: "Leg Day", category: "Gym", description: "Geef je benen en core alle aandacht.", ids: ["squat", "lunge", "plank"] },
  { id: "upper", name: "Upper Body", category: "Gym", description: "Borst, rug, schouders en armen in één sessie.", ids: ["bench", "pulldown", "shoulder", "curl"] },
  { id: "push", name: "Push Day", category: "Gym", description: "Bouw aan je borst, schouders en triceps.", ids: ["inclinebench", "shoulder", "fly", "lateral", "pushdown"] },
  { id: "pull", name: "Pull Day", category: "Gym", description: "Een training voor je rug en biceps.", ids: ["pulldown", "row", "cablerow", "curl", "hammer"] },
  { id: "dumbbells", name: "Dumbbell Only", category: "Thuis", description: "Een complete training met dumbbells en een bankje.", ids: ["goblet", "dbbench", "dbrow", "dbrdl", "shoulder"] },
  { id: "bodyweight", name: "Bodyweight Basics", category: "Thuis", description: "Train zonder gewichten. Voor de incline push-up gebruik je een stevig verhoogd vlak.", ids: ["bwsquat", "inclinepushup", "split", "bridge", "deadbug"], sets: 2 },
  { id: "core", name: "Core Control", category: "Thuis", description: "Een korte sessie voor buikspieren en stabiliteit.", ids: ["plank", "deadbug", "crunch"] },
  { id: "glutes", name: "Glutes & Legs", category: "Gym", description: "Focus op je billen en de achterkant van je benen.", ids: ["hipthrust", "rdl", "split", "legpress"] },
  { id: "arnold", name: "Arnold · Foundation", category: "Bekende namen", person: "Arnold Schwarzenegger", initials: "AS", description: "Full body, gebaseerd op het openbare intermediate-voorbeeld van The Pump.", ids: ["squat", "dbbench", "dbrow", "dbrdl", "goblet", "cablecrunch"], prescriptions: [{ sets: 3, reps: 10 }, { sets: 2, reps: 10 }, { sets: 2, reps: 10 }, { sets: 2, reps: 10 }, { sets: 2, reps: 10 }, { sets: 2, reps: 10 }], source: "https://arnoldspumpclub.com/blogs/newsletter/welcome-pump-app", sourceLabel: "Arnold’s Pump Club", sourceNote: "Fitnessity-variant van het openbare intermediate-voorbeeld: de front squat is een goblet squat; supersets worden als losse oefeningen gelogd en rusttijden zijn toegevoegd." },
  { id: "hemsworth", name: "Chris · Upper Power", category: "Bekende namen", person: "Chris Hemsworth", initials: "CH", description: "Borst en triceps, geïnspireerd op de openbare Centr Power-thuistraining.", ids: ["dbbench", "pushup", "cablefly", "skullcrusher", "pushdown"], sets: 3, source: "https://centr.com/blogs/thewarmup/chris-hemsworth-workout-routine", sourceLabel: "Centr · Chris Hemsworth", sourceNote: "Fitnessity-variant: gewone dumbbell press, cable fly en pushdown vervangen de alternating- en bandvarianten. Eén push-upvariant; drie losse sets per oefening met eigen rusttijden." },
  { id: "jeff", name: "Jeff · Minimalist", category: "Bekende namen", person: "Jeff Nippard", initials: "JN", description: "Een eigen compacte full-bodytraining, geïnspireerd op minder sets met meer focus.", ids: ["legpress", "dbbench", "pulldown", "dbrdl", "lateral", "curl"], sets: 2, source: "https://jeffnippard.com/products/the-essentials-program", sourceLabel: "Jeff Nippard · Essentials", sourceNote: "Eigen Fitnessity-oefenkeuze, geïnspireerd op de openbare uitleg over lage trainingsomvang. Dit is geen kopie van het betaalde Essentials-programma." }
];

// Begininstellingen
function defaultState() {
  return {
    profile: {
      name: "Sporter",
      goal: "Spieropbouw",
      kcal: 2400,
      unit: "kg"
    },
    favorites: [],
    avoidedExercises: [],
    workoutPreferences: {},
    workoutChoices: {},
    customExercises: [],
    customWorkouts: [],
    history: [],
    meals: [],
    pulse: "medium"
  };
}

// Opgeslagen gegevens ophalen
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !saved.profile) return defaultState();

    const base = defaultState();
    return {
      ...base,
      ...saved,
      profile: { ...base.profile, ...saved.profile }
    };
  } catch {
    return defaultState();
  }
}

let state = loadState();
let session = loadSession();
let tick = null;
let planWorkoutId = "full";
let alternativeContext = null;
let workoutFilter = "";

const allExercises = () => [...exercises, ...state.customExercises];
const allWorkouts = () => [...templates, ...state.customWorkouts];
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const saveSession = () => session
  ? localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  : localStorage.removeItem(SESSION_KEY);
function workoutSlots(workout) {
  return workout.ids.map((baseId, index) => {
    const choices = state.workoutChoices[workout.id] || {};
    const selectedId = Object.hasOwn(choices, index) ? choices[index] : baseId;
    const exercise = allExercises().find((ex) => ex.id === selectedId);
    return { baseId, index, exercise, skipped: !exercise || state.avoidedExercises.includes(selectedId) };
  });
}
const availableExercises = (workout) => workoutSlots(workout).filter((slot) => !slot.skipped).map((slot) => ({
  ...slot.exercise, ...(workout.sets ? { sets: workout.sets } : {}), ...workout.prescriptions?.[slot.index], slotIndex: slot.index
}));

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    return saved && Number.isFinite(saved.start) && Array.isArray(saved.exercises) && saved.exercises.length
      ? saved : null;
  } catch { return null; }
}

function preferenceButtons(id, type = "exercise") {
  const liked = type === "workout" ? state.workoutPreferences[id] === "like" : state.favorites.includes(id);
  const avoided = type === "workout" ? state.workoutPreferences[id] === "avoid" : state.avoidedExercises.includes(id);
  return `<div class="preference-buttons" role="group" aria-label="Voorkeur voor ${escapeHtml((type === "workout" ? allWorkouts() : allExercises()).find((item) => item.id === id)?.name || id)}">
    <button class="preference-btn ${liked ? "is-liked" : ""}" data-preference="like" data-preference-id="${escapeHtml(id)}" data-preference-type="${type}" aria-pressed="${liked}">${icon("heart")} ${type === "workout" ? "Fijne workout" : "Fijn"}</button>
    <button class="preference-btn ${avoided ? "is-avoided" : ""}" data-preference="avoid" data-preference-id="${escapeHtml(id)}" data-preference-type="${type}" aria-pressed="${avoided}">${icon("avoid")} Liever niet</button>
  </div>`;
}

// Kleine melding tonen
const notice = (message) => {
  $("toastMessage").textContent = message;
  bootstrap.Toast.getOrCreateInstance($("appToast"), {
    delay: 2800
  }).show();
};

// Wisselen tussen pagina's
function showPage(page, updateHistory = true) {
  if (page === "session" && !session) page = "workouts";
  if (!$("page-" + page)) return;
  document.body.classList.toggle("training-mode", page === "session");
  const hash = page === "plan" ? "#plan/" + encodeURIComponent(planWorkoutId) : "#" + page;
  if (updateHistory && location.hash !== hash) history.pushState(null, "", hash);

  document.querySelectorAll(".page").forEach((el) => {
    el.classList.toggle("active", el.id === "page-" + page);
  });

  document.querySelectorAll("[data-page]").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  const titles = {
    home: "Dashboard",
    exercises: "Oefeningen",
    workouts: "Workouts",
    progress: "Voortgang",
    nutrition: "Voeding",
    profile: "Profiel",
    session: "Training",
    plan: "Workout samenstellen"
  };

  $("pageTitle").textContent = titles[page];
  renderAll();
  if (page === "session") renderSession();
  window.scrollTo({ top: 0, behavior: "smooth" });
  const heading = page === "session" ? $("sessionTitle") : page === "plan" ? $("planTitle") : $("pageTitle");
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

// Alles bijwerken
function renderAll() {
  renderHome();
  renderExercises();
  renderWorkouts();
  renderWorkoutPlan();
  renderProgress();
  renderNutrition();
  renderProfile();
}

// Dashboard
function renderHome() {
  const firstName = state.profile.name.trim().split(/\s+/)[0] || "Sporter";

  $("greeting").textContent = `Hey ${firstName}, klaar om sterker te worden?`;
  $("avatar").textContent = firstName.charAt(0).toUpperCase();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const week = state.history.filter((w) => new Date(w.date) >= start);

  $("statWeek").textContent = week.length;
  $("statMinutes").textContent = week.reduce((n, w) => n + w.minutes, 0);
  $("statSets").textContent = week.reduce((n, w) => n + w.sets.length, 0);
  $("statGoal").textContent = state.profile.goal;

  document.querySelectorAll("[data-pulse]").forEach((b) => {
    b.classList.toggle("selected", b.dataset.pulse === state.pulse);
  });

  const suggestions = {
    low: {
      id: "upper",
      text: "Doe vandaag een rustige Upper Body workout en neem extra rust."
    },
    medium: {
      id: "full",
      text: "Je voelt je goed: Full Body is een mooie keuze."
    },
    high: {
      id: "legs",
      text: "Veel energie? Ga voor een uitdagende Leg Day!"
    }
  };

  const suggested = suggestions[state.pulse] || suggestions.medium;
  const candidates = allWorkouts().filter((w) => state.workoutPreferences[w.id] !== "avoid" && availableExercises(w).length);
  candidates.sort((a, b) => {
    const score = (w) => (state.workoutPreferences[w.id] === "like" ? 100 : 0)
      + (w.id === suggested.id ? 10 : 0)
      + availableExercises(w).filter((ex) => state.favorites.includes(ex.id)).length;
    return score(b) - score(a);
  });
  const choice = candidates[0];
  if (!choice) {
    $("pulseRecommendation").innerHTML = '<p class="mb-2">Er past nu geen workout bij je voorkeuren. Pas je keuzes aan of maak een eigen schema.</p><button class="btn btn-soft btn-sm" data-page="workouts">Bekijk workouts →</button>';
    return;
  }

  $("pulseRecommendation").innerHTML = `
    <p class="eyebrow mb-2">JOUW MATCH · ${escapeHtml(choice.name)}</p>
    <p class="mb-3">${choice.id === suggested.id ? suggested.text : "Een training die past bij jouw voorkeuren. Pak je volgende set."}</p>
    <button class="btn btn-accent btn-sm" data-start="${choice.id}">
      Start aanbevolen workout →
    </button>
  `;
}

// Oefeningen weergeven
function renderExercises() {
  const query = $("exerciseSearch").value.trim().toLowerCase();
  const group = $("muscleFilter").value;
  const equipment = $("equipmentFilter").value;
  const preference = $("exercisePreference").value;
  $("exerciseTotal").textContent = allExercises().length;
  $("exerciseLiked").textContent = allExercises().filter((ex) => state.favorites.includes(ex.id)).length;
  $("exerciseAvoided").textContent = allExercises().filter((ex) => state.avoidedExercises.includes(ex.id)).length;
  document.querySelectorAll("[data-library-view]").forEach((button) => button.setAttribute("aria-pressed", button.dataset.libraryView === preference));
  $("muscleChips").innerHTML = ["", "Borst", "Rug", "Benen", "Schouders", "Armen", "Buik"].map((name) => `<button class="filter-chip ${group === name ? "selected" : ""}" data-muscle="${name}" aria-pressed="${group === name}">${name || "Alle spiergroepen"}<span>${allExercises().filter((ex) => !name || ex.group === name).length}</span></button>`).join("");

  const list = allExercises().filter((ex) =>
    (!query || `${ex.name} ${ex.group} ${ex.equipment} ${movements[movementOf(ex)]?.label || ""}`.toLowerCase().includes(query)) &&
    (!group || ex.group === group) &&
    (!equipment || ex.equipment === equipment) &&
    (!preference || (preference === "like" ? state.favorites.includes(ex.id) : state.avoidedExercises.includes(ex.id)))
  );
  $("exerciseResultCount").textContent = `${list.length} van ${allExercises().length} oefeningen${group ? " · " + group : ""}`;
  $("resetExerciseFilters").hidden = !(query || group || equipment || preference);

  $("exerciseList").innerHTML = list.length ? list.map((ex) => `
    <div class="col-md-6 col-xl-4">
      <article class="panel exercise-card library-card ${state.avoidedExercises.includes(ex.id) ? "library-card-avoided" : ""}">
        <div class="library-card-top"><span class="movement-symbol" aria-hidden="true">${icon(ex.group === "Buik" ? "progress" : "exercises")}</span><span class="library-group">${escapeHtml(ex.group)}</span>${state.favorites.includes(ex.id) ? `<span class="library-saved" aria-label="Favoriet">${icon("heart")}</span>` : ""}</div>
        <h3>${escapeHtml(ex.name)}</h3>
        <p class="library-equipment">${escapeHtml(ex.equipment)}<span>·</span>${escapeHtml(movements[movementOf(ex)]?.label.split(" · ")[1] || "Eigen oefening")}</p>
        <div class="exercise-prescription"><span><b>${ex.sets}</b> sets</span><span><b>${ex.reps}</b> ${repUnit(ex)}</span><span>${icon("clock")} ${ex.rest}s rust</span></div>
        ${preferenceButtons(ex.id)}
        ${state.avoidedExercises.includes(ex.id) ? '<p class="preference-note">Wordt overgeslagen in je workouts.</p>' : ""}
        <details class="exercise-details"><summary>Uitvoering & alternatieven <span aria-hidden="true">+</span></summary><p>${escapeHtml(exerciseTip(ex))}</p><button class="btn btn-soft btn-sm w-100" data-library-alternatives="${escapeHtml(ex.id)}">${icon("swap")} Bekijk alternatieven</button></details>
      </article>
    </div>
  `).join("") : `
    <div class="col-12">
      <div class="library-empty">${icon("search")}<h3>Geen oefeningen gevonden</h3><p>Probeer een andere zoekterm of maak je filters wat ruimer.</p><button class="btn btn-soft" data-reset-filters>Alle oefeningen bekijken</button></div>
    </div>
  `;

  const chosen = new Set([...document.querySelectorAll("[name=chosenExercise]:checked")].map((input) => input.value));
  $("exerciseChooser").innerHTML = allExercises().map((ex) => `
    <label>
      <input type="checkbox" class="form-check-input"
        value="${escapeHtml(ex.id)}" name="chosenExercise" ${chosen.has(ex.id) ? "checked" : ""}>
      <span>${escapeHtml(ex.name)}<small>${escapeHtml(ex.group)}</small></span>
    </label>
  `).join("");
}

// Trainingsschema's weergeven
function renderWorkouts() {
  $("resumeWorkout").innerHTML = session ? `<div class="resume-banner"><div><span class="eyebrow">JE TRAINING STAAT KLAAR</span><h3>${escapeHtml(session.name)}</h3><p class="text-soft mb-0">Je ingevulde sets zijn bewaard. Pak de draad weer op.</p></div><button class="btn btn-accent" id="resumeButton">${icon("play")} Verder trainen</button></div>` : "";

  $("workoutFilters").innerHTML = ["", "Gym", "Thuis", "Bekende namen", "Eigen"].map((category) => `<button class="filter-chip ${workoutFilter === category ? "selected" : ""}" data-workout-filter="${category}" aria-pressed="${workoutFilter === category}">${category || "Alle workouts"}<span>${allWorkouts().filter((w) => !category || (w.category || "Eigen") === category).length}</span></button>`).join("");
  $("workoutCards").innerHTML = allWorkouts().filter((w) => !workoutFilter || (w.category || "Eigen") === workoutFilter).map((w, i) => `
    <div class="col-md-6 col-xl-4">
      <div class="panel workout-card ${state.workoutPreferences[w.id] === "avoid" ? "workout-avoided" : ""}">
        <div class="workout-card-top"><span class="eyebrow">${escapeHtml(w.person ? "GEBASEERD OP · " + w.sourceLabel : w.category || "JOUW PROGRAMMA")}</span><span class="workout-number" aria-hidden="true">${w.initials || String(i + 1).padStart(2, "0")}</span></div>
        <h3 class="mt-2">${escapeHtml(w.name)}</h3>
        <p class="text-soft small">
          ${escapeHtml(w.description || "Jouw eigen schema")}
        </p>
        ${w.person ? `<p class="workout-person">${icon("profile")} ${escapeHtml(w.person)} <span>Fitnessity-variant</span></p>` : ""}
        <div class="workout-metrics"><span><strong>${availableExercises(w).length}</strong> oefeningen</span><span><strong>${availableExercises(w).reduce((n, ex) => n + ex.sets, 0)}</strong> sets</span></div>
        ${preferenceButtons(w.id, "workout")}
        <p class="preference-note">${state.workoutPreferences[w.id] === "avoid" ? "Wordt niet aanbevolen in FIT PULSE." : state.workoutPreferences[w.id] === "like" ? "Favoriet · krijgt voorrang in FIT PULSE." : "Maak deze training persoonlijk."}${w.ids.length !== availableExercises(w).length ? ` ${w.ids.length - availableExercises(w).length} oefening(en) overgeslagen.` : ""}</p>
        <button class="btn btn-accent w-100" data-start="${escapeHtml(w.id)}">
          ${icon("workouts")} Kies je oefeningen →
        </button>
      </div>
    </div>
  `).join("") || '<div class="col-12"><p class="empty">Nog geen eigen schema’s. Maak er hierboven één aan.</p></div>';

  $("workoutHistory").innerHTML = state.history.length
    ? state.history.slice(-5).reverse().map((w) => `
      <div class="list-line">
        <div>
          <b>${escapeHtml(w.name)}</b>
          <small>
            ${new Date(w.date).toLocaleDateString("nl-NL")}
            · ${w.minutes} min · ${w.sets.length} sets
          </small>
        </div>
        <span class="tag">Voltooid</span>
      </div>
    `).join("")
    : `<div class="empty">Je hebt nog geen workouts afgerond.</div>`;
}

function openWorkoutPlan(id) {
  if (session) {
    notice("Je hebt al een training lopen. Rond die af of stop hem eerst.");
    openSession();
    return;
  }
  if (!allWorkouts().some((workout) => workout.id === id)) return;
  planWorkoutId = id;
  showPage("plan");
}

function renderWorkoutPlan() {
  const workout = allWorkouts().find((w) => w.id === planWorkoutId);
  if (!workout) return;
  const selected = availableExercises(workout);
  $("planTitle").textContent = workout.name;
  $("planDescription").textContent = workout.description || "Jouw eigen schema, met ruimte voor jouw keuzes.";
  $("planMetrics").innerHTML = `<span><strong>${selected.length}</strong> oefeningen</span><span><strong>${selected.reduce((n, ex) => n + ex.sets, 0)}</strong> sets</span>`;
  $("planSource").innerHTML = workout.source ? `<div class="workout-source"><span class="source-avatar" aria-hidden="true">${workout.initials}</span><div><p><strong>${escapeHtml(workout.person)}</strong> · Fitnessity-variant</p><p>${escapeHtml(workout.sourceNote)}</p><a href="${escapeHtml(workout.source)}" target="_blank" rel="noopener noreferrer">Lees het oorspronkelijke programma bij ${escapeHtml(workout.sourceLabel)} ↗</a></div></div>` : "";
  $("planExercises").innerHTML = workoutSlots(workout).map((slot) => {
    const base = slot.exercise || allExercises().find((ex) => ex.id === slot.baseId);
    if (!base) return "";
    const ex = { ...base, ...(workout.sets ? { sets: workout.sets } : {}), ...workout.prescriptions?.[slot.index] };
    return `<article class="plan-exercise ${slot.skipped ? "plan-skipped" : ""}"><span class="exercise-index">${String(slot.index + 1).padStart(2, "0")}</span><div class="plan-exercise-info"><span class="eyebrow">${escapeHtml(ex.group)} · ${escapeHtml(ex.equipment)}</span><h4>${escapeHtml(ex.name)}</h4><p>${slot.skipped ? 'Wordt overgeslagen · kies een alternatief om dit onderdeel in te vullen.' : `${ex.sets} sets × ${ex.reps} ${repUnit(ex)} · ${ex.rest} sec rust`}</p>${slot.exercise && slot.exercise.id !== slot.baseId ? `<small>Vervangt ${escapeHtml(allExercises().find((item) => item.id === slot.baseId)?.name || "de standaardoefening")}</small>` : ""}</div><div class="plan-exercise-actions"><button class="btn btn-soft btn-sm" data-plan-alternatives="${slot.index}">${icon("swap")} ${slot.skipped ? "Kies alternatief" : "Wissel"}</button><button class="plan-skip-btn" data-plan-skip="${slot.index}">${slot.skipped ? (slot.exercise && state.avoidedExercises.includes(slot.exercise.id) ? "Weer toestaan" : "Standaard terug") : "Overslaan"}</button></div></article>`;
  }).join("");
  $("beginWorkout").disabled = !selected.length;
  $("planStartHint").textContent = selected.length ? `${selected.length} oefeningen klaar. Eerst opwarmen, dan gaan!` : "Kies minimaal één oefening om te starten. Bij ‘Liever niet’ kun je een alternatief kiezen.";
}

function changePlanExercise(index, id) {
  const workout = allWorkouts().find((w) => w.id === planWorkoutId);
  if (!workout || !Number.isInteger(index) || index < 0 || index >= workout.ids.length) return;
  state.workoutChoices[workout.id] ??= {};
  if (id === workout.ids[index]) delete state.workoutChoices[workout.id][index];
  else state.workoutChoices[workout.id][index] = id;
  save();
  renderWorkoutPlan();
  renderWorkouts();
  renderHome();
}

function alternativeTarget() {
  if (!alternativeContext) return null;
  const { type, index, exerciseId } = alternativeContext;
  if (type === "session") return session?.exercises[index];
  if (type === "plan") {
    const workout = allWorkouts().find((w) => w.id === planWorkoutId);
    const slot = workout && workoutSlots(workout)[index];
    return slot && (slot.exercise || allExercises().find((ex) => ex.id === slot.baseId));
  }
  return allExercises().find((ex) => ex.id === exerciseId);
}

function getAlternatives(ex, usedIds = []) {
  const movement = movementOf(ex);
  return allExercises().filter((candidate) => candidate.id !== ex.id
    && !usedIds.includes(candidate.id)
    && !state.avoidedExercises.includes(candidate.id)
    && (movement ? movementOf(candidate) === movement : candidate.group === ex.group))
    .sort((a, b) => Number(state.favorites.includes(b.id)) - Number(state.favorites.includes(a.id))
      || Number(b.equipment === ex.equipment) - Number(a.equipment === ex.equipment)
      || a.name.localeCompare(b.name, "nl"));
}

function currentAlternatives() {
  const ex = alternativeTarget();
  if (!ex) return [];
  let usedIds = [];
  if (alternativeContext.type === "plan") {
    const workout = allWorkouts().find((w) => w.id === planWorkoutId);
    usedIds = workoutSlots(workout).filter((slot) => slot.index !== alternativeContext.index && !slot.skipped).map((slot) => slot.exercise.id);
  } else if (alternativeContext.type === "session") {
    usedIds = session.exercises.filter((item, index) => index !== alternativeContext.index && !state.avoidedExercises.includes(item.id)).map((item) => item.id);
  }
  return getAlternatives(ex, usedIds);
}

function openAlternatives(type, indexOrId) {
  alternativeContext = type === "library" ? { type, exerciseId: indexOrId } : { type, index: Number(indexOrId) };
  const ex = alternativeTarget();
  if (!ex) { alternativeContext = null; return; }
  $("alternativeEquipment").value = "";
  $("alternativeEquipment").innerHTML = '<option value="">Alle materialen</option>' + [...new Set(currentAlternatives().map((item) => item.equipment))].sort().map((equipment) => `<option>${escapeHtml(equipment)}</option>`).join("");
  renderAlternatives();
  if (!$("alternativeDialog").open) $("alternativeDialog").showModal();
}

function renderAlternatives() {
  const ex = alternativeTarget();
  if (!ex) return;
  $("alternativeTitle").textContent = `Alternatieven voor ${ex.name}`;
  $("alternativeDescription").textContent = `${movements[movementOf(ex)]?.label || ex.group + " · zelfde spiergroep"}. Je favorieten staan bovenaan. Oefeningen met ‘Liever niet’ en oefeningen die al in deze training staan, laten we weg.${alternativeContext.type === "session" ? " Je reeds afgeronde sets blijven bewaard bij de oorspronkelijke oefening." : ""}`;
  const list = currentAlternatives().filter((item) => !$("alternativeEquipment").value || item.equipment === $("alternativeEquipment").value);
  $("alternativeList").innerHTML = list.length ? list.map((item) => `<article class="alternative-option"><div><span class="eyebrow">${escapeHtml(item.equipment)}${state.favorites.includes(item.id) ? " · FAVORIET" : ""}</span><h3>${escapeHtml(item.name)}</h3><p>${item.reps} ${repUnit(item)} · ${item.rest} sec rust</p><small>${escapeHtml(exerciseTip(item))}</small></div><button class="btn ${alternativeContext.type === "library" ? "btn-soft" : "btn-accent"} btn-sm" ${alternativeContext.type === "library" ? "data-view-exercise" : "data-choose-alternative"}="${escapeHtml(item.id)}">${alternativeContext.type === "library" ? "Bekijk" : "Kies deze"} →</button></article>`).join("") : '<div class="library-empty"><h3>Geen passend alternatief</h3><p>Probeer een ander materiaal of pas je voorkeuren aan in de oefeningenbibliotheek. Je kunt dit onderdeel ook overslaan.</p></div>';
}

function closeAlternatives() {
  $("alternativeDialog").close();
  alternativeContext = null;
}

function chooseAlternative(id) {
  const replacement = currentAlternatives().find((ex) => ex.id === id);
  const current = alternativeTarget();
  if (!replacement || !current) return;
  if (alternativeContext.type === "plan") {
    changePlanExercise(alternativeContext.index, id);
  } else if (alternativeContext.type === "session") {
    const pending = current.done.filter((set) => !set).length;
    if (!pending) { notice("Deze oefening is al afgerond."); return; }
    session.archivedSets ??= [];
    session.archivedSets.push(...current.done.filter(Boolean).map((set) => ({ exercise: current.name, ...set })));
    session.exercises[alternativeContext.index] = { ...replacement, sets: pending, done: Array.from({ length: pending }, () => null), drafts: [], slotIndex: current.slotIndex, replacedFrom: current.name };
    saveSession();
    renderSession();
    // Bewaar de nieuwe oefenkeuze voor de volgende keer, indien het schema nog bestaat.
    const workout = allWorkouts().find((w) => w.id === session.workoutId);
    if (workout && Number.isInteger(current.slotIndex)) {
      state.workoutChoices[workout.id] ??= {};
      state.workoutChoices[workout.id][current.slotIndex] = id;
      save();
    }
  }
  closeAlternatives();
  notice(`${replacement.name} staat in je training.`);
}

// Voortgang tonen
function renderProgress() {
  $("progressWorkouts").textContent = state.history.length;

  $("progressMinutes").textContent = state.history.reduce(
    (n, w) => n + w.minutes, 0
  );

  $("progressSets").textContent = state.history.reduce(
    (n, w) => n + w.sets.length, 0
  );

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d;
  });

  const counts = days.map((d) =>
    state.history.filter((w) => todayKey(w.date) === todayKey(d)).length
  );

  const max = Math.max(1, ...counts);

  $("weekChart").innerHTML = days.map((d, i) => `
    <div class="chart-col">
      <b>${counts[i]}</b>
      <div class="chart-bar"
        style="height:${Math.max(4, counts[i] / max * 125)}px"></div>
      <span>${d.toLocaleDateString("nl-NL", { weekday: "short" })}</span>
    </div>
  `).join("");

  const records = new Map();

  state.history.forEach((w) =>
    w.sets.forEach((s) => {
      if (s.weightKg > (records.get(s.exercise) || 0)) {
        records.set(s.exercise, s.weightKg);
      }
    })
  );

  $("recordsList").innerHTML = records.size
    ? [...records.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, kg]) => `
        <div class="list-line">
          <b>${escapeHtml(name)}</b>
          <span>${kgToDisplay(kg).toFixed(1)} ${state.profile.unit}</span>
        </div>
      `).join("")
    : `<div class="empty">Je hebt nog geen gewichten geregistreerd.</div>`;
}

// Voedingstracker
function renderNutrition() {
  const today = state.meals.filter((m) => todayKey(m.date) === todayKey());

  const kcal = today.reduce((n, m) => n + m.kcal, 0);
  const protein = today.reduce((n, m) => n + m.protein, 0);

  $("foodCalories").textContent = Math.round(kcal);
  $("foodProtein").textContent = Number(protein.toFixed(1));
  $("foodMeals").textContent = today.length;

  $("calorieBar").style.width =
    `${Math.min(100, kcal / state.profile.kcal * 100)}%`;

  $("calorieHint").textContent = `Dagdoel: ${state.profile.kcal} kcal`;

  $("foodList").innerHTML = today.length
    ? today.slice().reverse().map((m) => `
      <div class="list-line">
        <div>
          <b>${escapeHtml(m.name)}</b>
          <small>
            ${escapeHtml(m.type)} · ${m.kcal} kcal · ${m.protein} g eiwit
          </small>
        </div>
        <button class="btn btn-soft btn-sm"
          data-remove-meal="${escapeHtml(m.id)}">
          Verwijder
        </button>
      </div>
    `).join("")
    : `<div class="empty">Nog geen maaltijden toegevoegd vandaag.</div>`;
}

// Profielinstellingen
function renderProfile() {
  $("profileName").value = state.profile.name;
  $("profileGoal").value = state.profile.goal;
  $("profileKcal").value = state.profile.kcal;
  $("profileUnit").value = state.profile.unit;
}

// Workout openen
function openSession() {
  if (session) showPage("session");
}

// Workout starten
function startWorkout(id) {
  if (session) {
    notice("Er is al een workout bezig. Open die eerst.");
    openSession();
    return;
  }

  const workout = allWorkouts().find((w) => w.id === id);
  if (!workout) return;

  session = {
    workoutId: workout.id,
    name: workout.name,
    start: Date.now(),
    restUntil: 0,
    archivedSets: [],
    exercises: availableExercises(workout).map((ex) => ({
      ...ex, done: Array.from({ length: ex.sets }, () => null), drafts: []
    }))
  };

  if (!session.exercises.length) {
    session = null;
    notice("Je slaat alle oefeningen in dit schema over. Pas je voorkeuren aan.");
    return;
  }

  saveSession();
  tick = setInterval(updateSessionClock, 1000);
  openSession();
}

function draftWeight(ex, si) {
  const draft = ex.drafts?.[si];
  if (!draft) return 0;
  if (draft.unit === state.profile.unit || draft.weight === "") return draft.weight;
  const kg = draft.unit === "lbs" ? Number(draft.weight) / 2.20462 : Number(draft.weight);
  return Number(kgToDisplay(kg).toFixed(1));
}

// Sets tijdens de workout tonen
function renderSession() {
  if (!session) return;
  $("sessionTitle").textContent = session.name;
  $("sessionExerciseCount").textContent = `${session.exercises.filter((ex) => !state.avoidedExercises.includes(ex.id)).length} oefeningen`;
  $("sessionExercises").innerHTML = session.exercises.map((ex, ei) => `
    <article class="session-exercise ${state.avoidedExercises.includes(ex.id) ? "exercise-skipped" : ""}">
      <div class="session-exercise-header">
        <span class="exercise-index">${String(ei + 1).padStart(2, "0")}</span>
        <div><span class="eyebrow">${escapeHtml(ex.group)} · ${escapeHtml(ex.equipment)}</span><h3>${escapeHtml(ex.name)}</h3><small class="text-soft">${ex.sets} sets × ${ex.reps} ${repUnit(ex)} · ${ex.rest} sec rust</small>${ex.replacedFrom ? `<p class="session-replaced">Vervangt ${escapeHtml(ex.replacedFrom)} · resterende sets</p>` : ""}</div>
      </div>
      <div class="session-exercise-tools">${preferenceButtons(ex.id)}<button class="btn btn-soft btn-sm" data-session-alternatives="${ei}" ${ex.done.every(Boolean) ? "disabled" : ""}>${icon("swap")} Alternatieven</button></div>
      ${state.avoidedExercises.includes(ex.id) ? '<p class="skip-message">Resterende sets overgeslagen. Afgeronde sets blijven bewaard. Tik nogmaals op ‘Liever niet’ om verder te gaan.</p>' : ""}
      ${ex.done.map((s, si) => state.avoidedExercises.includes(ex.id) && !s ? "" : `
        <div class="session-set ${s ? "done" : ""}"
          data-session-row="${ei}-${si}">

          <span class="set-number align-self-center fw-bold">
            Set ${si + 1}
          </span>

          <div>
            <label class="form-label">
              ${ex.measurement === "seconds" ? "Seconden" : "Reps"}
              <input type="number" class="form-control set-reps"
                min="0" max="${ex.measurement === "seconds" ? 3600 : 1000}"
                value="${escapeHtml(s ? s.reps : ex.drafts?.[si]?.reps ?? ex.reps)}"
                ${s ? "disabled" : ""}>
            </label>
          </div>

          <div>
            <label class="form-label">
              Gewicht (${state.profile.unit})
              <input type="number" class="form-control set-weight"
                min="0" max="2000" step="0.5"
                value="${escapeHtml(s ? kgToDisplay(s.weightKg).toFixed(1) : draftWeight(ex, si))}"
                ${s ? "disabled" : ""}>
            </label>
          </div>

          <div class="set-action">
            <button
              class="btn ${s ? "btn-soft" : "btn-accent"} btn-sm"
              data-complete="${ei}-${si}"
              ${s ? "disabled" : ""}>
              ${s ? "✓ Klaar" : "✓ Set klaar"}
            </button>
          </div>
        </div>
      `).join("")}
    </article>
  `).join("");

  if (session.archivedSets?.length) {
    const names = [...new Set(session.archivedSets.map((set) => set.exercise))].join(", ");
    $("sessionExercises").innerHTML += `<div class="archived-sets">✓ ${session.archivedSets.length} eerdere set(s) bewaard van ${escapeHtml(names)}. Ze tellen mee in je voortgang en geschiedenis.</div>`;
  }

  updateSessionClock();
}

// Tijd en rusttimer bijwerken
function updateSessionClock() {
  if (!session) return;

  const elapsed = Math.floor((Date.now() - session.start) / 1000);

  $("workoutTime").textContent = formatTime(elapsed);

  const rest = Math.max(0, Math.ceil(((session.restUntil || 0) - Date.now()) / 1000));
  $("restTime").textContent = formatTime(rest);
  $("restHint").textContent = rest ? "Adem uit. Laad op voor je volgende set." : session.restUntil ? "Rust voorbij. Klaar voor je volgende set!" : "Start na elke afgeronde set.";
  $("skipRest").disabled = !rest;

  const done = session.exercises.reduce(
    (n, ex) => n + ex.done.filter(Boolean).length, session.archivedSets?.length || 0
  );

  const total = session.exercises.reduce(
    (n, ex) => n + (state.avoidedExercises.includes(ex.id) ? ex.done.filter(Boolean).length : ex.done.length), session.archivedSets?.length || 0
  );

  $("workoutSetCount").textContent = `${done} / ${total}`;
  const percent = total ? Math.round(done / total * 100) : 0;
  $("sessionProgressBar").style.width = percent + "%";
  $("sessionProgress").setAttribute("aria-valuenow", percent);
  $("sessionProgressHint").textContent = !total ? "Alle oefeningen overgeslagen. Zet een oefening terug om te trainen." : done === total ? "Alle sets klaar. Rond je training af!" : done ? `Nog ${total - done} sets. Blijf gaan!` : "Klaar voor je eerste set?";
}

// Set afvinken en opslaan
function completeSet(index) {
  if (!session) return;

  const [ei, si] = index.split("-").map(Number);
  const ex = session.exercises[ei];

  const row = document.querySelector(
    `[data-session-row="${ei}-${si}"]`
  );

  if (!ex || !row || ex.done[si] || state.avoidedExercises.includes(ex.id)) return;

  const reps = Number(row.querySelector(".set-reps").value);
  const weight = Number(row.querySelector(".set-weight").value);

  if (
    !Number.isFinite(reps) ||
    reps < 0 ||
    reps > (ex.measurement === "seconds" ? 3600 : 1000) ||
    !Number.isInteger(reps) ||
    !Number.isFinite(weight) ||
    weight < 0 ||
    weight > 2000 ||
    !row.querySelector(".set-reps").value ||
    !row.querySelector(".set-weight").value
  ) {
    notice("Vul geldige reps en gewicht in.");
    return;
  }

  ex.done[si] = {
    reps,
    weightKg: displayToKg(weight),
    ...(ex.measurement === "seconds" ? { measurement: "seconds" } : {})
  };

  session.restUntil = Date.now() + ex.rest * 1000;
  saveSession();
  renderSession();

  notice("Set opgeslagen. Rusttimer gestart.");
}

// Training afronden of stoppen
function endSession(saveWorkout) {
  if (!session) return;

  if (saveWorkout) {
    const sets = [...(session.archivedSets || []), ...session.exercises.flatMap((ex) =>
      ex.done.filter(Boolean).map((s) => ({
        exercise: ex.name,
        ...s
      }))
    )];

    if (!sets.length) {
      notice("Vink eerst minstens één set af.");
      return;
    }

    state.history.push({
      id: uid(),
      name: session.name,
      date: new Date().toISOString(),
      minutes: Math.max(
        1,
        Math.ceil((Date.now() - session.start) / 60000)
      ),
      sets
    });

    save();
    notice("Workout afgerond! Goed gedaan.");
  } else if (!confirm("Deze workout stoppen zonder op te slaan?")) {
    return;
  }

  clearInterval(tick);
  tick = null;
  session = null;

  saveSession();
  showPage("workouts");
}

function setPreference(id, type, preference) {
  if (type === "workout") {
    if (!allWorkouts().some((w) => w.id === id)) return;
    if (state.workoutPreferences[id] === preference) delete state.workoutPreferences[id];
    else state.workoutPreferences[id] = preference;
  } else {
    if (!allExercises().some((ex) => ex.id === id)) return;
    const active = preference === "like" ? state.favorites.includes(id) : state.avoidedExercises.includes(id);
    state.favorites = state.favorites.filter((value) => value !== id);
    state.avoidedExercises = state.avoidedExercises.filter((value) => value !== id);
    if (!active) (preference === "like" ? state.favorites : state.avoidedExercises).push(id);
  }
  save();
  renderHome();
  renderExercises();
  renderWorkouts();
  renderWorkoutPlan();
  if (session) renderSession();
  // Houd toetsenbordfocus op de knop die na het renderen is vervangen.
  const scope = document.querySelector(".page.active");
  const replacement = [...scope.querySelectorAll("[data-preference-id]")].find((btn) => btn.dataset.preferenceId === id && btn.dataset.preferenceType === type && btn.dataset.preference === preference);
  replacement?.focus({ preventScroll: true });
}

// Knoppen afhandelen
document.addEventListener("click", (event) => {
  const btn = event.target.closest("button,a[data-page]");
  if (!btn) return;

  // Navigatie
  if (btn.dataset.page) {
    event.preventDefault();
    showPage(btn.dataset.page);
  }

  // Training starten
  if (btn.dataset.start) openWorkoutPlan(btn.dataset.start);
  if (btn.id === "beginWorkout") startWorkout(planWorkoutId);

  if (btn.hasAttribute("data-workout-filter")) {
    workoutFilter = btn.dataset.workoutFilter;
    renderWorkouts();
  }
  if (btn.hasAttribute("data-muscle")) {
    $("muscleFilter").value = btn.dataset.muscle;
    renderExercises();
  }
  if (btn.dataset.libraryView) {
    $("exercisePreference").value = $("exercisePreference").value === btn.dataset.libraryView ? "" : btn.dataset.libraryView;
    renderExercises();
  }
  if (btn.id === "resetExerciseFilters" || btn.hasAttribute("data-reset-filters")) resetExerciseFilters();
  if (btn.hasAttribute("data-plan-alternatives")) openAlternatives("plan", btn.dataset.planAlternatives);
  if (btn.hasAttribute("data-session-alternatives")) openAlternatives("session", btn.dataset.sessionAlternatives);
  if (btn.dataset.libraryAlternatives) openAlternatives("library", btn.dataset.libraryAlternatives);
  if (btn.dataset.chooseAlternative) chooseAlternative(btn.dataset.chooseAlternative);
  if (btn.id === "closeAlternatives") closeAlternatives();
  if (btn.dataset.viewExercise) {
    const ex = allExercises().find((item) => item.id === btn.dataset.viewExercise);
    if (ex) {
      resetExerciseFilters();
      $("exerciseSearch").value = ex.name;
      closeAlternatives();
      showPage("exercises");
    }
  }
  if (btn.hasAttribute("data-plan-skip")) {
    const workout = allWorkouts().find((w) => w.id === planWorkoutId);
    const slot = workoutSlots(workout)[Number(btn.dataset.planSkip)];
    if (slot.skipped && slot.exercise && state.avoidedExercises.includes(slot.exercise.id)) setPreference(slot.exercise.id, "exercise", "avoid");
    else changePlanExercise(slot.index, slot.skipped ? slot.baseId : null);
  }
  if (btn.id === "resetWorkoutChoices") {
    delete state.workoutChoices[planWorkoutId];
    save();
    renderAll();
    notice("Standaardoefeningen teruggezet. Je voorkeuren blijven gelden.");
  }

  // FIT PULSE
  if (btn.dataset.pulse) {
    state.pulse = btn.dataset.pulse;
    save();
    renderHome();
  }

  if (btn.dataset.preference) {
    const id = btn.dataset.preferenceId;
    const offerAlternative = btn.dataset.preferenceType === "exercise" && btn.dataset.preference === "avoid" && !state.avoidedExercises.includes(id) && $("page-session").classList.contains("active");
    setPreference(id, btn.dataset.preferenceType, btn.dataset.preference);
    const index = session?.exercises.findIndex((ex) => ex.id === id && ex.done.some((set) => !set));
    if (offerAlternative && index >= 0) openAlternatives("session", index);
  }

  // Set afronden
  if (btn.dataset.complete) {
    completeSet(btn.dataset.complete);
  }

  // Maaltijd verwijderen
  if (btn.dataset.removeMeal) {
    state.meals = state.meals.filter(
      (m) => m.id !== btn.dataset.removeMeal
    );

    save();
    renderNutrition();
    notice("Maaltijd verwijderd.");
  }

  // Workout hervatten
  if (btn.id === "resumeButton") {
    openSession();
  }
});

// Oefeningen zoeken en filteren
["exerciseSearch", "equipmentFilter", "exercisePreference"].forEach((id) => {
  $(id).addEventListener("input", renderExercises);
});

// Eigen oefening toevoegen
$("exerciseForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("newExerciseName").value.trim();
  if (!name) return;

  state.customExercises.push({
    id: uid(),
    name,
    group: $("newExerciseGroup").value,
    movement: $("newExerciseMovement").value,
    equipment: "Eigen oefening",
    sets: Number($("newExerciseSets").value),
    reps: Number($("newExerciseReps").value),
    rest: Number($("newExerciseRest").value)
  });

  save();
  event.target.reset();
  renderExercises();
  populateEquipmentFilters();
  populateMovementChoices();
  notice("Oefening toegevoegd.");
});

// Eigen trainingsschema toevoegen
$("workoutForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const ids = [
    ...document.querySelectorAll("[name=chosenExercise]:checked")
  ].map((el) => el.value);

  const name = $("newWorkoutName").value.trim();

  if (!name || !ids.length) {
    notice("Vul een naam in en kies minstens één oefening.");
    return;
  }

  state.customWorkouts.push({
    id: uid(),
    name,
    description: "Eigen workout",
    ids
  });

  save();
  event.target.reset();
  renderWorkouts();
  notice("Schema opgeslagen.");
});

// Maaltijd toevoegen
$("foodForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("foodName").value.trim();
  const kcal = Number($("foodKcal").value);
  const protein = Number($("foodProteinInput").value);

  if (
    !name ||
    !Number.isFinite(kcal) ||
    !Number.isFinite(protein) ||
    kcal < 0 ||
    protein < 0
  ) return;

  state.meals.push({
    id: uid(),
    date: new Date().toISOString(),
    name,
    type: $("foodType").value,
    kcal,
    protein
  });

  save();
  event.target.reset();
  renderNutrition();
  notice("Maaltijd toegevoegd.");
});

// Profiel opslaan
$("profileForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("profileName").value.trim();
  if (!name) return;

  state.profile = {
    name,
    goal: $("profileGoal").value,
    kcal: Number($("profileKcal").value),
    unit: $("profileUnit").value
  };

  save();
  renderAll();
  notice("Profiel opgeslagen.");
});

// Alle gegevens verwijderen
$("clearData").addEventListener("click", () => {
  if (!confirm("Weet je zeker dat je ALLE Fitnessity-gegevens wilt verwijderen?")) {
    return;
  }

  if (session) {
    clearInterval(tick);
    tick = null;
    session = null;
  }
  localStorage.removeItem(SESSION_KEY);

  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();

  renderAll();
  showPage("home");
  notice("Alle gegevens zijn gewist.");
});

// Rusttimer overslaan
$("skipRest").addEventListener("click", () => {
  if (session) {
    session.restUntil = 0;
    saveSession();
    updateSessionClock();
  }
});

// Workout stoppen
$("cancelWorkout").addEventListener("click", () => {
  endSession(false);
});

// Workout afronden
$("finishWorkout").addEventListener("click", () => {
  endSession(true);
});

// Onvoltooide invoer bewaren, ook wanneer een andere oefening opnieuw wordt getekend.
$("sessionExercises").addEventListener("input", (event) => {
  const row = event.target.closest("[data-session-row]");
  if (!session || !row) return;
  const [ei, si] = row.dataset.sessionRow.split("-").map(Number);
  const ex = session.exercises[ei];
  if (!ex || ex.done[si]) return;
  ex.drafts ??= [];
  ex.drafts[si] = { reps: row.querySelector(".set-reps").value, weight: row.querySelector(".set-weight").value, unit: state.profile.unit };
  saveSession();
});

function resetExerciseFilters() {
  ["exerciseSearch", "muscleFilter", "equipmentFilter", "exercisePreference"].forEach((id) => { $(id).value = ""; });
  renderExercises();
}

function populateEquipmentFilters() {
  const selected = $("equipmentFilter").value;
  $("equipmentFilter").innerHTML = '<option value="">Alle materialen</option>' + [...new Set(allExercises().map((ex) => ex.equipment))].sort().map((equipment) => `<option>${escapeHtml(equipment)}</option>`).join("");
  $("equipmentFilter").value = selected;
}

function populateMovementChoices() {
  const group = $("newExerciseGroup").value || "Borst";
  $("newExerciseMovement").innerHTML = '<option value="">Zelfde spiergroep</option>' + Object.entries(movements).filter(([, movement]) => movement.label.startsWith(group + " · ")).map(([key, movement]) => `<option value="${key}">${movement.label}</option>`).join("");
}
$("newExerciseGroup").addEventListener("change", populateMovementChoices);
$("alternativeEquipment").addEventListener("change", renderAlternatives);
$("alternativeDialog").addEventListener("close", () => { alternativeContext = null; });

function showRoute() {
  const [page, id] = location.hash.slice(1).split("/");
  if (page === "plan") {
    let decoded;
    try { decoded = decodeURIComponent(id || "full"); } catch { decoded = "full"; }
    if (!allWorkouts().some((workout) => workout.id === decoded)) { showPage("workouts", false); return; }
    planWorkoutId = decoded;
  }
  showPage($("page-" + page) ? page : "home", false);
}

// App starten en browsernavigatie ondersteunen.
document.querySelectorAll(".nav-link-app, .mobile-link").forEach((button) => {
  const label = { home: "Dashboard", exercises: "Oefeningen", workouts: "Workouts", progress: "Voortgang", nutrition: "Voeding", profile: "Profiel" }[button.dataset.page];
  button.innerHTML = `${icon(button.dataset.page)}<span>${button.classList.contains("mobile-link") && button.dataset.page === "home" ? "Home" : label}</span>`;
});
window.addEventListener("popstate", showRoute);
populateEquipmentFilters();
populateMovementChoices();
if (session) tick = setInterval(updateSessionClock, 1000);
showRoute();
