import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alternatives } from '@/components/fitnessity/alternatives';
import {
  Button,
  C,
  Confirm,
  Field,
  Panel,
  Preferences,
  ProgressBar,
  Screen,
  s,
} from '@/components/fitnessity/ui';
import { repUnit } from '@/data/catalog';
import type { SessionExercise } from '@/data/types';
import { useFitnessity } from '@/state/fitnessity';
import {
  completeSet,
  finishSession,
  formatTime,
  fromKg,
  numberValue,
  replaceSessionExercise,
  sessionStats,
  toKg,
} from '@/state/workout';

function SetRow({
  ex,
  ei,
  si,
}: {
  ex: SessionExercise;
  ei: number;
  si: number;
}) {
  const { state, update, notice } = useFitnessity();
  const done = ex.done[si];
  const draft = ex.drafts[si];
  const unit = state.profile.unit;
  const weight = done
    ? String(Number(fromKg(done.weightKg, unit).toFixed(1)))
    : draft.unit === unit || draft.weight === ''
      ? draft.weight
      : String(
          Number(
            fromKg(toKg(numberValue(draft.weight), draft.unit), unit).toFixed(1)
          )
        );
  function setDraft(field: 'reps' | 'weight', value: string) {
    update((prev) =>
      !prev.session
        ? prev
        : {
            ...prev,
            session: {
              ...prev.session,
              exercises: prev.session.exercises.map((e, i) =>
                i !== ei
                  ? e
                  : {
                      ...e,
                      drafts: e.drafts.map((d, j) =>
                        j !== si
                          ? d
                          : { reps: draft.reps, weight, unit, [field]: value }
                      ),
                    }
              ),
            },
          }
    );
  }
  function complete() {
    const next = completeSet(state, ei, si);
    if (next === state) {
      notice('Vul geldige reps en gewicht in.');
      return;
    }
    update((prev) => completeSet(prev, ei, si));
    notice('Set opgeslagen. Rusttimer gestart.');
  }
  return (
    <View style={[styles.set, done && { opacity: 0.75 }]}>
      <View style={s.row}>
        <Text
          style={[
            s.small,
            { width: 40, fontWeight: '700', color: done ? C.lime : C.text },
          ]}
        >
          Set {si + 1}
        </Text>
        <View style={s.flex}>
          <Field
            label={ex.measurement === 'seconds' ? 'Seconden' : 'Reps'}
            keyboardType="number-pad"
            value={done ? String(done.reps) : draft.reps}
            editable={!done}
            onChangeText={(v) => setDraft('reps', v)}
          />
        </View>
        <View style={s.flex}>
          <Field
            label={`Gewicht (${unit})`}
            keyboardType="decimal-pad"
            value={weight}
            editable={!done}
            onChangeText={(v) => setDraft('weight', v)}
          />
        </View>
      </View>
      <Button
        soft={!!done}
        disabled={!!done}
        onPress={complete}
        style={{ marginLeft: 50 }}
      >
        {done ? '✓ Klaar' : '✓ Set klaar'}
      </Button>
    </View>
  );
}

// Keep the one-second timer in this component so typing and exercise cards do not rerender every tick.
function SessionClock({ elapsedOnly = false }: { elapsedOnly?: boolean }) {
  const { state, update } = useFitnessity();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!state.session) return null;
  const rest = Math.max(0, Math.ceil((state.session.restUntil - now) / 1000));
  if (elapsedOnly)
    return (
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text style={[s.small, { fontSize: 8, letterSpacing: 1 }]}>
          TRAININGSTIJD
        </Text>
        <Text style={[styles.clock, { fontSize: 28 }]}>
          {formatTime(
            Math.max(0, Math.floor((now - state.session.start) / 1000))
          )}
        </Text>
      </View>
    );
  return (
    <Panel style={{ backgroundColor: '#232c1d', borderColor: '#4c5d36' }}>
      <Text style={s.eyebrow}>RUSTTIMER</Text>
      <Text style={styles.clock}>{formatTime(rest)}</Text>
      <Text style={s.small}>
        {rest
          ? 'Adem uit. Laad op voor je volgende set.'
          : state.session.restUntil
            ? 'Rust voorbij. Klaar voor je volgende set!'
            : 'Start na elke afgeronde set.'}
      </Text>
      <Button
        soft
        disabled={!rest}
        onPress={() =>
          update((prev) =>
            prev.session
              ? { ...prev, session: { ...prev.session, restUntil: 0 } }
              : prev
          )
        }
      >
        Rust overslaan →
      </Button>
    </Panel>
  );
}

export default function SessionScreen() {
  const { state, update, notice } = useFitnessity();
  const [alternative, setAlternative] = useState<number | null>(null);
  const [cancel, setCancel] = useState(false);
  const insets = useSafeAreaInsets();
  const session = state.session;
  const { done, total } = sessionStats(state);
  if (!session) return <Redirect href="/workouts" />;
  function finish() {
    if (!done) {
      notice('Vink eerst minstens één set af.');
      return;
    }
    update((prev) => finishSession(prev));
    notice('Workout afgerond! Goed gedaan.');
    router.replace('/workouts');
  }
  return (
    <Screen>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Button soft onPress={() => router.replace('/workouts')}>
          ← Overzicht
        </Button>
        <Text style={[s.eyebrow, { fontSize: 9, letterSpacing: 1 }]}>
          ● TRAINING ACTIEF
        </Text>
      </View>
      <View style={[s.row, { alignItems: 'flex-start' }]}>
        <View style={{ gap: 8, flex: 1 }}>
          <Text style={[s.eyebrow, { fontSize: 10 }]}>
            FOCUS OP JE VOLGENDE SET
          </Text>
          <Text
            style={[
              s.title,
              {
                fontSize: 34,
                lineHeight: 42,
                fontWeight: '900',
                fontStyle: 'italic',
              },
            ]}
          >
            {session.name}
          </Text>
          <Text style={s.muted}>
            Jouw training, op jouw manier. Elke set brengt je verder.
          </Text>
        </View>
        <SessionClock elapsedOnly />
      </View>
      <Text style={s.h3}>Jouw oefeningen</Text>
      <Text style={s.small}>
        Wissel een oefening via ‘Alternatieven’. Met ‘Liever niet’ sla je
        resterende sets over.
      </Text>
      {session.exercises.map((ex, ei) => {
        const skipped = state.avoidedExercises.includes(ex.id);
        return (
          <Panel key={`${ei}-${ex.id}`} style={{ backgroundColor: '#1a1f1b' }}>
            <View style={s.row}>
              <Text style={[s.statValue, { fontSize: 24 }]}>
                {String(ei + 1).padStart(2, '0')}
              </Text>
              <View style={s.flex}>
                <Text style={[s.eyebrow, { fontSize: 10 }]}>
                  {ex.group} · {ex.equipment}
                </Text>
                <Text style={s.h3}>{ex.name}</Text>
                <Text style={s.small}>
                  {ex.sets} sets × {ex.reps} {repUnit(ex)} · {ex.rest} sec rust
                </Text>
                {ex.replacedFrom && (
                  <Text style={s.small}>
                    Vervangt {ex.replacedFrom} · resterende sets
                  </Text>
                )}
              </View>
            </View>
            <Preferences id={ex.id} />
            <Button
              soft
              icon="swap"
              disabled={ex.done.every(Boolean)}
              onPress={() => setAlternative(ei)}
            >
              Alternatieven
            </Button>
            {skipped && (
              <Text style={s.muted}>
                Resterende sets overgeslagen. Afgeronde sets blijven bewaard.
                Tik nogmaals op ‘Liever niet’ om verder te gaan.
              </Text>
            )}
            {ex.done.map((set, si) =>
              skipped && !set ? null : (
                <SetRow key={si} ex={ex} ei={ei} si={si} />
              )
            )}
          </Panel>
        );
      })}
      {session.archivedSets.length > 0 && (
        <Panel>
          <Text style={s.muted}>
            ✓ {session.archivedSets.length} eerdere set(s) bewaard. Ze tellen
            mee in je voortgang en geschiedenis.
          </Text>
        </Panel>
      )}
      <View style={[s.row, { alignItems: 'stretch' }]}>
        <Panel style={s.flex}>
          <Text style={s.eyebrow}>BLIJF BOUWEN</Text>
          <Text style={styles.clock}>
            {done} / {total}
          </Text>
          <Text style={s.muted}>sets afgerond</Text>
          <ProgressBar
            value={total ? (done / total) * 100 : 0}
            label="Afgeronde sets"
          />
          <Text style={s.small}>
            {!total
              ? 'Alle oefeningen overgeslagen. Zet een oefening terug om te trainen.'
              : done === total
                ? 'Alle sets klaar. Rond je training af!'
                : done
                  ? `Nog ${total - done} sets. Blijf gaan!`
                  : 'Klaar voor je eerste set?'}
          </Text>
        </Panel>
        <View style={s.flex}>
          <SessionClock />
        </View>
      </View>
      <View style={{ gap: 12, paddingBottom: insets.bottom }}>
        <Button onPress={finish}>✓ Training afronden</Button>
        <Button danger onPress={() => setCancel(true)}>
          Training stoppen
        </Button>
        <Text style={s.small}>
          Je sets worden automatisch tussentijds bewaard.
        </Text>
      </View>
      {alternative !== null && (
        <Alternatives
          exercise={session.exercises[alternative]}
          onClose={() => setAlternative(null)}
          onChoose={(ex) =>
            update((prev) => replaceSessionExercise(prev, alternative, ex))
          }
        />
      )}
      {cancel && (
        <Confirm
          title="Training stoppen?"
          description="Deze workout stoppen zonder op te slaan?"
          confirm="Training stoppen"
          onClose={() => setCancel(false)}
          onConfirm={() => {
            update((prev) => ({ ...prev, session: null }));
            router.replace('/workouts');
          }}
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  set: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#303b31',
    gap: 8,
  },
  clock: {
    color: C.lime,
    fontSize: 37,
    fontWeight: '900',
    letterSpacing: -1.7,
    fontVariant: ['tabular-nums'],
  },
});
