import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
	createNavigationContainerRef,
	NavigationContainer,
} from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import AvailableDevices from '../screens/AvailableDevices';

// Definim tipurile pentru rutele navigatorului
export type RootStackParamList = {
	Home: undefined;
	AvailableDevices: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const AppNavigator = () => {
	return (
		<NavigationContainer ref={navigationRef}>
			<Stack.Navigator>
				<Stack.Screen
					name='Home'
					component={HomeScreen}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name='AvailableDevices'
					component={AvailableDevices}
					options={{ headerShown: false }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;
