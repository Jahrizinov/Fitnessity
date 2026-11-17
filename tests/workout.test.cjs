const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

// Kleine DOM-adapter: deze tests controleren de trainingsflow en opgeslagen
// gegevens. Layout en browsergedrag vallen buiten deze Node-tests.
function app(saved = new Map(), hash = '') {
  const nodes = new Map();
  const rows = new Map();
  const documentListeners = {};
  const element = (id) => ({
    id, value: '', checked: false, innerHTML: '', textContent: '', style: {},
    dataset: {}, attributes: {}, listeners: {},
    classList: {
      values: new Set(id === 'page-home' ? ['active'] : []),
      toggle(name, enabled) { enabled ? this.values.add(name) : this.values.delete(name); },
      contains(name) { return this.values.has(name); }
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this.listeners[name] = handler; },
    showModal() { this.open = true; },
    close() { this.open = false; this.listeners.close?.(); },
    querySelectorAll() { return []; },
    focus() {}
  });
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    assert.ok(!nodes.has(match[1]), `Dubbel HTML-id: ${match[1]}`);
    nodes.set(match[1], element(match[1]));
  }
  const pages = [...nodes.values()].filter((el) => el.id.startsWith('page-'));
  let now = 1000000000000;
  class TestDate extends Date { static now() { return now; } }
  const location = { hash };
  const window = { scrollTo() {}, addEventListener() {} };
  const context = vm.createContext({
    Date: TestDate, document: {
      body: element('body'),
      getElementById: (id) => nodes.get(id),
      querySelectorAll: (selector) => selector === '.page' ? pages : [],
      querySelector: (selector) => selector === '.page.active'
        ? pages.find((page) => page.classList.contains('active')) : rows.get(selector),
      addEventListener(name, handler) { documentListeners[name] = handler; }
    }, window, location,
    history: { pushState(a, b, hash) { location.hash = hash; } },
    localStorage: {
      getItem: (key) => saved.get(key) || null,
      setItem: (key, value) => saved.set(key, value),
      removeItem: (key) => saved.delete(key)
    },
    bootstrap: { Toast: { getOrCreateInstance: () => ({ show() {} }) } },
    setInterval: () => 1, clearInterval() {}, confirm: () => true
  });
  vm.runInContext(source, context);
  const run = (code) => vm.runInContext(code, context);
  const inputRow = (index, reps, weight) => {
    const inputs = { '.set-reps': { value: String(reps) }, '.set-weight': { value: String(weight) } };
    const row = { dataset: { sessionRow: index }, querySelector: (selector) => inputs[selector] };
    rows.set(`[data-session-row="${index}"]`, row);
    return row;
  };
  const click = (dataset = {}, id = '') => {
    const button = { dataset, id, hasAttribute: (name) => Object.hasOwn(dataset, name.replace(/^data-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())) };
    documentListeners.click({ target: { closest: () => button }, preventDefault() {} });
  };
  return { run, nodes, saved, location, inputRow, click, advance: (ms) => { now += ms; } };
}

test('start opent een aparte pagina; een tweede start behoudt de actieve training', () => {
  const a = app();
  a.run('startWorkout("full")');
  assert.equal(a.location.hash, '#session');
  assert.equal(a.nodes.get('sessionTitle').textContent, 'Full Body');
  assert.ok(a.nodes.get('page-session').classList.contains('active'));
  a.run('startWorkout("legs")');
  assert.equal(a.run('session.name'), 'Full Body');
});

test('voorkeuren zijn wederzijds exclusief, herstelbaar en bewaard', () => {
  const a = app();
  a.run('setPreference("squat", "exercise", "like")');
  assert.equal(a.run('state.favorites.includes("squat")'), true);
  a.run('setPreference("squat", "exercise", "avoid")');
  assert.equal(a.run('state.favorites.includes("squat")'), false);
  assert.equal(a.run('state.avoidedExercises.includes("squat")'), true);
  const restored = app(a.saved);
  restored.run('startWorkout("legs")');
  assert.equal(restored.run('session.exercises.some(ex => ex.id === "squat")'), false);
  restored.run('setPreference("squat", "exercise", "avoid")');
  assert.equal(restored.run('state.avoidedExercises.includes("squat")'), false);
});

test('FIT PULSE houdt rekening met favoriete en vermeden schema’s', () => {
  const a = app();
  a.run('setPreference("upper", "workout", "like")');
  assert.match(a.nodes.get('pulseRecommendation').innerHTML, /data-start="upper"/);
  a.run('setPreference("upper", "workout", "avoid")');
  assert.doesNotMatch(a.nodes.get('pulseRecommendation').innerHTML, /data-start="upper"/);
  a.run('allWorkouts().filter(w => state.workoutPreferences[w.id] !== "avoid").forEach(w => setPreference(w.id, "workout", "avoid"))');
  assert.match(a.nodes.get('pulseRecommendation').innerHTML, /geen workout/);
});

test('sets, invoer en rustdeadline overleven hervatten en verversen', () => {
  const a = app();
  a.run('startWorkout("full")');
  const row = a.inputRow('1-0', 8, 42.5);
  a.nodes.get('sessionExercises').listeners.input({ target: { closest: () => row } });
  a.inputRow('0-0', 8, 60);
  a.run('completeSet("0-0")');
  assert.equal(a.run('session.exercises[0].done[0].weightKg'), 60);
  assert.equal(a.nodes.get('restTime').textContent, '02:00');
  a.run('showPage("workouts"); openSession()');
  assert.match(a.nodes.get('sessionExercises').innerHTML, /value="42.5"/);
  const restored = app(a.saved, '#session');
  assert.equal(restored.run('session.exercises[0].done[0].reps'), 8);
  assert.match(restored.nodes.get('sessionExercises').innerHTML, /value="42.5"/);
  restored.advance(65000);
  restored.run('updateSessionClock()');
  assert.equal(restored.nodes.get('restTime').textContent, '00:55');
  restored.run('updateSessionClock()');
  assert.equal(restored.nodes.get('restTime').textContent, '00:55');
});

test('overslaan behoudt afgeronde sets; afronden slaat de training één keer op', () => {
  const a = app();
  a.run('startWorkout("legs")');
  a.inputRow('0-0', 8, 50);
  a.run('completeSet("0-0"); setPreference("squat", "exercise", "avoid")');
  assert.equal(a.nodes.get('workoutSetCount').textContent, '1 / 7');
  a.run('endSession(true); endSession(true)');
  assert.equal(a.run('state.history.length'), 1);
  assert.equal(a.run('state.history[0].sets[0].weightKg'), 50);
  assert.equal(a.run('session'), null);
  assert.equal(a.saved.has('fitnessity_active_session_v1'), false);
  assert.equal(a.location.hash, '#workouts');
});

test('lege of ongeldige trainingen worden niet opgeslagen; stoppen ruimt de sessie op', () => {
  const a = app();
  a.run('startWorkout("legs"); endSession(true)');
  assert.equal(a.run('state.history.length'), 0);
  assert.notEqual(a.run('session'), null);
  a.inputRow('0-0', -1, 30);
  a.run('completeSet("0-0")');
  assert.equal(a.run('session.exercises[0].done[0]'), null);
  a.run('endSession(false)');
  assert.equal(a.run('session'), null);
  assert.equal(a.saved.has('fitnessity_active_session_v1'), false);
});

test('alle oefeningen vermijden voorkomt een lege workout en biedt uitleg', () => {
  const a = app();
  a.run('templates.find(w => w.id === "legs").ids.forEach(id => setPreference(id, "exercise", "avoid")); startWorkout("legs")');
  assert.equal(a.run('session'), null);
  assert.match(a.nodes.get('toastMessage').textContent, /alle oefeningen/);
  a.run('showPage("session")');
  assert.ok(a.nodes.get('page-workouts').classList.contains('active'));
});

test('twaalf schema’s hebben geldige oefeningen; bekende namen hebben bron en toelichting', () => {
  const a = app();
  assert.equal(a.run('templates.length'), 12);
  assert.ok(a.run('exercises.length') >= 35);
  assert.equal(a.run('templates.every(w => w.ids.every(id => exercises.some(ex => ex.id === id)))'), true);
  assert.equal(a.run('templates.filter(w => w.person).length'), 3);
  assert.equal(a.run('templates.filter(w => w.person).every(w => w.source.startsWith("https://") && w.sourceNote)'), true);
});

test('de startknop opent eerst de samenstelling; wisselen en overslaan bepalen de training', () => {
  const a = app();
  a.click({ start: 'full' });
  assert.equal(a.location.hash, '#plan/full');
  assert.equal(a.run('session'), null);
  a.click({ planAlternatives: '0' });
  assert.equal(a.nodes.get('alternativeDialog').open, true);
  assert.match(a.nodes.get('alternativeList').innerHTML, /Goblet squat/);
  a.click({ chooseAlternative: 'goblet' });
  assert.equal(a.nodes.get('alternativeDialog').open, false);
  a.click({ planSkip: '1' });
  a.click({}, 'beginWorkout');
  assert.equal(a.location.hash, '#session');
  assert.equal(a.run('session.exercises[0].id'), 'goblet');
  assert.equal(a.run('session.exercises.some(ex => ex.id === "bench")'), false);
  const restored = app(a.saved, '#plan/full');
  assert.equal(restored.run('availableExercises(templates[0])[0].id'), 'goblet');
});

test('alternatieven volgen de beweging en sluiten vermeden of al gekozen oefeningen uit', () => {
  const a = app();
  a.run('state.favorites.push("legpress"); state.avoidedExercises.push("goblet")');
  assert.equal(a.run('getAlternatives(exercises.find(ex => ex.id === "squat"))[0].id'), 'legpress');
  assert.equal(a.run('getAlternatives(exercises.find(ex => ex.id === "squat")).some(ex => ex.id === "goblet" || ex.id === "lunge" || ex.id === "bench")'), false);
  a.click({ start: 'pull' });
  a.click({ planAlternatives: '1' });
  assert.equal(a.run('currentAlternatives().some(ex => ex.id === "cablerow")'), false);
  a.nodes.get('alternativeEquipment').value = 'Weerstandsband';
  a.nodes.get('alternativeEquipment').listeners.change();
  assert.match(a.nodes.get('alternativeList').innerHTML, /Resistance band row/);
  assert.doesNotMatch(a.nodes.get('alternativeList').innerHTML, /Dumbbell row/);
});

test('liever niet tijdens een sessie opent alternatieven zonder afgeronde sets te verliezen', () => {
  const a = app();
  a.run('startWorkout("legs")');
  a.inputRow('0-0', 8, 60);
  a.run('completeSet("0-0")');
  a.click({ preference: 'avoid', preferenceId: 'squat', preferenceType: 'exercise' });
  assert.equal(a.nodes.get('alternativeDialog').open, true);
  a.click({ chooseAlternative: 'goblet' });
  assert.equal(a.run('session.exercises[0].id'), 'goblet');
  assert.equal(a.run('session.exercises[0].done.length'), 3);
  assert.equal(a.run('session.archivedSets[0].exercise'), 'Squat');
  assert.equal(a.nodes.get('workoutSetCount').textContent, '1 / 10');
  a.inputRow('0-0', 12, 20);
  a.run('completeSet("0-0"); endSession(true)');
  assert.equal(a.run('state.history[0].sets.length'), 2);
  assert.equal(a.run('state.history[0].sets[0].weightKg'), 60);
  assert.equal(a.run('state.history[0].sets[1].exercise'), 'Goblet squat');
});

test('vervangen in een actieve sessie wordt ook voor de volgende training onthouden', () => {
  const a = app();
  a.run('startWorkout("legs")');
  a.click({ sessionAlternatives: '0' });
  a.click({ chooseAlternative: 'legpress' });
  a.run('endSession(false); startWorkout("legs")');
  assert.equal(a.run('session.exercises[0].id'), 'legpress');
});

test('de bibliotheek combineert zoeken, materiaal, spiergroep en voorkeuren', () => {
  const a = app();
  a.nodes.get('exerciseSearch').value = 'biceps';
  a.nodes.get('equipmentFilter').value = 'Dumbbells';
  a.run('renderExercises()');
  assert.match(a.nodes.get('exerciseList').innerHTML, /Bicep curl/);
  assert.match(a.nodes.get('exerciseList').innerHTML, /Hammer curl/);
  assert.doesNotMatch(a.nodes.get('exerciseList').innerHTML, /Band bicep curl/);
  a.run('state.favorites.push("hammer")');
  a.click({ libraryView: 'like' });
  assert.match(a.nodes.get('exerciseList').innerHTML, /Hammer curl/);
  assert.doesNotMatch(a.nodes.get('exerciseList').innerHTML, /<h3>Bicep curl/);
  a.click({}, 'resetExerciseFilters');
  a.click({ muscle: 'Buik' });
  assert.match(a.nodes.get('exerciseList').innerHTML, /Dead bug/);
  assert.doesNotMatch(a.nodes.get('exerciseList').innerHTML, /Bench press/);
  a.nodes.get('exerciseSearch').value = 'bestaatniet';
  a.run('renderExercises()');
  assert.match(a.nodes.get('exerciseList').innerHTML, /Geen oefeningen gevonden/);
});

test('een tijdsoefening vervangen door reps gebruikt de juiste nieuwe maat', () => {
  const a = app();
  a.click({ start: 'core' });
  a.click({ planSkip: '1' });
  a.click({ planAlternatives: '0' });
  a.click({ chooseAlternative: 'deadbug' });
  a.click({}, 'beginWorkout');
  assert.equal(a.run('session.exercises[0].id'), 'deadbug');
  assert.equal(a.run('session.exercises[0].reps'), 10);
  assert.equal(a.run('session.exercises[0].measurement'), undefined);
  assert.match(a.nodes.get('sessionExercises').innerHTML, />\s+Reps\s+</);
});
