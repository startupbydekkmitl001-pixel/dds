/** PIN persistence: Keychain (expo-secure-store) on device, AsyncStorage on web. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { isNative } from '@/lib/platform';
import { DEMO_PIN } from './seed';

const KEY = 'dschool.pin';

export async function getPin(): Promise<string> {
  const stored = isNative ? await SecureStore.getItemAsync(KEY) : await AsyncStorage.getItem(KEY);
  return stored ?? DEMO_PIN;
}

export async function setPin(pin: string): Promise<void> {
  if (isNative) await SecureStore.setItemAsync(KEY, pin);
  else await AsyncStorage.setItem(KEY, pin);
}
