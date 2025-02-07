import {
	NativeEventEmitter,
	NativeModules,
	PermissionsAndroid,
	Platform,
} from 'react-native';
import BleManager, {
	BleScanCallbackType,
	BleScanMatchMode,
	BleScanMode,
	Peripheral,
} from 'react-native-ble-manager';
import { useBluetooth } from '../context/BluetoothContext';

const SECONDS_TO_SCAN_FOR = 3;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Start BLE Manager
export const startBleManager = async () => {
	try {
		await BleManager.start({ showAlert: false });
		console.debug('BleManager started.');
	} catch (error) {
		console.error('BleManager could not be started.', error);
	}
};

bleManagerEmitter.addListener('BleManagerStopScan', () => {
	console.debug('[GLOBAL] BleManagerStopScan event received.');
});

// Enable Bluetooth
export const enableBluetooth = async () => {
	try {
		await BleManager.enableBluetooth();
		console.debug('Bluetooth enabled.');
	} catch (error) {
		console.error('Failed to enable Bluetooth.', error);
	}
};

export const stopScan = (dispatch: React.Dispatch<any>, navigation: any) => {
	console.debug('[stopScan] Stopping scan...');

	dispatch({ type: 'SET_SCANNING', isScanning: false });

	setTimeout(() => {
		navigation.navigate('AvailableDevices');
	}, 500); // Adăugăm un mic delay pentru siguranță
};

// Start scanning for devices
export const startScan = async (dispatch: React.Dispatch<any>) => {
	console.debug('[startScan] Starting BLE scan...');
	dispatch({ type: 'SET_SCANNING', isScanning: true });
	dispatch({ type: 'RESET_PERIPHERALS' });

	try {
		await BleManager.scan([], 5, true, {
			matchMode: BleScanMatchMode.Sticky,
			scanMode: BleScanMode.LowLatency,
			callbackType: BleScanCallbackType.AllMatches,
		});
		console.debug('[startScan] Scan started successfully.');
	} catch (error) {
		console.error('[startScan] Scan error:', error);
		dispatch({ type: 'SET_SCANNING', isScanning: false });
	}
};

// Funcție care adaugă dispozitivul în state-ul global
export const handleDiscoverPeripheral = (
	peripheral: Peripheral,
	dispatch: React.Dispatch<any>
) => {
	if (!peripheral.name) peripheral.name = 'Unknown';

	dispatch({ type: 'ADD_PERIPHERAL', peripheral });
};

// Handle permissions for Android
export const handleAndroidPermissions = async () => {
	if (Platform.OS === 'android' && Platform.Version >= 31) {
		const result = await PermissionsAndroid.requestMultiple([
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
		]);
		if (result) {
			console.debug(
				'[handleAndroidPermissions] Permissions granted (Android 12+)'
			);
		} else {
			console.error(
				'[handleAndroidPermissions] Permissions denied (Android 12+)'
			);
		}
	} else if (Platform.OS === 'android' && Platform.Version >= 23) {
		const checkResult = await PermissionsAndroid.check(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
		);
		if (checkResult) {
			console.debug(
				'[handleAndroidPermissions] Permissions already granted (Android <12)'
			);
		} else {
			const requestResult = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
			);
			if (requestResult) {
				console.debug(
					'[handleAndroidPermissions] User accepted location permission'
				);
			} else {
				console.error(
					'[handleAndroidPermissions] User denied location permission'
				);
			}
		}
	}
};
