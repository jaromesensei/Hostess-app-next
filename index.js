// ⚠️  MUST be the absolute first file executed.
// Polyfill browser-only globals before any library's top-level code runs.
// expo-router and nativewind both reference DOMRect in their module scope
// on Hermes — this prevents the crash even when those packages are present
// in node_modules.
import './src/polyfills';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
