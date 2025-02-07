import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import AppNavigator from './src/navigation/AppNavigator';

import * as SplashScreen from 'expo-splash-screen';

import theme from './theme/theme';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { BluetoothProvider } from './src/context/BluetoothContext';

const App = () => {
	const [fontsLoaded] = useFonts({
		'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
		'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
		'Poppins-Black': require('./assets/fonts/Poppins-Black.ttf'),
	});

	useEffect(() => {
		async function prepare() {
			if (fontsLoaded) {
				await SplashScreen.hideAsync();
			}
		}
		prepare();
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null; // Așteaptă încărcarea fonturilor
	}
	return (
		<PaperProvider theme={theme.paperTheme}>
			<ThemeProvider theme={theme}>
				<BluetoothProvider>
					<AppNavigator />
				</BluetoothProvider>
			</ThemeProvider>
		</PaperProvider>
	);
};

export default App;
