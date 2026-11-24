import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Alternatives } from '@/components/fitnessity/alternatives';
import {
  Button,
  C,
  Chips,
  Dialog,
  Field,
  Header,
  Heading,
  Icon,
  Panel,
  Preferences,
  Select,
  s,
} from '@/components/fitnessity/ui';
import { exerciseTip, movementOf, movements, repUnit } from '@/data/catalog';
import type { Exercise } from '@/data/types';
import { useFitnessity } from '@/state/fitnessity';
import { allExercises, numberValue, uid } from '@/state/workout';

const groups = ['Borst', 'Rug', 'Benen', 'Schouders', 'Armen', 'Buik'];

function ExerciseCard({
  exercise: ex,
  onAlternatives,
}: {
  exercise: Exercise;
  onAlternatives: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { state } = useFitnessity();
  const avoided = state.avoidedExercises.includes(ex.id);
  return (
    <Panel
      style={[
        styles.card,
        avoided && { borderTopColor: '#ad7e70', borderTopWidth: 2 },
      ]}
    >
      <View style={s.row}>
        <View style={styles.symbol}>
          <Icon
            name={ex.group === 'Buik' ? 'progress' : 'exercises'}
            color={C.lime}
          />
        </View>
        <Text
          style={[
            s.small,
            { flex: 1, textTransform: 'uppercase', letterSpacing: 1 },
          ]}
        >
          {ex.group}
        </Text>
        {state.favorites.includes(ex.id) && (
          <Icon name="heart" color={C.lime} size={17} />
        )}
      </View>
      <Text style={styles.name}>{ex.name}</Text>
      <Text style={s.small}>
        {ex.equipment} ·{' '}
        {movements[movementOf(ex)]?.label.split(' · ')[1] || 'Eigen oefening'}
      </Text>
      <View style={styles.prescription}>
        <Text style={s.small}>
          <Text style={styles.number}>{ex.sets}</Text> sets
        </Text>
        <Text style={s.small}>
          <Text style={styles.number}>{ex.reps}</Text> {repUnit(ex)}
        </Text>
        <View style={[s.row, { marginLeft: 'auto', gap: 4 }]}>
          <Icon name="clock" size={14} color={C.muted} />
          <Text style={s.small}>{ex.rest}s rust</Text>
        </View>
      </View>
      <Preferences id={ex.id} />
      {avoided && (
        <Text style={s.small}>Wordt overgeslagen in je workouts.</Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((v) => !v)}
        style={[s.row, { minHeight: 40, justifyContent: 'space-between' }]}
      >
        <Text style={[s.small, { color: '#d5dfcf', fontWeight: '600' }]}>
          Uitvoering & alternatieven
        </Text>
        <Text style={{ color: C.lime, fontSize: 20 }}>
          {expanded ? '−' : '+'}
        </Text>
      </Pressable>
      {expanded && (
        <>
          <Text style={s.muted}>{exerciseTip(ex)}</Text>
          <Button soft icon="swap" onPress={onAlternatives}>
            Bekijk alternatieven
          </Button>
        </>
      )}
    </Panel>
  );
}

function NewExercise({ onClose }: { onClose: () => void }) {
  const { update, notice } = useFitnessity();
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Borst');
  const [movement, setMovement] = useState('');
  const [equipment, setEquipment] = useState('Eigen gewicht');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [rest, setRest] = useState('60');
  function save() {
    const a = numberValue(sets),
      b = numberValue(reps),
      c = numberValue(rest);
    if (
      !name.trim() ||
      !Number.isInteger(a) ||
      a < 1 ||
      a > 10 ||
      !Number.isInteger(b) ||
      b < 1 ||
      b > 100 ||
      !Number.isInteger(c) ||
      c < 0 ||
      c > 600
    ) {
      notice('Vul een naam, 1–10 sets, 1–100 reps en 0–600 sec rust in.');
      return;
    }
    update((prev) => ({
      ...prev,
      customExercises: [
        ...prev.customExercises,
        {
          id: uid(),
          name: name.trim(),
          group,
          equipment,
          sets: a,
          reps: b,
          rest: c,
          movement,
        },
      ],
    }));
    notice('Oefening opgeslagen.');
    onClose();
  }
  return (
    <Dialog title="Eigen oefening" onClose={onClose}>
      <Field
        label="Naam"
        value={name}
        onChangeText={setName}
        maxLength={60}
        placeholder="Bijv. Cable fly"
      />
      <Select
        label="Spiergroep"
        value={group}
        options={groups}
        onChange={(value) => {
          setGroup(value);
          setMovement('');
        }}
      />
      <Select
        label="Beweging (voor passende alternatieven)"
        value={movement}
        options={[
          { value: '', label: 'Zelfde spiergroep' },
          ...Object.entries(movements)
            .filter(([, m]) => m.label.startsWith(group))
            .map(([value, m]) => ({ value, label: m.label })),
        ]}
        onChange={setMovement}
      />
      <Select
        label="Materiaal"
        value={equipment}
        options={[
          'Eigen gewicht',
          'Barbell',
          'Dumbbells',
          'Machine',
          'Kabel',
          'Weerstandsband',
          'Optrekstang',
        ]}
        onChange={setEquipment}
      />
      <Field
        label="Sets"
        keyboardType="number-pad"
        value={sets}
        onChangeText={setSets}
      />
      <Field
        label="Reps"
        keyboardType="number-pad"
        value={reps}
        onChangeText={setReps}
      />
      <Field
        label="Rust (sec)"
        keyboardType="number-pad"
        value={rest}
        onChangeText={setRest}
      />
      <Button onPress={save}>Oefening opslaan</Button>
    </Dialog>
  );
}

export default function ExercisesScreen() {
  const { state } = useFitnessity();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [preference, setPreference] = useState('');
  const [create, setCreate] = useState(false);
  const [alternative, setAlternative] = useState<Exercise | null>(null);
  const exercises = allExercises(state);
  const list = exercises.filter(
    (ex) =>
      (!query ||
        `${ex.name} ${ex.group} ${ex.equipment} ${movements[movementOf(ex)]?.label || ''}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())) &&
      (!group || ex.group === group) &&
      (!equipment || ex.equipment === equipment) &&
      (!preference ||
        (preference === 'like'
          ? state.favorites
          : state.avoidedExercises
        ).includes(ex.id))
  );
  const reset = () => {
    setQuery('');
    setGroup('');
    setEquipment('');
    setPreference('');
  };
  return (
    <>
      <FlatList
        style={s.flex}
        contentContainerStyle={s.content}
        data={list}
        keyExtractor={(ex) => ex.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={6}
        ListHeaderComponent={
          <View style={{ gap: 24 }}>
            <Header title="Oefeningen" />
            <View style={{ gap: 10 }}>
              <Text style={s.eyebrow}>BOUW JOUW TRAINING</Text>
              <Heading
                title="Vind jouw beweging."
                description="Ontdek oefeningen, bekijk de uitvoering en vind een alternatief dat bij je past."
              />
              <Button
                onPress={() => setCreate(true)}
                style={{ alignSelf: 'flex-start' }}
              >
                + Eigen oefening
              </Button>
            </View>
            <View style={{ gap: 12 }}>
              <Panel>
                <Text style={s.body}>
                  <Text
                    style={{ color: C.lime, fontWeight: '900', fontSize: 24 }}
                  >
                    {exercises.length}
                  </Text>{' '}
                  oefeningen om uit te kiezen
                </Text>
              </Panel>
              <View style={s.grid}>
                <Button
                  soft
                  selected={preference === 'like'}
                  onPress={() =>
                    setPreference((v) => (v === 'like' ? '' : 'like'))
                  }
                  style={s.flex}
                >
                  ♡ {state.favorites.length} favorieten
                </Button>
                <Button
                  soft
                  selected={preference === 'avoid'}
                  onPress={() =>
                    setPreference((v) => (v === 'avoid' ? '' : 'avoid'))
                  }
                  style={s.flex}
                >
                  ⊘ {state.avoidedExercises.length} overslaan
                </Button>
              </View>
            </View>
            <Panel>
              <Field
                label="Zoek een oefening"
                value={query}
                onChangeText={setQuery}
                placeholder="Bijv. squat, dumbbell of biceps"
                autoCorrect={false}
              />
              <Select
                label="Materiaal"
                value={equipment}
                options={[
                  { value: '', label: 'Alle materialen' },
                  ...new Set(exercises.map((ex) => ex.equipment)),
                ]}
                onChange={setEquipment}
              />
              <Select
                label="Jouw selectie"
                value={preference}
                options={[
                  { value: '', label: 'Alle oefeningen' },
                  { value: 'like', label: 'Favorieten' },
                  { value: 'avoid', label: 'Liever niet' },
                ]}
                onChange={setPreference}
              />
            </Panel>
            <Chips
              value={group}
              onChange={setGroup}
              values={['', ...groups].map((g) => ({
                value: g,
                label: `${g || 'Alle spiergroepen'}  ${exercises.filter((ex) => !g || ex.group === g).length}`,
              }))}
            />
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <Text accessibilityLiveRegion="polite" style={s.small}>
                {list.length} van {exercises.length} oefeningen
              </Text>
              {query || group || equipment || preference ? (
                <Button soft onPress={reset}>
                  Filters wissen
                </Button>
              ) : null}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onAlternatives={() => setAlternative(item)}
          />
        )}
        ListEmptyComponent={
          <Panel>
            <Heading
              title="Geen oefeningen gevonden"
              description="Probeer een andere zoekterm of maak je filters wat ruimer."
            />
            <Button soft onPress={reset}>
              Alle oefeningen bekijken
            </Button>
          </Panel>
        }
      />
      {create && <NewExercise onClose={() => setCreate(false)} />}
      {alternative && (
        <Alternatives
          exercise={alternative}
          onClose={() => setAlternative(null)}
        />
      )}
    </>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#191e19', padding: 22, gap: 12 },
  symbol: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c3ff4d0d',
  },
  name: { color: C.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  prescription: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.edge,
    paddingVertical: 12,
  },
  number: { fontSize: 16, color: C.text, fontWeight: '700' },
});
