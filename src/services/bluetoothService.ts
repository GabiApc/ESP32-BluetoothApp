import BleManager, {
	BleScanCallbackType,
	BleScanMatchMode,
	BleScanMode,
	Peripheral,
	BleDisconnectPeripheralEvent,
	BleManagerDidUpdateValueForCharacteristicEvent,
} from 'react-native-ble-manager';
import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

const SECONDS_TO_SCAN_FOR = 3;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

export const useBluetooth = () => {
	const [isScanning, setIsScanning] = useState(false);
	const [peripherals, setPeripherals] = useState(
		new Map<Peripheral['id'], Peripheral>()
	);

	useEffect(() => {
		BleManager.start({ showAlert: true }).catch((error) =>
			console.error('BleManager could not be started.', error)
		);
		handleAndroidPermissions();

		const listeners = [
			BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
			BleManager.onStopScan(handleStopScan),
			// BleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
		];
		return () => {
			listeners.forEach((listener) => listener.remove());
		};
	}, []);

	const handleDiscoverPeripheral = (peripheral: Peripheral) => {
		// console.log('Peripheral descoperit:', peripheral);
		if (!peripheral.name) {
			peripheral.name = 'NO NAME';
		}
		setPeripherals((map) => new Map(map.set(peripheral.id, peripheral)));
	};

	const handleStopScan = () => {
		setIsScanning(false);
	};

	// const handleDisconnectedPeripheral = (
	// 	event: BleDisconnectPeripheralEvent
	// ) => {
	// 	setPeripherals((map) => {
	// 		let p = map.get(event.peripheral);
	// 		if (p) {
	// 			p.connected = false;
	// 			return new Map(map.set(event.peripheral, p));
	// 		}
	// 		return map;
	// 	});
	// };

	const startScan = () => {
		if (!isScanning) {
			setPeripherals(new Map<Peripheral['id'], Peripheral>());
			setIsScanning(true);
			BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
				matchMode: BleScanMatchMode.Aggressive, // Detectează dispozitive mai rapid
				scanMode: BleScanMode.Balanced, // Economie de energie, dar mai puțin rapid decât HighLatency
				callbackType: BleScanCallbackType.AllMatches,
			})
				.then(() => console.log('Scanare începută...'))
				.catch((err) => console.error('Eroare scanare BLE:', err));
		}
	};

	const handleAndroidPermissions = async () => {
		if (Platform.OS === 'android') {
			if (Platform.Version >= 31) {
				// Pentru Android 12+ (API 31+)
				const granted = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
				]);
				if (
					granted['android.permission.BLUETOOTH_SCAN'] !== 'granted' ||
					granted['android.permission.BLUETOOTH_CONNECT'] !== 'granted' ||
					granted['android.permission.ACCESS_FINE_LOCATION'] !== 'granted'
				) {
					console.error(
						'Permisiunile Bluetooth și locație nu au fost acordate.'
					);
				}
			} else if (Platform.Version >= 23) {
				// Pentru Android 6 - 11
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
				);
				if (granted !== 'granted') {
					console.error('Permisiunea de locație nu a fost acordată.');
				}
			}
		}
	};

	return { isScanning, peripherals, startScan };
};
