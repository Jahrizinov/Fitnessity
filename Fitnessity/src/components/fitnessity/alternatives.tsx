import { useState } from 'react';
import { Text } from 'react-native';
import { exerciseTip, movementOf, movements } from '@/data/catalog';
import type { Exercise } from '@/data/types';
import { useFitnessity } from '@/state/fitnessity';
import { alternatives } from '@/state/workout';
import { Button, Dialog, Panel, Select, s } from './ui';

export function Alternatives({
  exercise,
  onClose,
  onChoose,
}: {
  exercise: Exercise;
  onClose: () => void;
  onChoose?: (ex: Exercise) => void;
}) {
  const { state } = useFitnessity();
  const [equipment, setEquipment] = useState('');
  const options = alternatives(state, exercise);
  return (
    <Dialog title={`Alternatief voor ${exercise.name}`} onClose={onClose}>
      <Text style={s.eyebrow}>JOUW TRAINING. JOUW KEUZE.</Text>
      <Text style={s.muted}>
        Kies een vergelijkbare beweging die bij je past.
      </Text>
      <Select
        label="Filter op materiaal"
        value={equipment}
        onChange={setEquipment}
        options={[
          { value: '', label: 'Alle materialen' },
          ...new Set(options.map((ex) => ex.equipment)),
        ]}
      />
      {options
        .filter((ex) => !equipment || ex.equipment === equipment)
        .map((ex) => (
          <Panel key={ex.id} style={{ backgroundColor: '#121914' }}>
            <Text style={s.eyebrow}>
              {movementOf(ex) === movementOf(exercise)
                ? 'VERGELIJKBARE BEWEGING'
                : 'ZELFDE SPIERGROEP'}
            </Text>
            <Text style={s.h3}>{ex.name}</Text>
            <Text style={s.muted}>
              {ex.equipment} · {movements[movementOf(ex)]?.label}
            </Text>
            <Text style={s.small}>{exerciseTip(ex)}</Text>
            {onChoose && (
              <Button
                onPress={() => {
                  onChoose(ex);
                  onClose();
                }}
              >
                Kies deze oefening
              </Button>
            )}
          </Panel>
        ))}
      {!options.filter((ex) => !equipment || ex.equipment === equipment)
        .length && (
        <Text style={s.muted}>
          Geen passende alternatieven. Probeer een ander materiaal of pas je
          voorkeuren aan.
        </Text>
      )}
      <Text style={s.small}>
        Kies een uitvoering en gewicht die bij je passen. Aantallen en rust
        worden aangepast aan je nieuwe oefening.
      </Text>
    </Dialog>
  );
}
