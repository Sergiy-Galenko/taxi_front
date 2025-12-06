import 'react-native-gesture-handler';
import 'react-native-reanimated';
import './src/utils/reanimatedLegacyGestureHandlerPatch';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
