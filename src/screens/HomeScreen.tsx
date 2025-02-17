import React, { useEffect, useRef, useState } from 'react';
import {
	View,
	StatusBar,
	StyleSheet,
	Pressable,
	FlatList,
	Alert,
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useTheme } from 'styled-components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBluetooth } from '../services/bluetoothService';
import AvailableDevicesModal, {
	SwipeableModalRef,
} from '../components/AvailableDevicesModal';
import { Peripheral } from 'react-native-ble-manager';
import SearchButton from '../components/SearchButton';
// import { useBluetooth } from '../context/BluetoothContext';

const HomeScreen = () => {
	const theme = useTheme();
	const colors = theme.colors;

	const {
		isScanning,
		peripherals,
		startScan,
		connectPeripheral,
		disconnectPeripheral,
	} = useBluetooth();

	const modalRef = useRef<SwipeableModalRef>(null);
	const [devices, setDevices] = useState<Peripheral[]>([]);

	const handleScan = () => {
		startScan();
		setTimeout(() => {
			setDevices(Array.from(peripherals.values())); // Salvăm dispozitivele în state
			modalRef.current?.show();
		}, 5000); // Afișăm modalul după scanare
	};

	const handleSelectDevice = (device: Peripheral) => {
		Alert.alert(
			'Dispozitiv selectat',
			`Ce acțiune dorești să efectuezi pentru ${
				device.name || 'Unknown Device'
			}?`,
			[
				{
					text: 'Anulează',
					style: 'cancel',
				},
				device.connected
					? {
							text: 'Deconectează-te',
							onPress: () => disconnectPeripheral(device), // Deconectează dispozitivul
					  }
					: {
							text: 'Conectează-te',
							onPress: () => connectPeripheral(device), // Conectează dispozitivul
					  },
			]
		);
		modalRef.current?.hide(); // Ascunde modalul după selecție
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
		modalContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: colors.primary,
		},
		modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
		deviceItem: { padding: 10, borderBottomWidth: 1 },
		closeButton: { backgroundColor: '#ff0000', padding: 15, marginTop: 20 },
		closeButtonText: { color: 'white', fontSize: 16 },
		circle: {
			width: 120,
			height: 120,
			borderRadius: 60, // Cercul perfect
			backgroundColor: '#b4fa4f', // Verde luminos
			justifyContent: 'center',
			alignItems: 'center',
			shadowColor: '#ffffff', // Umbra albă
			shadowOffset: {
				width: 0,
				height: 0, // Umbra difuză fără deplasare
			},
			shadowOpacity: 1, // Opacitate maximă pentru a fi foarte vizibilă
			shadowRadius: 40, // Rază mare pentru a face strălucirea puternică
			elevation: 20, // Intensitate mare pentru Android
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
				{isScanning ? (
					<SearchButton />
				) : (
					<View
						style={{
							position: 'absolute',
							height: '100%',
							width: '100%',
							justifyContent: 'center',
							alignItems: 'center',
						}}>
						<View style={styles.circle}>
							<IconButton
								mode='contained'
								containerColor={colors.secondary}
								iconColor={colors.textSecondary}
								icon='bluetooth'
								size={105}
								onPress={handleScan}
							/>
						</View>
					</View>
				)}

				<AvailableDevicesModal
					ref={modalRef}
					devices={devices}
					onSelectDevice={handleSelectDevice}
				/>
			</View>
		</SafeAreaView>
	);
};

export default HomeScreen;
