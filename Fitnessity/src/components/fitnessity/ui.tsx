import { useState, type ReactNode } from 'react';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useFitnessity } from '@/state/fitnessity';

export const C = {
  bg: '#101211',
  sidebar: '#141715',
  card: '#1c201e',
  edge: '#343b36',
  text: '#f5f7f3',
  muted: '#a8b0aa',
  lime: '#c3ff4d',
};
const paths = {
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  exercises:
    '<path d="m6 5 13 13M4 7l3-3M2 5l3-3m12 18 3-3m-1 5 3-3M5 12l7-7m0 14 7-7"/>',
  workouts:
    '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6m-6 5h6"/>',
  progress: '<path d="M4 4v16h17M7 15l5-5 4 3 5-8"/>',
  nutrition:
    '<path d="M7 3v7m-3-7v5a3 3 0 0 0 6 0V3M7 11v10M19 3c-4 2-5 7-4 10h4m0-10v18"/>',
  profile:
    '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  avoid: '<circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/>',
  swap: '<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
export type IconName = keyof typeof paths;
export function Icon({
  name,
  color = C.text,
  size = 21,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  return (
    <SvgXml
      xml={`<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`}
      width={size}
      height={size}
    />
  );
}

export const s = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 24,
    width: '100%',
    maxWidth: 1384,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 0,
  },
  eyebrow: {
    color: C.lime,
    fontSize: 11.2,
    letterSpacing: 2,
    fontWeight: '800',
    lineHeight: 17,
  },
  pageTitle: {
    color: C.text,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    marginTop: 4,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 24,
    backgroundColor: '#344631',
    borderWidth: 1,
    borderColor: '#66804d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, color: C.lime, fontWeight: '900' },
  panel: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.edge,
    borderRadius: 10,
    padding: 17,
    gap: 14,
  },
  title: { color: C.text, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  h3: { color: C.text, fontSize: 20, fontWeight: '700', lineHeight: 26 },
  body: { color: C.text, fontSize: 16, lineHeight: 24 },
  muted: { color: C.muted, fontSize: 14, lineHeight: 22 },
  small: { color: C.muted, fontSize: 12, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 120,
    minHeight: 140,
    justifyContent: 'center',
    gap: 4,
  },
  statLabel: { color: C.muted, fontSize: 13.1, lineHeight: 20 },
  statValue: {
    color: C.lime,
    fontSize: 30,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -1.4,
    fontVariant: ['tabular-nums'],
  },
  statGoal: { fontSize: 20, letterSpacing: -0.6, paddingVertical: 5 },
  button: {
    minHeight: 46,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 17,
    backgroundColor: C.lime,
    borderWidth: 1,
    borderColor: C.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  soft: { backgroundColor: '#282e29', borderColor: '#485349' },
  selected: { backgroundColor: '#415b37', borderColor: '#89aa6a' },
  danger: { backgroundColor: 'transparent', borderColor: '#a64b50' },
  buttonText: {
    color: '#132012',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
    textAlign: 'center',
  },
  softText: { color: '#e8f3e2', fontWeight: '600' },
  selectedText: { color: C.lime },
  dangerText: { color: '#ed9a9c' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78 },
  field: { gap: 7, flexShrink: 1 },
  label: { color: '#dce6dc', fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: '#141b16',
    borderWidth: 1,
    borderColor: '#4a594a',
    borderRadius: 6,
    color: C.text,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputFocused: { borderColor: C.lime },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#485349',
    borderRadius: 6,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#20271f',
    justifyContent: 'center',
  },
  chipSelected: { borderColor: C.lime, backgroundColor: '#c3ff4d14' },
  chipText: { color: '#c4ccbf', fontSize: 12, fontWeight: '600' },
  tag: {
    backgroundColor: '#32412f',
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  tagText: { color: '#c4e2b4', fontSize: 11.4, fontWeight: '700' },
  separator: { borderTopWidth: 1, borderColor: C.edge, paddingTop: 14 },
  listLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#324034',
  },
  recommendation: {
    backgroundColor: '#141d14',
    borderColor: '#40503d',
    padding: 15,
  },
  bar: {
    height: 7,
    backgroundColor: '#344136',
    overflow: 'hidden',
    borderRadius: 2,
  },
  barFill: { height: '100%', backgroundColor: C.lime },
  backdrop: {
    flex: 1,
    backgroundColor: '#050805dd',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: {
    backgroundColor: '#1b211c',
    borderWidth: 1,
    borderColor: '#5e734b',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 730,
    maxHeight: '90%',
    alignSelf: 'center',
    gap: 18,
  },
  close: {
    minWidth: 42,
    minHeight: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#56634e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export function Header({ title }: { title: string }) {
  const { state } = useFitnessity();
  return (
    <View style={s.header}>
      <View style={s.flex}>
        <Text style={s.eyebrow}>FITNESSITY / JOUW TRAINING</Text>
        <Text accessibilityRole="header" style={s.pageTitle}>
          {title}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profiel"
        onPress={() => router.navigate('/profile')}
        style={s.avatar}
      >
        <Text style={s.avatarText}>
          {state.profile.name.trim().charAt(0).toUpperCase() || 'S'}
        </Text>
      </Pressable>
    </View>
  );
}
export function Screen({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {title && <Header title={title} />}
      {children}
    </ScrollView>
  );
}
export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.panel, style]}>{children}</View>;
}
export function Heading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <View style={{ gap: 5 }}>
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      {description && <Text style={s.muted}>{description}</Text>}
    </View>
  );
}
export function Button({
  children,
  onPress,
  soft,
  selected,
  danger,
  disabled,
  icon,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress: () => void;
  soft?: boolean;
  selected?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        soft && s.soft,
        selected && s.selected,
        danger && s.danger,
        disabled && s.disabled,
        pressed && s.pressed,
        style,
      ]}
    >
      {icon && <Icon name={icon} size={17} color={soft ? C.text : '#132012'} />}
      <Text
        style={[
          s.buttonText,
          soft && s.softText,
          selected && s.selectedText,
          danger && s.dangerText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  style,
  ...props
}: TextInputProps & { label: string; style?: TextInputProps['style'] }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8e9e91"
        selectionColor={C.lime}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          s.input,
          focused && s.inputFocused,
          props.editable === false && { backgroundColor: '#273224' },
          style,
        ]}
        {...props}
      />
    </View>
  );
}
export function Dialog({
  title,
  onClose,
  children,
  visible = true,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  visible?: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.dialog}
        >
          <View style={s.row}>
            <Text accessibilityRole="header" style={[s.title, s.flex]}>
              {title}
            </Text>
            <Pressable
              accessibilityLabel="Sluiten"
              accessibilityRole="button"
              onPress={onClose}
              style={s.close}
            >
              <Text style={[s.body, { fontSize: 24 }]}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16 }}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: (string | { value: string; label: string })[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const items = options.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  );
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${items.find((i) => i.value === value)?.label || value}`}
        onPress={() => setOpen(true)}
        style={[s.input, s.select]}
      >
        <Text style={[s.body, s.flex]}>
          {items.find((i) => i.value === value)?.label || value}
        </Text>
        <Text style={s.muted}>⌄</Text>
      </Pressable>
      {open && (
        <Dialog title={label} onClose={() => setOpen(false)}>
          {items.map((item) => (
            <Button
              key={item.value}
              soft
              selected={item.value === value}
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
            >
              {item.label}
            </Button>
          ))}
        </Dialog>
      )}
    </View>
  );
}
export function Chips({
  values,
  value,
  onChange,
}: {
  values: (string | { value: string; label: string })[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={s.wrap}>
      {values.map((o) => {
        const item = typeof o === 'string' ? { value: o, label: o } : o;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: item.value === value }}
            key={item.value}
            style={[s.chip, value === item.value && s.chipSelected]}
            onPress={() => onChange(item.value)}
          >
            <Text
              style={[s.chipText, value === item.value && { color: C.lime }]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Stat({
  label,
  value,
  hint,
  goal,
  fullWidth,
  children,
}: {
  label: string;
  value: string | number;
  hint: string;
  goal?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}) {
  return (
    <Panel
      style={[
        s.stat,
        fullWidth && { flexBasis: 'auto', flexGrow: 0, width: '100%' },
      ]}
    >
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, goal && s.statGoal]}>{value}</Text>
      <Text style={s.small}>{hint}</Text>
      {children}
    </Panel>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
      style={s.bar}
    >
      <View style={[s.barFill, { width: `${percent}%` }]} />
    </View>
  );
}
export function Preferences({
  id,
  type = 'exercise',
}: {
  id: string;
  type?: 'exercise' | 'workout';
}) {
  const { state, preference } = useFitnessity();
  const liked =
    type === 'workout'
      ? state.workoutPreferences[id] === 'like'
      : state.favorites.includes(id);
  const avoided =
    type === 'workout'
      ? state.workoutPreferences[id] === 'avoid'
      : state.avoidedExercises.includes(id);
  return (
    <View style={s.wrap}>
      <Button
        soft
        selected={liked}
        icon="heart"
        onPress={() => preference(id, type, 'like')}
        style={{ paddingHorizontal: 11, minHeight: 40 }}
      >
        {type === 'workout' ? 'Fijne workout' : 'Fijn'}
      </Button>
      <Button
        soft
        selected={avoided}
        icon="avoid"
        onPress={() => preference(id, type, 'avoid')}
        style={[
          { paddingHorizontal: 11, minHeight: 40 },
          avoided && { backgroundColor: '#4a332c', borderColor: '#ad7e70' },
        ]}
      >
        Liever niet
      </Button>
    </View>
  );
}
export function Confirm({
  title,
  description,
  confirm,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirm: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog title={title} onClose={onClose}>
      <Text style={s.muted}>{description}</Text>
      <Button
        danger
        onPress={() => {
          onConfirm();
          onClose();
        }}
      >
        {confirm}
      </Button>
      <Button soft onPress={onClose}>
        Annuleren
      </Button>
    </Dialog>
  );
}
export function HeroBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SvgXml
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        xml={
          '<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="base"><stop stop-color="#20261c"/><stop offset="1" stop-color="#181e19"/></linearGradient><radialGradient id="glow" cx="90%" cy="0%" r="90%"><stop stop-color="#455d20"/><stop offset="1" stop-color="#455d20" stop-opacity="0"/></radialGradient><pattern id="lines" width="165" height="600" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect x="95" width="40" height="600" fill="#c3ff4d" fill-opacity="0.03"/></pattern></defs><rect width="700" height="300" fill="url(#base)"/><rect width="700" height="300" fill="url(#glow)"/><rect width="700" height="300" fill="url(#lines)"/></svg>'
        }
      />
    </View>
  );
}
