import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  C,
  Chips,
  Dialog,
  Field,
  Heading,
  HeroBackground,
  Panel,
  Preferences,
  Screen,
  s,
} from '@/components/fitnessity/ui';
import { useFitnessity } from '@/state/fitnessity';
import {
  allExercises,
  allWorkouts,
  availableExercises,
  uid,
} from '@/state/workout';

function NewWorkout({ onClose }: { onClose: () => void }) {
  const { state, update, notice } = useFitnessity();
  const [name, setName] = useState('');
  const [chosen, setChosen] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  function save() {
    if (!name.trim() || !chosen.length) {
      notice('Vul een naam in en kies minstens één oefening.');
      return;
    }
    update((prev) => ({
      ...prev,
      customWorkouts: [
        ...prev.customWorkouts,
        {
          id: uid(),
          name: name.trim(),
          category: 'Eigen',
          description: 'Jouw eigen schema',
          ids: chosen,
        },
      ],
    }));
    notice('Schema opgeslagen.');
    onClose();
  }
  return (
    <Dialog title="Eigen schema" onClose={onClose}>
      <Field
        label="Naam van het schema"
        value={name}
        onChangeText={setName}
        maxLength={60}
        placeholder="Bijv. Push day"
      />
      <Field
        label={`Kies oefeningen · ${chosen.length} geselecteerd`}
        value={search}
        onChangeText={setSearch}
        placeholder="Zoek oefening"
      />
      <ScrollView
        style={{ maxHeight: 260 }}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        {allExercises(state)
          .filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase()))
          .map((ex) => (
            <Pressable
              key={ex.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: chosen.includes(ex.id) }}
              onPress={() =>
                setChosen((prev) =>
                  prev.includes(ex.id)
                    ? prev.filter((id) => id !== ex.id)
                    : [...prev, ex.id]
                )
              }
              style={[s.listLine, { gap: 12 }]}
            >
              <Text style={{ color: C.lime, fontSize: 22 }}>
                {chosen.includes(ex.id) ? '☑' : '□'}
              </Text>
              <View style={s.flex}>
                <Text style={s.body}>{ex.name}</Text>
                <Text style={s.small}>{ex.group}</Text>
              </View>
            </Pressable>
          ))}
      </ScrollView>
      <Button onPress={save}>Schema opslaan</Button>
    </Dialog>
  );
}

export function WorkoutHistory() {
  const { state } = useFitnessity();
  return (
    <Panel>
      <Text style={s.h3}>Laatste trainingen</Text>
      {state.history.length ? (
        state.history
          .slice(-5)
          .reverse()
          .map((w) => (
            <View style={s.listLine} key={w.id}>
              <View style={s.flex}>
                <Text style={[s.body, { fontWeight: '700' }]}>{w.name}</Text>
                <Text style={s.small}>
                  {new Date(w.date).toLocaleDateString('nl-NL')} · {w.minutes}{' '}
                  min · {w.sets.length} sets
                </Text>
              </View>
              <View style={s.tag}>
                <Text style={s.tagText}>Voltooid</Text>
              </View>
            </View>
          ))
      ) : (
        <Text style={s.muted}>Je hebt nog geen workouts afgerond.</Text>
      )}
    </Panel>
  );
}

export default function WorkoutsScreen() {
  const { state } = useFitnessity();
  const [filter, setFilter] = useState('');
  const [create, setCreate] = useState(false);
  const workouts = allWorkouts(state);
  return (
    <Screen title="Workouts">
      <View style={styles.banner}>
        <HeroBackground />
        <Text style={s.eyebrow}>JOUW TEMPO. JOUW PROGRESSIE.</Text>
        <Text style={styles.bannerTitle}>
          KLAAR VOOR{'\n'}
          <Text style={{ color: C.lime }}>JE VOLGENDE REP?</Text>
        </Text>
        <Text style={s.muted}>Kies je training. Zet je focus aan.</Text>
      </View>
      <Heading
        title="Jouw workouts"
        description="Geef aan welke schema’s je fijn vindt. Je voorkeuren tellen mee in FIT PULSE."
      />
      <Button
        onPress={() => setCreate(true)}
        style={{ alignSelf: 'flex-start' }}
      >
        + Eigen schema
      </Button>
      {state.session && (
        <Panel style={{ borderColor: '#687e46', backgroundColor: '#252e1f' }}>
          <Text style={s.eyebrow}>JE TRAINING STAAT KLAAR</Text>
          <Text style={s.h3}>{state.session.name}</Text>
          <Text style={s.muted}>
            Je ingevulde sets zijn bewaard. Pak de draad weer op.
          </Text>
          <Button onPress={() => router.push('/session')}>
            ▶ Verder trainen
          </Button>
        </Panel>
      )}
      <Chips
        value={filter}
        onChange={setFilter}
        values={['', 'Gym', 'Thuis', 'Bekende namen', 'Eigen'].map((value) => ({
          value,
          label: `${value || 'Alle workouts'}  ${workouts.filter((w) => !value || w.category === value).length}`,
        }))}
      />
      {workouts
        .filter((w) => !filter || w.category === filter)
        .map((w, index) => {
          const selected = availableExercises(state, w);
          return (
            <Panel
              key={w.id}
              style={[
                styles.workoutCard,
                state.workoutPreferences[w.id] === 'avoid' && {
                  borderTopColor: '#ad7e70',
                },
              ]}
            >
              <View style={[s.row, { justifyContent: 'space-between' }]}>
                <Text
                  style={[
                    s.eyebrow,
                    { flex: 1, fontSize: 9.5, letterSpacing: 1.2 },
                  ]}
                >
                  {w.person ? `GEBASEERD OP · ${w.sourceLabel}` : w.category}
                </Text>
                <Text style={styles.number}>
                  {w.initials || String(index + 1).padStart(2, '0')}
                </Text>
              </View>
              <Text style={styles.workoutTitle}>{w.name}</Text>
              <Text style={s.muted}>{w.description}</Text>
              {w.person && (
                <Text style={s.small}>{w.person} · Fitnessity-variant</Text>
              )}
              <View style={styles.metrics}>
                <Text style={s.muted}>
                  <Text style={styles.metricValue}>{selected.length}</Text>{' '}
                  oefeningen
                </Text>
                <Text style={s.muted}>
                  <Text style={styles.metricValue}>
                    {selected.reduce((n, ex) => n + ex.sets, 0)}
                  </Text>{' '}
                  sets
                </Text>
              </View>
              <Preferences id={w.id} type="workout" />
              <Text style={s.small}>
                {state.workoutPreferences[w.id] === 'avoid'
                  ? 'Wordt niet aanbevolen in FIT PULSE.'
                  : state.workoutPreferences[w.id] === 'like'
                    ? 'Favoriet · krijgt voorrang in FIT PULSE.'
                    : 'Maak deze training persoonlijk.'}
                {w.ids.length !== selected.length
                  ? ` ${w.ids.length - selected.length} oefening(en) overgeslagen.`
                  : ''}
              </Text>
              <Button
                icon="workouts"
                onPress={() =>
                  router.push(
                    state.session
                      ? '/session'
                      : { pathname: '/plan/[id]', params: { id: w.id } }
                  )
                }
              >
                Kies je oefeningen →
              </Button>
            </Panel>
          );
        })}
      {!workouts.some((w) => !filter || w.category === filter) && (
        <Text style={s.muted}>
          Nog geen eigen schema’s. Maak er hierboven één aan.
        </Text>
      )}
      <WorkoutHistory />
      {create && <NewWorkout onClose={() => setCreate(false)} />}
    </Screen>
  );
}
const styles = StyleSheet.create({
  banner: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#485836',
    padding: 24,
    overflow: 'hidden',
    gap: 18,
  },
  bannerTitle: {
    color: C.text,
    fontSize: 30,
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: 31,
    letterSpacing: -1.3,
  },
  workoutCard: { borderTopWidth: 3, borderTopColor: '#8baf41', gap: 16 },
  workoutTitle: {
    color: C.text,
    fontSize: 26.4,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  number: {
    color: '#9ba78e',
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  metrics: {
    flexDirection: 'row',
    gap: 22,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.edge,
  },
  metricValue: { color: C.text, fontSize: 20, fontWeight: '700' },
});
