import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import SwipeModal, {
	SwipeModalPublicMethods,
} from '@birdwingo/react-native-swipe-modal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components';
import { Peripheral } from 'react-native-ble-manager'; // Importăm Peripheral din librărie
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from 'react-native-reanimated';

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false, // Reanimated runs in strict mode by default
});

export interface SwipeableModalProps {
	devices: Peripheral[];
	onSelectDevice: (device: Peripheral) => void;
}

export interface SwipeableModalRef {
	show: () => void;
	hide: () => void;
}

const AvailableDevicesModal = forwardRef<
	SwipeableModalRef,
	SwipeableModalProps
>(({ devices, onSelectDevice }, ref) => {
	const modalRef = useRef<SwipeModalPublicMethods>(null);
	const colors = useTheme().colors;
	const theme = useTheme();
	useImperativeHandle(ref, () => ({
		show: () => modalRef.current?.show(),
		hide: () => modalRef.current?.hide(),
	}));

	const styles = StyleSheet.create({
		modalContainer: {
			padding: 20,
			backgroundColor: colors.primary, // Fundal albastru intens
			alignItems: 'center',
			minHeight: '100%',
			width: '100%',
		},
		modalTitle: {
			fontSize: theme.fontSizes.large,
			color: 'white',

			fontFamily: theme.fontFamilies.black,
			alignSelf: 'flex-start',
		},
		divider: {
			width: '100%',
			height: 2,
			backgroundColor: '#A3D2FC', // Linie sub titlu
			marginBottom: 10,
		},
		subTitle: {
			fontSize: theme.fontSizes.medium,
			color: 'white',
			alignSelf: 'flex-start',
			marginBottom: 10,
			marginTop: 20,
			fontFamily: theme.fontFamilies.medium,
		},
		deviceItem: {
			backgroundColor: '#2874F0',
			paddingVertical: 7,
			paddingHorizontal: 20,
			borderRadius: 10,
			marginVertical: 7,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
		},
		deviceName: {
			color: colors.text,
			fontSize: theme.fontSizes.small,
			fontFamily: theme.fontFamilies.medium,
			marginTop: 4,
		},
		iconContainer: {
			backgroundColor: colors.secondary, // Fundal verde pentru săgeată
			padding: 4,
			borderRadius: 20,
		},
		noDevicesText: {
			fontSize: 16,
			color: 'white',
			marginTop: 10,
		},
	});

	return (
		<SwipeModal
			ref={modalRef}
			barContainerStyle={{ backgroundColor: colors.secondary, height: 15 }}>
			<View style={styles.modalContainer}>
				<Text style={styles.modalTitle}>Selectează dispozitiv</Text>
				<View style={styles.divider} />

				<Text style={styles.subTitle}>Dispozitive disponibile</Text>

				{devices.length > 0 ? (
					<FlatList
						data={devices.filter((device) => device.name)} // Filtrăm dispozitivele care au `name`
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<Pressable
								style={styles.deviceItem}
								onPress={() => onSelectDevice(item)}>
								<Text style={styles.deviceName}>
									{item.name} {/* Deoarece filtrăm, știm că `name` există */}
								</Text>
								<View style={styles.iconContainer}>
									<Ionicons
										name='chevron-forward'
										size={20}
										color={colors.textSecondary}
									/>
								</View>
							</Pressable>
						)}
					/>
				) : (
					<Text style={styles.noDevicesText}>Niciun dispozitiv găsit</Text>
				)}
			</View>
		</SwipeModal>
	);
});

export default AvailableDevicesModal;
