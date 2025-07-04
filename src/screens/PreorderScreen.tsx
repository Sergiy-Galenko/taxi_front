import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const PreorderScreen = ({ navigation }: any) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const handlePreorder = () => {
    // TODO: send preorder to API
    navigation.goBack();
    alert('Передзамовлення створено на ' + date.toLocaleString());
  };

  return (
    <LinearGradient
      colors={['#141414', '#1a1a1a', '#000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Передзамовлення таксі</Text>
        <View style={{ width: 40 }} /> {/* Для вирівнювання */}
      </View>

      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#E50914', '#B20710']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="schedule" size={40} color="#FFF" />
          </LinearGradient>
        </View>

        <Text style={styles.subtitle}>Оберіть дату та час</Text>
        <Text style={styles.description}>
          Забронюйте таксі заздалегідь та приїжджайте вчасно
        </Text>

        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.dateText}>
            {date.toLocaleString('uk-UA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          <MaterialIcons name="edit" size={24} color="#E50914" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="spinner"
            onChange={onChange}
            themeVariant="dark"
            textColor="#FFF"
            accentColor="#E50914"
          />
        )}

        <Button 
          mode="contained" 
          style={styles.confirmButton}
          buttonColor="#E50914"
          onPress={handlePreorder}
          labelStyle={styles.buttonLabel}
        >
          Підтвердити замовлення
        </Button>
      </Animated.View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={24} color="#E50914" />
          <Text style={styles.infoText}>Водій приїде за 5-10 хвилин до вказаного часу</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="card-outline" size={24} color="#E50914" />
          <Text style={styles.infoText}>Оплата відбувається при посадці</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="close-circle-outline" size={24} color="#E50914" />
          <Text style={styles.infoText}>Безкоштовна відміна за 30 хвилин до часу</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(30,30,30,0.8)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(80,80,80,0.5)',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#BBB',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50,50,50,0.6)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 30,
    width: '100%',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
  },
  dateText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  buttonLabel: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(80,80,80,0.5)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    color: '#FFF',
    marginLeft: 12,
    fontSize: 15,
    flex: 1,
  },
});

export default PreorderScreen;