import { WebView } from 'react-native-webview';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import React from 'react';

function resolveWebAppUrl(): string {
  // Prefer value from app.json -> expo.extra.webUrl if provided
  const extra = (Constants?.expoConfig as any)?.extra || {};
  if (typeof extra.webUrl === 'string' && extra.webUrl.length > 0) {
    return extra.webUrl as string;
  }

  // Default for Android emulator to access host machine dev server
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  // Fallback: common localhost for iOS simulator
  return 'http://localhost:3000';
}

export default function HomeScreen() {
  const uri = resolveWebAppUrl();
  const webRef = React.useRef<WebView>(null);

  const respondToWeb = (message: unknown) => {
    try {
      const payload = JSON.stringify(message);
      const js = `window.__KGM_onNativeMessage && window.__KGM_onNativeMessage(${JSON.stringify(payload)}); true;`;
      webRef.current?.injectJavaScript(js);
    } catch {}
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event?.nativeEvent?.data ?? '{}');
      const type = data?.type;
      const filePath = FileSystem.documentDirectory + 'kinogutscheine.json';
      if (type === 'KGM_FS_READ') {
        try {
          const info = await FileSystem.getInfoAsync(filePath);
          if (info.exists) {
            const text = await FileSystem.readAsStringAsync(filePath, { encoding: FileSystem.EncodingType.UTF8 });
            respondToWeb({ type: 'KGM_FS_DATA', data: text });
          } else {
            await FileSystem.writeAsStringAsync(filePath, '[]', { encoding: FileSystem.EncodingType.UTF8 });
            respondToWeb({ type: 'KGM_FS_DATA', data: '[]' });
          }
        } catch {
          respondToWeb({ type: 'KGM_FS_ERROR', message: 'READ_FAILED' });
        }
      } else if (type === 'KGM_FS_WRITE') {
        try {
          const content = typeof data?.data === 'string' ? data.data : JSON.stringify(data?.data ?? []);
          await FileSystem.writeAsStringAsync(filePath, content, { encoding: FileSystem.EncodingType.UTF8 });
          respondToWeb({ type: 'KGM_FS_WRITTEN' });
        } catch {
          respondToWeb({ type: 'KGM_FS_ERROR', message: 'WRITE_FAILED' });
        }
      }
    } catch {
      // ignore
    }
  };

  const injected = `
    (function(){
      try { window.__KGM_isNative = true; } catch (e) {}
    })();
    true;
  `;

  return (
    <WebView
      ref={webRef}
      source={{ uri }}
      onMessage={handleMessage}
      injectedJavaScript={injected}
      domStorageEnabled
      style={{ flex: 1 }}
    />
  );
}
