import { Text, View } from 'react-native';
import { C, Heading, Panel, Screen, Stat, s } from '@/components/fitnessity/ui';
import { useFitnessity } from '@/state/fitnessity';
import { fromKg, todayKey } from '@/state/workout';

export default function ProgressScreen() {
  const { state } = useFitnessity();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return {
      date,
      count: state.history.filter((w) => todayKey(w.date) === todayKey(date))
        .length,
    };
  });
  const maximum = Math.max(1, ...days.map((d) => d.count));
  const records = new Map<string, number>();
  state.history.forEach((w) =>
    w.sets.forEach((set) => {
      if (set.weightKg > (records.get(set.exercise) || 0))
        records.set(set.exercise, set.weightKg);
    })
  );
  return (
    <Screen title="Voortgang">
      <Heading
        title="Jouw voortgang"
        description="Bekijk je uitgevoerde trainingen en persoonlijke records."
      />
      <View style={{ gap: 16 }}>
        <Stat
          fullWidth
          label="Alle workouts"
          value={state.history.length}
          hint="Afgerond"
        />
        <Stat
          fullWidth
          label="Totale trainingsduur"
          value={state.history.reduce((n, w) => n + w.minutes, 0)}
          hint="Minuten"
        />
        <Stat
          fullWidth
          label="Totaal aantal sets"
          value={state.history.reduce((n, w) => n + w.sets.length, 0)}
          hint="Voltooid"
        />
      </View>
      <Panel>
        <Text style={s.h3}>Workouts in de afgelopen 7 dagen</Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 14,
            height: 200,
            alignItems: 'flex-end',
            paddingTop: 22,
          }}
        >
          {days.map(({ date, count }) => (
            <View
              key={todayKey(date)}
              accessibilityLabel={`${date.toLocaleDateString('nl-NL')}: ${count} workouts`}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 6,
              }}
            >
              <Text style={s.small}>{count}</Text>
              <View
                style={{
                  width: '100%',
                  maxWidth: 36,
                  height: Math.max(4, (count / maximum) * 140),
                  backgroundColor: C.lime,
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                }}
              />
              <Text style={s.small}>
                {date.toLocaleDateString('nl-NL', { weekday: 'short' })}
              </Text>
            </View>
          ))}
        </View>
      </Panel>
      <Panel>
        <Text style={s.h3}>Persoonlijke records</Text>
        <Text style={s.small}>Hoogste opgeslagen gewicht per oefening.</Text>
        {records.size ? (
          [...records]
            .sort((a, b) => b[1] - a[1])
            .map(([name, weight]) => (
              <View style={s.listLine} key={name}>
                <Text style={[s.body, s.flex]}>{name}</Text>
                <Text
                  style={{ color: C.lime, fontWeight: '800', fontSize: 17 }}
                >
                  {Number(fromKg(weight, state.profile.unit).toFixed(1))}{' '}
                  {state.profile.unit}
                </Text>
              </View>
            ))
        ) : (
          <Text style={s.muted}>
            Nog geen records. Rond een workout af om je voortgang te zien.
          </Text>
        )}
      </Panel>
    </Screen>
  );
}
