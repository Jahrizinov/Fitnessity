# Fitnessity mobile

React Native / Expo SDK 58 version of the original Fitnessity app in the parent folder (`../index.html`, `../style.css`, and `../script.js`). The native screens reuse the original dark green palette, lime accents, Dutch copy, icons, exercise catalog, and workout templates.

## Try it on your phone

```sh
npm install
npx expo start
```

Keep the phone and computer on the same Wi-Fi network. Open the QR code with Expo Go on Android, or scan it with the Camera app on iPhone and open it in Expo Go. Use an Expo Go version compatible with SDK 58. The app's storage and SVG packages are included in Expo Go.

On a physical iPhone, Expo CLI and Expo Go must be signed in to the same Expo account. Run `npx expo login` on the computer if needed, then sign in to that account in Expo Go. See [Expo's device instructions](https://docs.expo.dev/get-started/start-developing/).

For a browser preview, press `w` in the Expo terminal or run `npm run web`. This is useful for checking responsive layouts; native keyboard, gestures, and safe areas still need a real-device check.

## Included

- Dashboard with weekly totals and FIT PULSE recommendations.
- All 42 original exercises, search and filters, favorites, alternatives, and custom exercises.
- All 12 original workout templates, custom workouts, and saved exercise choices.
- Workout sessions with reps/seconds, kg/lbs, set logging, rest timers, resume, and completion history. Swapping or avoiding exercises preserves completed sets.
- Progress chart and personal weight records.
- Manual calorie/protein tracking and editable profile settings.
- Local device storage for profile, preferences, meals, workouts, and the active session. Browser and phone data are separate; existing data from the original HTML app is not automatically imported. No backend or account is required.

## Project structure

`src/app/` contains Expo Router screens. Shared native UI is in `src/components/fitnessity/`, larger screens in `src/features/`, the original catalog in `src/data/`, and storage/workout logic in `src/state/`.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npx expo export --platform all
```

The tests cover workout planning, recommendations, unit conversion, input validation, session serialization, exercise swaps, and completion. Export checks JavaScript and Hermes bundles for Android, iOS, and web; it does not replace running the app on a physical device.
