import { Stack, router, usePathname, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { C, Icon, s, type IconName } from '@/components/fitnessity/ui';
import { FitnessityProvider, useFitnessity } from '@/state/fitnessity';

SplashScreen.preventAutoHideAsync().catch(() => {});
const tabs: { href: Href; label: string; title: string; icon: IconName }[] = [
  { href: '/', label: 'Home', title: 'Dashboard', icon: 'home' },
  {
    href: '/exercises',
    label: 'Oefeningen',
    title: 'Oefeningen',
    icon: 'exercises',
  },
  { href: '/workouts', label: 'Workouts', title: 'Workouts', icon: 'workouts' },
  {
    href: '/progress',
    label: 'Voortgang',
    title: 'Voortgang',
    icon: 'progress',
  },
  { href: '/nutrition', label: 'Voeding', title: 'Voeding', icon: 'nutrition' },
  { href: '/profile', label: 'Profiel', title: 'Profiel', icon: 'profile' },
];

function AppShell() {
  const { ready, message } = useFitnessity();
  const path = usePathname();
  const wide = useWindowDimensions().width >= 992;
  const insets = useSafeAreaInsets();
  const training = path === '/session';
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  const navigation = tabs.map((tab) => {
    const active =
      path === tab.href ||
      (tab.href === '/workouts' && path.startsWith('/plan/'));
    return (
      <Pressable
        key={String(tab.href)}
        accessibilityRole="tab"
        accessibilityLabel={tab.title}
        accessibilityState={{ selected: active }}
        onPress={() => router.navigate(tab.href)}
        style={({ pressed }) => [
          wide ? styles.sideLink : styles.mobileLink,
          wide && active && styles.sideActive,
          pressed && s.pressed,
        ]}
      >
        <Icon name={tab.icon} color={active ? C.lime : '#a8b4a7'} />
        <Text
          numberOfLines={1}
          style={[
            wide ? styles.sideText : styles.navText,
            active && { color: C.lime },
          ]}
        >
          {wide ? tab.title : tab.label}
        </Text>
      </Pressable>
    );
  });
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex}
      >
        <View style={styles.layout}>
          {wide && !training && (
            <View style={styles.sidebar}>
              <Text style={styles.brand}>
                FITNESSITY<Text style={{ color: C.lime }}>.</Text>
              </Text>
              <Text style={styles.tagline}>TRAIN SMARTER</Text>
              <View style={{ gap: 8, marginTop: 40 }}>{navigation}</View>
              <Text style={[s.small, { marginTop: 'auto' }]}>
                Jouw inzet. Jouw resultaat.
              </Text>
            </View>
          )}
          <View style={s.flex}>
            {ready ? (
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: C.bg },
                  animation: 'none',
                }}
              />
            ) : (
              <View style={[s.flex, { justifyContent: 'center' }]}>
                <ActivityIndicator
                  color={C.lime}
                  accessibilityLabel="Fitnessity laden"
                />
              </View>
            )}
          </View>
        </View>
        {!wide && !training && (
          <View
            accessibilityRole="tablist"
            style={[styles.nav, { paddingBottom: Math.max(8, insets.bottom) }]}
          >
            {navigation}
          </View>
        )}
        {message ? (
          <View
            pointerEvents="none"
            style={[
              styles.toast,
              {
                bottom:
                  !wide && !training ? 85 + insets.bottom : 20 + insets.bottom,
              },
            ]}
          >
            <Text
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={s.buttonText}
            >
              {message}
            </Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FitnessityProvider>
        <AppShell />
      </FitnessityProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  layout: { flex: 1, flexDirection: 'row' },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#19211a',
    borderTopWidth: 1,
    borderColor: C.edge,
    paddingTop: 8,
    paddingHorizontal: 3,
  },
  mobileLink: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 1,
    minHeight: 46,
  },
  navText: { color: '#a8b4a7', fontSize: 9.8 },
  sidebar: {
    width: 248,
    backgroundColor: C.sidebar,
    borderRightWidth: 1,
    borderColor: C.edge,
    padding: 24,
  },
  brand: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  tagline: { color: C.muted, fontSize: 10, letterSpacing: 2.5, marginTop: 4 },
  sideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderRadius: 6,
  },
  sideText: { color: '#bdc6ba', fontSize: 16, fontWeight: '600' },
  sideActive: { backgroundColor: '#c3ff4d14' },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: C.lime,
    borderRadius: 8,
    padding: 16,
    zIndex: 100,
  },
});
