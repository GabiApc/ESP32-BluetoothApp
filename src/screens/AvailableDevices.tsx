import React from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from 'react-native';
import { useBluetooth } from '../context/BluetoothContext';
import { Peripheral } from 'react-native-ble-manager';
import { MaterialIcons } from '@expo/vector-icons';

const AvailableDevices = () => {
	const { state } = useBluetooth();
	const peripheralArray = Array.from(state.peripherals.values());

	const renderItem = ({ item }: { item: Peripheral }) => (
		<TouchableOpacity style={styles.deviceContainer}>
			<Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
			<View style={styles.arrowButton}>
				<MaterialIcons name='arrow-forward-ios' size={20} color='white' />
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Selectează dispozitiv</Text>
			<Text style={styles.subtitle}>Dispozitive disponibile</Text>

			{peripheralArray.length === 0 ? (
				<Text style={styles.noDevicesText}>Niciun dispozitiv găsit</Text>
			) : (
				<FlatList
					data={peripheralArray}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={styles.listContainer}
				/>
			)}
		</View>
	);
};

// Stilizare
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0A4ABD', // Fundal albastru
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white',
		textAlign: 'center',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 18,
		fontWeight: '500',
		color: 'white',
		marginBottom: 15,
	},
	listContainer: {
		marginTop: 10,
	},
	deviceContainer: {
		flexDirection: 'row',
		backgroundColor: '#5A98F2', // Gradient efect
		paddingVertical: 15,
		paddingHorizontal: 20,
		marginBottom: 10,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	deviceName: {
		fontSize: 16,
		fontWeight: '600',
		color: 'white',
	},
	arrowButton: {
		backgroundColor: '#4CD964', // Verde pentru buton
		padding: 10,
		borderRadius: 50,
	},
	noDevicesText: {
		textAlign: 'center',
		fontSize: 16,
		color: 'white',
		marginTop: 20,
	},
});

export default AvailableDevices;
