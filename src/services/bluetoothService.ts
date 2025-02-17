import BleManager, {
	BleScanCallbackType,
	BleScanMatchMode,
	BleScanMode,
	Peripheral,
	BleDisconnectPeripheralEvent,
	BleManagerDidUpdateValueForCharacteristicEvent,
} from 'react-native-ble-manager';
import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

const SECONDS_TO_SCAN_FOR = 5;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

declare module 'react-native-ble-manager' {
	interface Peripheral {
		connected?: boolean;
		connecting?: boolean;
	}
}

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
		// if (!peripheral.name) {
		// 	peripheral.name = 'NO NAME';
		// }
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

	const startScan = async () => {
		if (!isScanning) {
			try {
				// Verifică dacă Bluetooth-ul este activ
				const isEnabled = await BleManager.checkState();
				if (!isEnabled) {
					// Încearcă să activezi Bluetooth-ul
					await BleManager.enableBluetooth();

					// Verifică din nou starea Bluetooth după ce utilizatorul a fost întrebat
					const isEnabledAfterPrompt = await BleManager.checkState();
					if (!isEnabledAfterPrompt) {
						Alert.alert(
							'Bluetooth dezactivat',
							'Pentru a căuta dispozitive, trebuie să pornești Bluetooth.'
						);
						return; // Iese din funcție dacă Bluetooth rămâne dezactivat
					}
				}

				// Resetează lista de periferice și începe scanarea
				setPeripherals(new Map<Peripheral['id'], Peripheral>());
				setIsScanning(true);

				await BleManager.scan(
					SERVICE_UUIDS,
					SECONDS_TO_SCAN_FOR,
					ALLOW_DUPLICATES,
					{
						matchMode: BleScanMatchMode.Aggressive, // Detectează dispozitive mai rapid
						scanMode: BleScanMode.Balanced, // Economie de energie
						callbackType: BleScanCallbackType.AllMatches,
					}
				);
			} catch (err) {
				console.error('Eroare la scanarea BLE:', err);
				Alert.alert(
					'Eroare scanare',
					'A apărut o problemă la inițierea scanării dispozitivelor.'
				);
			}
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

	const connectPeripheral = async (peripheral: Peripheral) => {
		try {
			// Marchează dispozitivul ca fiind în proces de conectare
			setPeripherals((map) => {
				let p = map.get(peripheral.id);
				if (p) {
					p.connecting = true;
					return new Map(map.set(p.id, p));
				}
				return map;
			});

			await BleManager.connect(peripheral.id);
			console.debug(`[connectPeripheral][${peripheral.id}] connected.`);

			// Marchează dispozitivul ca fiind conectat
			setPeripherals((map) => {
				let p = map.get(peripheral.id);
				if (p) {
					p.connecting = false;
					p.connected = true;
					return new Map(map.set(p.id, p));
				}
				return map;
			});
		} catch (error) {
			console.error(`[connectPeripheral][${peripheral.id}] error`, error);
			Alert.alert(
				'Eroare conexiune',
				`Nu s-a putut conecta la ${peripheral.name || 'Unknown Device'}`
			);
		}
	};
	const disconnectPeripheral = async (peripheral: Peripheral) => {
		try {
			// Marchează dispozitivul ca deconectat
			await BleManager.disconnect(peripheral.id);
			console.debug(`[disconnectPeripheral][${peripheral.id}] disconnected.`);

			// Actualizează starea dispozitivului în lista de periferice
			setPeripherals((map) => {
				let p = map.get(peripheral.id);
				if (p) {
					p.connected = false;
					return new Map(map.set(peripheral.id, p));
				}
				return map;
			});
			Alert.alert(
				'Deconectare reușită',
				`Te-ai deconectat de la ${peripheral.name || 'Unknown Device'}`
			);
		} catch (error) {
			console.error(`[disconnectPeripheral][${peripheral.id}] error`, error);
			Alert.alert(
				'Eroare la deconectare',
				`Nu s-a putut deconecta de la ${peripheral.name || 'Unknown Device'}`
			);
		}
	};

	return {
		isScanning,
		peripherals,
		startScan,
		connectPeripheral,
		disconnectPeripheral,
	};
};
