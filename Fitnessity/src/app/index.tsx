import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  C,
  HeroBackground,
  Panel,
  Screen,
  Stat,
  s,
} from '@/components/fitnessity/ui';
import { useFitnessity } from '@/state/fitnessity';
import { recommendWorkout, weekHistory } from '@/state/workout';

export default function Dashboard() {
  const { state, update } = useFitnessity();
  const week = weekHistory(state);
  const recommendation = recommendWorkout(state);
  const openWorkouts = () => router.navigate('/workouts');
  return (
    <Screen title="Dashboard">
      <View style={styles.hero}>
        <HeroBackground />
        <Text style={s.eyebrow}>YOU VS. YOU</Text>
        <Text accessibilityRole="header" style={styles.heroTitle}>
          ELKE REP{'\n'}
          <Text style={{ color: C.lime }}>TELT.</Text>
        </Text>
        <Text style={[s.muted, { marginBottom: 8 }]}>
          Hey {state.profile.name.trim().split(/\s+/)[0] || 'Sporter'}, klaar om
          sterker te worden?
        </Text>
        <Button onPress={openWorkouts} style={{ alignSelf: 'flex-start' }}>
          Start een workout →
        </Button>
      </View>
      <View style={s.grid}>
        <Stat label="Workouts deze week" value={week.length} hint="Afgerond" />
        <Stat
          label="Trainingstijd"
          value={week.reduce((n, w) => n + w.minutes, 0)}
          hint="Minuten deze week"
        />
        <Stat
          label="Sets gedaan"
          value={week.reduce((n, w) => n + w.sets.length, 0)}
          hint="Deze week"
        />
        <Stat
          label="Jouw doel"
          value={state.profile.goal}
          hint="Blijf doorgaan"
          goal
        />
      </View>
      <Panel>
        <Text style={s.eyebrow}>EXCLUSIEF BIJ FITNESSITY</Text>
        <Text style={s.h3}>
          FIT PULSE<Text style={{ color: C.lime }}>.</Text>
        </Text>
        <Text style={s.muted}>
          Hoeveel energie heb je vandaag? Wij raden een workout aan.
        </Text>
        <View style={s.wrap}>
          {(
            [
              { id: 'low', label: 'Rustig' },
              { id: 'medium', label: 'Normaal' },
              { id: 'high', label: 'Veel energie' },
            ] as const
          ).map((p) => (
            <Button
              key={p.id}
              soft
              selected={state.pulse === p.id}
              onPress={() => update((prev) => ({ ...prev, pulse: p.id }))}
            >
              {p.label}
            </Button>
          ))}
        </View>
        <Panel style={s.recommendation}>
          {recommendation.workout ? (
            <>
              <Text style={s.eyebrow}>
                JOUW MATCH · {recommendation.workout.name}
              </Text>
              <Text style={s.body}>{recommendation.text}</Text>
              <Button
                onPress={() =>
                  router.push(
                    state.session
                      ? '/session'
                      : {
                          pathname: '/plan/[id]',
                          params: { id: recommendation.workout!.id },
                        }
                  )
                }
              >
                Start aanbevolen workout →
              </Button>
            </>
          ) : (
            <>
              <Text style={s.muted}>
                Er past nu geen workout bij je voorkeuren. Pas je keuzes aan of
                maak een eigen schema.
              </Text>
              <Button soft onPress={openWorkouts}>
                Bekijk workouts →
              </Button>
            </>
          )}
        </Panel>
      </Panel>
      <Panel>
        <Text style={s.eyebrow}>JOUW VOLGENDE STAP</Text>
        <Text style={s.h3}>Trainingsschema&apos;s</Text>
        <Text style={s.muted}>
          Kies snel een workout of maak je eigen schema.
        </Text>
        <Button onPress={openWorkouts}>Bekijk workouts →</Button>
      </Panel>
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4c5a36',
    minHeight: 230,
    padding: 24,
    gap: 10,
    overflow: 'hidden',
    backgroundColor: '#20261c',
  },
  heroTitle: {
    fontSize: 40,
    lineHeight: 41,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1.6,
    color: C.text,
  },
});
