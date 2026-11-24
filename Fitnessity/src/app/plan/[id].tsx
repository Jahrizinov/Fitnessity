import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Alternatives } from '@/components/fitnessity/alternatives';
import {
  Button,
  C,
  Heading,
  Panel,
  Screen,
  s,
} from '@/components/fitnessity/ui';
import { repUnit } from '@/data/catalog';
import { useFitnessity } from '@/state/fitnessity';
import {
  allWorkouts,
  availableExercises,
  createSession,
  workoutSlots,
} from '@/state/workout';

export default function WorkoutPlan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, update, notice } = useFitnessity();
  const [alternative, setAlternative] = useState<number | null>(null);
  const workout = allWorkouts(state).find((w) => w.id === id);
  if (!workout)
    return (
      <Screen title="Workout samenstellen">
        <Heading title="Workout niet gevonden" />
        <Button soft onPress={() => router.replace('/workouts')}>
          ← Alle workouts
        </Button>
      </Screen>
    );
  const selected = availableExercises(state, workout);
  const slots = workoutSlots(state, workout);
  function change(index: number, exerciseId: string | null) {
    update((prev) => ({
      ...prev,
      workoutChoices: {
        ...prev.workoutChoices,
        [id]: { ...prev.workoutChoices[id], [index]: exerciseId },
      },
    }));
  }
  function begin() {
    if (state.session) {
      notice('Je hebt al een training lopen.');
      router.replace('/session');
      return;
    }
    const session = createSession(state, workout!);
    if (!session) {
      notice('Kies minimaal één oefening om te starten.');
      return;
    }
    update((prev) => (prev.session ? prev : { ...prev, session }));
    router.replace('/session');
  }
  return (
    <Screen title="Workout samenstellen">
      <Button
        soft
        onPress={() => router.replace('/workouts')}
        style={{ alignSelf: 'flex-start' }}
      >
        ← Alle workouts
      </Button>
      <View style={{ gap: 14 }}>
        <Text style={s.eyebrow}>MAAK DEZE TRAINING VAN JOU</Text>
        <Text
          style={[
            s.title,
            {
              fontSize: 36,
              lineHeight: 42,
              fontStyle: 'italic',
              fontWeight: '900',
            },
          ]}
        >
          {workout.name}
        </Text>
        <Text style={s.muted}>{workout.description}</Text>
        <View style={s.row}>
          <Text style={s.muted}>
            <Text style={s.statValue}>{selected.length}</Text> oefeningen
          </Text>
          <Text style={s.muted}>
            <Text style={s.statValue}>
              {selected.reduce((n, ex) => n + ex.sets, 0)}
            </Text>{' '}
            sets
          </Text>
        </View>
      </View>
      {workout.source && (
        <Panel style={{ backgroundColor: '#c3ff4d08', borderColor: '#4d5d35' }}>
          <Text style={s.body}>{workout.person} · Fitnessity-variant</Text>
          <Text style={s.small}>{workout.sourceNote}</Text>
          <Button
            soft
            onPress={() => {
              WebBrowser.openBrowserAsync(workout.source!).catch(() =>
                notice('De bron kon niet worden geopend.')
              );
            }}
          >
            Lees het programma bij {workout.sourceLabel} ↗
          </Button>
        </Panel>
      )}
      <Heading
        title="Kies je oefeningen"
        description="Wissel voor een vergelijkbare beweging, of sla een oefening over. Je keuzes blijven bewaard."
      />
      <Button
        soft
        onPress={() =>
          update((prev) => ({
            ...prev,
            workoutChoices: { ...prev.workoutChoices, [id]: {} },
          }))
        }
      >
        Standaard terugzetten
      </Button>
      {slots.map((slot) => (
        <Panel
          key={slot.index}
          style={
            slot.skipped
              ? { borderStyle: 'dashed', backgroundColor: '#191c19' }
              : undefined
          }
        >
          <View style={s.row}>
            <Text
              style={{
                color: C.lime,
                fontSize: 24,
                fontWeight: '900',
                marginRight: 6,
              }}
            >
              {String(slot.index + 1).padStart(2, '0')}
            </Text>
            <View style={s.flex}>
              <Text style={[s.eyebrow, { fontSize: 10 }]}>
                {slot.exercise.group} · {slot.exercise.equipment}
              </Text>
              <Text style={s.h3}>{slot.exercise.name}</Text>
              <Text style={s.small}>
                {slot.skipped
                  ? 'Wordt overgeslagen · kies een alternatief.'
                  : `${slot.exercise.sets} sets × ${slot.exercise.reps} ${repUnit(slot.exercise)} · ${slot.exercise.rest} sec rust`}
              </Text>
            </View>
          </View>
          <View style={s.wrap}>
            <Button soft icon="swap" onPress={() => setAlternative(slot.index)}>
              {slot.skipped ? 'Kies alternatief' : 'Wissel'}
            </Button>
            <Button
              soft
              onPress={() => {
                if (slot.skipped) {
                  update((prev) => ({
                    ...prev,
                    avoidedExercises: prev.avoidedExercises.filter(
                      (exId) => exId !== slot.exercise.id
                    ),
                    workoutChoices: {
                      ...prev.workoutChoices,
                      [id]: {
                        ...prev.workoutChoices[id],
                        [slot.index]: slot.baseId,
                      },
                    },
                  }));
                } else change(slot.index, null);
              }}
            >
              {slot.skipped ? 'Weer toestaan' : 'Overslaan'}
            </Button>
          </View>
        </Panel>
      ))}
      <Panel style={{ backgroundColor: '#252e1f', borderColor: '#687e46' }}>
        <Text style={s.muted}>
          {selected.length
            ? `${selected.length} oefeningen klaar. Eerst opwarmen, dan gaan!`
            : 'Kies minimaal één oefening om te starten.'}
        </Text>
        <Button onPress={begin} disabled={!selected.length}>
          ▶ Start mijn training
        </Button>
      </Panel>
      {alternative !== null && (
        <Alternatives
          exercise={slots[alternative].exercise}
          onClose={() => setAlternative(null)}
          onChoose={(ex) => change(alternative, ex.id)}
        />
      )}
    </Screen>
  );
}
