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

const SECONDS_TO_SCAN_FOR = 3;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

declare module 'react-native-ble-manager' {
	// enrich local contract with custom state properties needed by App.tsx
	interface Peripheral {
		connected?: boolean;
		connecting?: boolean;
	}
}
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
	const theme = useTheme();
	const colors = theme.colors;
	const [isScanning, setIsScanning] = useState(false);
	const [peripherals, setPeripherals] = useState(
		new Map<Peripheral['id'], Peripheral>()
	);
	const navigation = useNavigation<HomeScreenNavigationProp>();

	const startScan = () => {
		if (!isScanning) {
			// reset found peripherals before scan
			setPeripherals(new Map<Peripheral['id'], Peripheral>());

			try {
				console.debug('[startScan] starting scan...');
				setIsScanning(true);
				BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
					matchMode: BleScanMatchMode.Sticky,
					scanMode: BleScanMode.LowLatency,
					callbackType: BleScanCallbackType.AllMatches,
				})
					.then(() => {
						console.debug('[startScan] scan promise returned successfully.');
					})
					.catch((err: any) => {
						console.error('[startScan] ble scan returned in error', err);
					});
			} catch (error) {
				console.error('[startScan] ble scan error thrown', error);
			}
		}
	};

	const enableBluetooth = async () => {
		try {
			console.debug('[enableBluetooth]');
			await BleManager.enableBluetooth();
		} catch (error) {
			console.error('[enableBluetooth] thrown', error);
		}
	};

	const handleStopScan = () => {
		setIsScanning(false);
		console.debug('[handleStopScan] scan is stopped.');

		navigation.navigate('AvailableDevices');
	};

	const handleDiscoverPeripheral = (peripheral: Peripheral) => {
		console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);
		if (!peripheral.name) {
			peripheral.name = 'NO NAME';
		}
		setPeripherals((map) => {
			return new Map(map.set(peripheral.id, peripheral));
		});
	};

	useEffect(() => {
		try {
			BleManager.start({ showAlert: false })
				.then(() => console.debug('BleManager started.'))
				.catch((error: any) =>
					console.error('BeManager could not be started.', error)
				);
		} catch (error) {
			console.error('unexpected error starting BleManager.', error);
			return;
		}

		const listeners: any[] = [
			BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
			BleManager.onStopScan(handleStopScan),

			,
		];

		handleAndroidPermissions();

		return () => {
			console.debug('[app] main component unmounting. Removing listeners...');
			for (const listener of listeners) {
				listener.remove();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAndroidPermissions = () => {
		if (Platform.OS === 'android' && Platform.Version >= 31) {
			PermissionsAndroid.requestMultiple([
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
			]).then((result) => {
				if (result) {
					console.debug(
						'[handleAndroidPermissions] User accepts runtime permissions android 12+'
					);
				} else {
					console.error(
						'[handleAndroidPermissions] User refuses runtime permissions android 12+'
					);
				}
			});
		} else if (Platform.OS === 'android' && Platform.Version >= 23) {
			PermissionsAndroid.check(
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
			).then((checkResult) => {
				if (checkResult) {
					console.debug(
						'[handleAndroidPermissions] runtime permission Android <12 already OK'
					);
				} else {
					PermissionsAndroid.request(
						PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
					).then((requestResult) => {
						if (requestResult) {
							console.debug(
								'[handleAndroidPermissions] User accepts runtime permission android <12'
							);
						} else {
							console.error(
								'[handleAndroidPermissions] User refuses runtime permission android <12'
							);
						}
					});
				}
			});
		}
	};

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
						onPress={startScan}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default HomeScreen;
