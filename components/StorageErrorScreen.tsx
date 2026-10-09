// Shown when on-device data can't be loaded. Never a dead end: transient
// errors (STORE_UNAVAILABLE) get "Try again"; every other code also gets a
// confirmed "Reset data on this device". The error code is shown for support.
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { recoveryOptions } from '../context/storageRecovery';

export function StorageErrorScreen({ code, onRetry, onReset }: {
  code: string;
  onRetry: () => void;
  onReset: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const { reset } = recoveryOptions(code);

  const confirmReset = () => {
    Alert.alert(
      'Reset data on this device? / Futa data kwenye kifaa hiki?',
      'All data saved in this app on this device will be permanently deleted and CANNOT be recovered. This cannot be undone.\n\n' +
        'Data yote iliyohifadhiwa na programu hii kwenye kifaa hiki itafutwa kabisa na HAIWEZI kurejeshwa. Hatua hii haiwezi kutenduliwa.',
      [
        { text: 'Cancel / Ghairi', style: 'cancel' },
        {
          text: 'Delete permanently / Futa kabisa',
          style: 'destructive',
          onPress: () => {
            setBusy(true);
            onReset().catch(() => {
              Alert.alert(
                'Reset failed / Imeshindwa kufuta',
                'Some data could not be deleted. Please try again. / Baadhi ya data haikuweza kufutwa. Tafadhali jaribu tena.',
              );
            }).finally(() => setBusy(false));
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
        {"We couldn't open your saved data on this device. Nothing has been changed or deleted."}
        {'\n\n'}Hatukuweza kufungua data yako iliyohifadhiwa. Hakuna kilichobadilishwa au kufutwa.
      </Text>
      <Text selectable accessibilityLabel={`Error code ${code}`} style={{ fontSize: 13, opacity: 0.7, marginBottom: 20 }}>
        Error code / Msimbo wa hitilafu: {code}
      </Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={onRetry} style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Try again / Jaribu tena</Text>
      </Pressable>
      {reset && (
        <Pressable accessibilityRole="button" disabled={busy} onPress={confirmReset} style={{ padding: 12, marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#B42318' }}>
            Reset data on this device / Futa data kwenye kifaa hiki
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/** Persistent banner while the latest save has failed. */
export function SaveErrorBanner() {
  return (
    <View accessibilityRole="alert" style={{ backgroundColor: '#FEF3F2', padding: 10 }}>
      <Text style={{ color: '#B42318', fontSize: 13, textAlign: 'center' }}>
        {"Your latest changes couldn't be saved on this device. / Mabadiliko yako ya mwisho hayakuweza kuhifadhiwa."}
      </Text>
    </View>
  );
}
