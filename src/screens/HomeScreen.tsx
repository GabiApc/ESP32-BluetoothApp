import React, { useEffect, useState } from 'react';
import {
	View,
	PermissionsAndroid,
	Platform,
	NativeEventEmitter,
	NativeModules,
	StatusBar,
	StyleSheet,
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useTheme } from 'styled-components';
import { SafeAreaView } from 'react-native-safe-area-context';
import BleManager, {
	BleDisconnectPeripheralEvent,
	BleManagerDidUpdateValueForCharacteristicEvent,
	BleScanCallbackType,
	BleScanMatchMode,
	BleScanMode,
	Peripheral,
	PeripheralInfo,
} from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
	handleAndroidPermissions,
	handleDiscoverPeripheral,
	startBleManager,
	startScan,
	stopScan,
} from '../services/bluetoothService';
import { useBluetooth } from '../context/BluetoothContext';

declare module 'react-native-ble-manager' {
	// enrich local contract with custom state properties needed by App.tsx
	interface Peripheral {
		connected?: boolean;
		connecting?: boolean;
	}
}
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const HomeScreen = () => {
	const theme = useTheme();
	const colors = theme.colors;
	const [isScanning, setIsScanning] = useState(false);
	const { state, dispatch } = useBluetooth(); // Preluăm `dispatch` corect

	const navigation = useNavigation<HomeScreenNavigationProp>();

	useEffect(() => {
		handleAndroidPermissions();

		BleManager.start({ showAlert: false }).then(() => {
			console.debug('BleManager started.');
		});

		// Adăugăm evenimentul de descoperire
		const discoverListener = bleManagerEmitter.addListener(
			'BleManagerDiscoverPeripheral',
			(peripheral: Peripheral) => {
				handleDiscoverPeripheral(peripheral, dispatch);
			}
		);

		// Adăugăm evenimentul pentru oprirea scanării
		const stopScanListener = bleManagerEmitter.addListener(
			'BleManagerStopScan',
			() => {
				console.debug('[BleManagerStopScan] Scan has stopped.');
				stopScan(dispatch, navigation);
			}
		);

		return () => {
			discoverListener.remove();
			stopScanListener.remove();
		};
	}, []);

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.primary,
			alignItems: 'center',
			justifyContent: 'flex-start',
			width: '100%',
		},
		title: {
			color: colors.text,
			fontSize: 42,
			fontFamily: theme.fontFamilies.black,
			textShadowColor: 'rgba(208, 208, 208, 0.4)',
			textShadowOffset: { width: 0, height: 5 },
			textShadowRadius: 2,
			textAlign: 'center',
			lineHeight: 48,
			marginTop: 50,
		},
		text: {
			color: colors.text,
			fontSize: theme.fontSizes.medium,
			fontFamily: theme.fontFamilies.regular,
			textAlign: 'center',
			marginTop: 20,
			marginHorizontal: 15,
		},
	});

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle='light-content' backgroundColor={colors.primary} />
			<View style={styles.container}>
				<Text style={styles.title}>Căutare{'\n'}gateway</Text>
				<Text style={styles.text}>
					Fii sigur că gateway-ul este activ pentru a apărea în lista de
					dispozitive.
				</Text>
				<View
					style={{
						position: 'absolute',
						height: '100%',
						width: '100%',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
					<IconButton
						mode='contained'
						containerColor={colors.secondary}
						iconColor={colors.textSecondary}
						icon='bluetooth'
						size={95}
						onPress={() => startScan(dispatch)}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default HomeScreen;
