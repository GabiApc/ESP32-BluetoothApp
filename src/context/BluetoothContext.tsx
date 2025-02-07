import React, { createContext, useContext, useReducer } from 'react';
import { Peripheral } from 'react-native-ble-manager';

// Definim tipul inițial al contextului
interface BluetoothState {
	peripherals: Map<string, Peripheral>;
	isScanning: boolean; // Adăugăm această proprietate
}

// Inițializăm contextul
const BluetoothContext = createContext<
	| {
			state: BluetoothState;
			dispatch: React.Dispatch<any>;
	  }
	| undefined
>(undefined);

// Reducer pentru actualizarea contextului
const bluetoothReducer = (
	state: BluetoothState,
	action: any
): BluetoothState => {
	switch (action.type) {
		case 'SET_SCANNING':
			console.debug(
				`[BluetoothContext] Setting isScanning: ${action.isScanning}`
			);
			return { ...state, isScanning: action.isScanning };

		case 'RESET_PERIPHERALS':
			return { ...state, peripherals: new Map() };

		case 'ADD_PERIPHERAL':
			const updatedMap = new Map(state.peripherals);
			updatedMap.set(action.peripheral.id, action.peripheral);
			return { ...state, peripherals: updatedMap };

		default:
			return state;
	}
};

// Provider pentru Bluetooth
export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(bluetoothReducer, {
		peripherals: new Map(),
		isScanning: false, // Inițializare corectă
	});

	return (
		<BluetoothContext.Provider value={{ state, dispatch }}>
			{children}
		</BluetoothContext.Provider>
	);
};

// Hook pentru utilizarea contextului Bluetooth
export const useBluetooth = () => {
	const context = useContext(BluetoothContext);
	if (!context) {
		throw new Error('useBluetooth must be used within a BluetoothProvider');
	}
	return context;
};
