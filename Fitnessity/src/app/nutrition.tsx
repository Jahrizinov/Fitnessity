import { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Field,
  Heading,
  Panel,
  ProgressBar,
  Screen,
  Select,
  Stat,
  s,
} from '@/components/fitnessity/ui';
import { useFitnessity } from '@/state/fitnessity';
import { numberValue, todayKey, uid } from '@/state/workout';

export default function NutritionScreen() {
  const { state, update, notice } = useFitnessity();
  const [name, setName] = useState('');
  const [type, setType] = useState('Ontbijt');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const today = state.meals.filter((m) => todayKey(m.date) === todayKey());
  const calories = today.reduce((n, m) => n + m.kcal, 0);
  function save() {
    const calories = numberValue(kcal),
      grams = numberValue(protein);
    if (
      !name.trim() ||
      !Number.isFinite(calories) ||
      calories < 0 ||
      calories > 10000 ||
      !Number.isFinite(grams) ||
      grams < 0 ||
      grams > 1000
    ) {
      notice('Vul een naam, geldige calorieën en eiwitten in.');
      return;
    }
    update((prev) => ({
      ...prev,
      meals: [
        ...prev.meals,
        {
          id: uid(),
          name: name.trim(),
          type,
          kcal: calories,
          protein: grams,
          date: new Date().toISOString(),
        },
      ],
    }));
    setName('');
    setKcal('');
    setProtein('');
    notice('Maaltijd opgeslagen.');
  }
  return (
    <Screen title="Voeding">
      <Heading
        title="Voedingstracker"
        description="Houd vandaag je calorieën en eiwitten bij."
      />
      <View style={{ gap: 16 }}>
        <Stat
          fullWidth
          label="Calorieën vandaag"
          value={Math.round(calories)}
          hint="kcal"
        >
          <View style={{ marginTop: 12, gap: 8 }}>
            <ProgressBar
              value={(calories / state.profile.kcal) * 100}
              label="Dagdoel calorieën"
            />
            <Text style={s.small}>
              {Math.round(calories)} van {state.profile.kcal} kcal · jouw
              dagdoel
            </Text>
          </View>
        </Stat>
        <Stat
          fullWidth
          label="Eiwitten vandaag"
          value={Number(today.reduce((n, m) => n + m.protein, 0).toFixed(1))}
          hint="gram"
        />
        <Stat
          fullWidth
          label="Maaltijden"
          value={today.length}
          hint="Vandaag geregistreerd"
        />
      </View>
      <Panel>
        <Text style={s.h3}>Maaltijd toevoegen</Text>
        <Field
          label="Naam"
          value={name}
          onChangeText={setName}
          placeholder="Bijv. Kwark met fruit"
          maxLength={80}
        />
        <Select
          label="Maaltijdmoment"
          value={type}
          onChange={setType}
          options={['Ontbijt', 'Lunch', 'Avondeten', 'Snack']}
        />
        <View style={[s.row, { alignItems: 'flex-start' }]}>
          <View style={s.flex}>
            <Field
              label="Calorieën (kcal)"
              value={kcal}
              onChangeText={setKcal}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={s.flex}>
            <Field
              label="Eiwit (gram)"
              value={protein}
              onChangeText={setProtein}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
        <Button onPress={save}>Maaltijd opslaan</Button>
        <Text style={s.small}>
          Dit is handmatige registratie, geen foto- of barcodescanner.
        </Text>
      </Panel>
      <Panel>
        <Text style={s.h3}>Vandaag gegeten</Text>
        {today.length ? (
          [...today].reverse().map((meal) => (
            <View key={meal.id} style={s.listLine}>
              <View style={s.flex}>
                <Text style={[s.body, { fontWeight: '700' }]}>{meal.name}</Text>
                <Text style={s.small}>
                  {meal.type} · {meal.kcal} kcal · {meal.protein} g eiwit
                </Text>
              </View>
              <Button
                soft
                accessibilityLabel={`Verwijder ${meal.name}`}
                onPress={() =>
                  update((prev) => ({
                    ...prev,
                    meals: prev.meals.filter((m) => m.id !== meal.id),
                  }))
                }
              >
                ×
              </Button>
            </View>
          ))
        ) : (
          <Text style={s.muted}>
            Je hebt vandaag nog geen maaltijden toegevoegd.
          </Text>
        )}
      </Panel>
    </Screen>
  );
}
