import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, Button, Divider, TextInput } from 'react-native-paper';

// TODO: отримувати роль користувача з контексту/стейту
const MOCK_ROLE: 'passenger' | 'driver' | 'admin' = 'passenger';

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [online, setOnline] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Карта');
  const [address, setAddress] = useState('');
  const [language, setLanguage] = useState('Українська');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Налаштування</Text>
      {MOCK_ROLE === 'passenger' && (
        <>
          <Text style={styles.sectionTitle}>Push-сповіщення</Text>
          <View style={styles.row}><Text>Увімкнути push-сповіщення</Text><Switch value={pushEnabled} onValueChange={setPushEnabled} color="#FF3B30" /></View>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Спосіб оплати</Text>
          <TextInput value={paymentMethod} onChangeText={setPaymentMethod} style={styles.input} mode="outlined" />
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Адреси</Text>
          <TextInput value={address} onChangeText={setAddress} style={styles.input} mode="outlined" placeholder="Додати адресу" />
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Мова</Text>
          <TextInput value={language} onChangeText={setLanguage} style={styles.input} mode="outlined" />
        </>
      )}
      {MOCK_ROLE === 'driver' && (
        <>
          <Text style={styles.sectionTitle}>Статус</Text>
          <View style={styles.row}><Text>Онлайн/Офлайн</Text><Switch value={online} onValueChange={setOnline} color="#FF3B30" /></View>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Дані авто</Text>
          <Button mode="outlined" style={styles.button}>Редагувати дані авто</Button>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Документи</Text>
          <Button mode="outlined" style={styles.button}>Переглянути документи</Button>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Графік</Text>
          <Button mode="outlined" style={styles.button}>Мій графік</Button>
        </>
      )}
      {MOCK_ROLE === 'admin' && (
        <>
          <Text style={styles.sectionTitle}>Керування користувачами</Text>
          <Button mode="outlined" style={styles.button}>Користувачі</Button>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Звіти</Text>
          <Button mode="outlined" style={styles.button}>Переглянути звіти</Button>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Тарифи</Text>
          <Button mode="outlined" style={styles.button}>Налаштувати тарифи</Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#FF3B30' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 18, marginBottom: 8, color: '#222' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  divider: { marginVertical: 10 },
  input: { backgroundColor: '#F8F8F8', marginBottom: 8 },
  button: { borderColor: '#FF3B30', borderWidth: 1, marginBottom: 8 },
}); 