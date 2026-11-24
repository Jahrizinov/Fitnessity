import { useState } from 'react';
import { Text } from 'react-native';
import {
  Button,
  Confirm,
  Field,
  Heading,
  Panel,
  Screen,
  Select,
  s,
} from '@/components/fitnessity/ui';
import { useFitnessity } from '@/state/fitnessity';
import { defaultState, numberValue } from '@/state/workout';

export default function ProfileScreen() {
  const { state, update, notice } = useFitnessity();
  const [name, setName] = useState(state.profile.name);
  const [goal, setGoal] = useState(state.profile.goal);
  const [kcal, setKcal] = useState(String(state.profile.kcal));
  const [unit, setUnit] = useState(state.profile.unit);
  const [clear, setClear] = useState(false);
  function save() {
    const calories = numberValue(kcal);
    if (
      !name.trim() ||
      !Number.isInteger(calories) ||
      calories < 500 ||
      calories > 10000
    ) {
      notice('Vul een naam en een dagdoel van 500–10000 kcal in.');
      return;
    }
    update((prev) => ({
      ...prev,
      profile: { name: name.trim(), goal, kcal: calories, unit },
    }));
    notice('Instellingen opgeslagen.');
  }
  function reset() {
    const initial = defaultState();
    update(() => initial);
    setName(initial.profile.name);
    setGoal(initial.profile.goal);
    setKcal(String(initial.profile.kcal));
    setUnit(initial.profile.unit);
    notice('Alle lokale gegevens zijn gewist.');
  }
  return (
    <Screen title="Profiel">
      <Heading
        title="Profiel en instellingen"
        description="Maak Fitnessity persoonlijk."
      />
      <Panel>
        <Field
          label="Weergavenaam"
          value={name}
          onChangeText={setName}
          maxLength={40}
          autoCapitalize="words"
        />
        <Select
          label="Trainingsdoel"
          value={goal}
          onChange={setGoal}
          options={['Spieropbouw', 'Afvallen', 'Conditie', 'Gezond blijven']}
        />
        <Field
          label="Dagdoel calorieën (kcal)"
          value={kcal}
          onChangeText={setKcal}
          keyboardType="number-pad"
        />
        <Select
          label="Gewichtseenheid"
          value={unit}
          onChange={(v) => setUnit(v as 'kg' | 'lbs')}
          options={[
            { value: 'kg', label: 'Kilogram (kg)' },
            { value: 'lbs', label: 'Pond (lbs)' },
          ]}
        />
        <Button onPress={save}>Instellingen opslaan</Button>
      </Panel>
      <Panel>
        <Text style={s.h3}>Gegevens verwijderen</Text>
        <Text style={s.muted}>
          Verwijder alle lokaal opgeslagen workouts, maaltijden en
          profielgegevens.
        </Text>
        <Button danger onPress={() => setClear(true)}>
          Alle gegevens wissen
        </Button>
      </Panel>
      {clear && (
        <Confirm
          title="Alle gegevens wissen?"
          description="Al je workouts, maaltijden, voorkeuren en profielgegevens worden van dit apparaat verwijderd. Dit kan niet ongedaan worden gemaakt."
          confirm="Alle gegevens wissen"
          onClose={() => setClear(false)}
          onConfirm={reset}
        />
      )}
    </Screen>
  );
}
