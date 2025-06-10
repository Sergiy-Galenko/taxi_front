import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  secureTextEntry?: boolean;
  icon?: MaterialCommunityIconName;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry = false,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
  placeholder,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(!secureTextEntry);
  
  // Анімаційні значення
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const borderColorAnim = React.useRef(new Animated.Value(0)).current;
  const errorOpacityAnim = React.useRef(new Animated.Value(0)).current;

  // Анімація при фокусі
  const animateFocus = (focused: boolean) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.02 : 1,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(borderColorAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Анімація помилки
  React.useEffect(() => {
    if (error) {
      Animated.spring(errorOpacityAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(errorOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error]);

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2C2C2E', '#FF3B30'],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.inputContainer,
          {
            transform: [{ scale: scaleAnim }],
            borderColor: error ? '#FF3B30' : borderColor,
            backgroundColor: isFocused ? '#2C2C2E' : '#1C1C1E',
          },
        ]}
      >
        {icon && (
          <Animated.View style={{ opacity: isFocused ? 1 : 0.7 }}>
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={error ? '#FF3B30' : isFocused ? '#FF3B30' : '#8E8E93'}
              style={styles.icon}
            />
          </Animated.View>
        )}
        <TextInput
          mode="flat"
          label={label}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setIsFocused(true);
            animateFocus(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            animateFocus(false);
            onBlur?.();
          }}
          secureTextEntry={secureTextEntry && !showPassword}
          style={[styles.input, { color: '#FFFFFF' }]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          textColor="#FFFFFF"
          placeholderTextColor="#8E8E93"
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          theme={{
            colors: {
              primary: '#FF3B30',
              background: 'transparent',
              text: '#FFFFFF',
              placeholder: '#8E8E93',
              onSurface: '#FFFFFF',
              onSurfaceVariant: '#FFFFFF',
            },
          }}
        />
        {secureTextEntry && (
          <Animated.View style={{ opacity: isFocused ? 1 : 0.7 }}>
            <IconButton
              icon={showPassword ? 'eye-off' : 'eye'}
              iconColor={isFocused ? '#FF3B30' : '#8E8E93'}
              size={24}
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            />
          </Animated.View>
        )}
      </Animated.View>
      <Animated.View 
        style={[
          styles.errorContainer,
          { opacity: errorOpacityAnim }
        ]}
      >
        {error && (
          <>
            <MaterialCommunityIcons
              name="alert-circle"
              size={16}
              color="#FF3B30"
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{error}</Text>
          </>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    paddingHorizontal: 12,
    height: 56,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    height: 56,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  eyeIcon: {
    margin: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  errorIcon: {
    marginRight: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
}); 