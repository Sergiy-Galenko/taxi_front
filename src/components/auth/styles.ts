import { StyleSheet } from 'react-native';

/**
 * Shared styles for auth screens using react-native-paper components
 * (DriverRegistration). Kept for backward compatibility.
 * Note: PassengerRegistration now uses passenger theme directly.
 */
export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1A1A1A',
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 20,
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  switchText: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    color: '#CCCCCC',
  },
  link: {
    color: '#F4B400',
    textAlign: 'center',
    marginTop: 20,
  },
});