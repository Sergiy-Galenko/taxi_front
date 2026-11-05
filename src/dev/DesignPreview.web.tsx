import React from "react";
import { View } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DriverDraftProvider } from "../features/auth/DriverDraft";
import { RootStackParamList } from "../types/navigation";
import Login from "../screens/auth/Login";
import RoleSelection from "../screens/auth/RoleSelection";
import PassengerRegistration from "../screens/auth/PassengerRegistration";
import DriverRegistration from "../screens/auth/driver/Registration";
import PersonalInfo from "../screens/auth/driver/PersonalInfo";
import ContactInfo from "../screens/auth/driver/ContactInfo";
import CarInfo from "../screens/auth/driver/CarInfo";
import LicenseInfo from "../screens/auth/driver/LicenseInfo";
import PasswordSetup from "../screens/auth/driver/PasswordSetup";
import Verification from "../screens/auth/driver/Verification";
import Home from "../screens/Home";
import VehicleSelection from "../screens/passenger/VehicleSelection";
import DriverSearch from "../screens/passenger/DriverSearch";
import ActiveRide from "../screens/passenger/ActiveRide";
import Preorder from "../screens/PreorderScreen";
import History from "../screens/TripHistoryScreen";
import Settings from "../screens/Settings";
import DriverHome from "../screens/driver/Home";
import { useDesign } from "../design-system/hooks/useDesign";
const Stack = createNativeStackNavigator<RootStackParamList>();
const navigation = createNavigationContainerRef<RootStackParamList>();
/** Explicit development-only visual harness: no session injection, token, API mock or successful transaction. */
export default function DesignPreview() {
  const { colors } = useDesign();
  function choose(value: string) {
    if (!navigation.isReady()) return;
    switch (value) {
      case "Home":
        navigation.navigate("Home");
        break;
      case "VehicleSelection":
        navigation.navigate("VehicleSelection", { from: "", to: "" });
        break;
      case "DriverSearch":
        navigation.navigate("DriverSearch", {
          from: "",
          to: "",
          rideType: "comfort",
          paymentMethod: "cash",
        });
        break;
      case "ActiveRide":
        navigation.navigate("ActiveRide", { rideId: "" });
        break;
      case "Preorder":
        navigation.navigate("Preorder");
        break;
      case "TripHistory":
        navigation.navigate("TripHistory");
        break;
      case "Settings":
        navigation.navigate("Settings");
        break;
      case "DriverHome":
        navigation.navigate("DriverHome");
        break;
      case "PassengerRegistration":
        navigation.navigate("PassengerRegistration");
        break;
      case "DriverRegistration":
        navigation.navigate("DriverRegistration");
        break;
      case "RoleSelection":
        navigation.navigate("RoleSelection");
        break;
      default:
        navigation.navigate("Login");
    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <div
        style={{
          minHeight: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 12px",
          flexWrap: "wrap",
          background: colors.inset,
          color: colors.secondary,
          font: "11px system-ui",
        }}
      >
        <span>DESIGN PREVIEW · NO SESSION OVERRIDE</span>
        <select
          aria-label="Preview screen"
          defaultValue="Login"
          onChange={(event) => choose(event.target.value)}
          style={{
            background: colors.surface,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            padding: 6,
            borderRadius: 6,
          }}
        >
          {[
            "Login",
            "RoleSelection",
            "PassengerRegistration",
            "DriverRegistration",
            "Home",
            "VehicleSelection",
            "DriverSearch",
            "ActiveRide",
            "Preorder",
            "TripHistory",
            "Settings",
            "DriverHome",
          ].map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>
      <DriverDraftProvider>
        <NavigationContainer ref={navigation}>
          <Stack.Navigator
            screenOptions={{ headerShown: false, animation: "none" }}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="RoleSelection" component={RoleSelection} />
            <Stack.Screen
              name="PassengerRegistration"
              component={PassengerRegistration}
            />
            <Stack.Screen
              name="DriverRegistration"
              component={DriverRegistration}
            />
            <Stack.Screen name="DriverPersonalInfo" component={PersonalInfo} />
            <Stack.Screen name="DriverContactInfo" component={ContactInfo} />
            <Stack.Screen name="DriverCarInfo" component={CarInfo} />
            <Stack.Screen name="DriverLicenseInfo" component={LicenseInfo} />
            <Stack.Screen
              name="DriverPasswordSetup"
              component={PasswordSetup}
            />
            <Stack.Screen name="DriverVerification" component={Verification} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen
              name="VehicleSelection"
              component={VehicleSelection}
            />
            <Stack.Screen name="DriverSearch" component={DriverSearch} />
            <Stack.Screen name="ActiveRide" component={ActiveRide} />
            <Stack.Screen name="Preorder" component={Preorder} />
            <Stack.Screen name="TripHistory" component={History} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="DriverHome" component={DriverHome} />
          </Stack.Navigator>
        </NavigationContainer>
      </DriverDraftProvider>
    </View>
  );
}
