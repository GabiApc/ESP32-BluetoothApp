import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';

const SearchButton = () => {
	const theme = useTheme();
	const colors = theme.colors;
	// Animație pentru cercurile exterioare
	const outerRadius = useSharedValue(100);
	const middleRadius = useSharedValue(80);
	const styles = StyleSheet.create({
		container: {
			position: 'absolute',
			height: '100%',
			width: '100%',
			justifyContent: 'center',
			alignItems: 'center',
		},
		circle: {
			position: 'absolute',
			backgroundColor: 'rgba(180, 250, 79, 0.6)', // Verde luminos
		},
		outerCircle: {
			backgroundColor: '#b4fa4f', // Verde deschis
		},
		middleCircle: {
			backgroundColor: '#8fdc4f',
		},
		innerCircle: {
			width: 120,
			height: 120,
			borderRadius: 100,
			backgroundColor: '#b4fa4f', // Verde luminos
			justifyContent: 'center',
			alignItems: 'center',
		},
		bluetoothSymbol: {
			fontSize: 48,
			fontWeight: 'bold',
			color: '#1a1a2e', // Contrast cu fundalul
		},
	});

	// Stil animat pentru cercul exterior
	const outerCircleStyle = useAnimatedStyle(() => ({
		width: outerRadius.value * 2,
		height: outerRadius.value * 2,
		borderRadius: outerRadius.value,
		opacity: 0.2, // Opacitate constantă pentru cercul exterior
	}));

	// Stil animat pentru cercul mijlociu
	const middleCircleStyle = useAnimatedStyle(() => ({
		width: middleRadius.value * 2,
		height: middleRadius.value * 2,
		borderRadius: middleRadius.value,
		opacity: 0.4, // Opacitate mai mare
	}));

	React.useEffect(() => {
		// Pulsarea razelor
		outerRadius.value = withRepeat(
			withTiming(120, { duration: 1500 }),
			-1,
			true
		);

		middleRadius.value = withRepeat(
			withTiming(110, { duration: 1500 }),
			-1,
			true
		);
	}, [outerRadius, middleRadius]);

	return (
		<View style={styles.container}>
			{/* Cercul exterior animat */}
			<Animated.View
				style={[styles.circle, styles.outerCircle, outerCircleStyle]}
			/>
			{/* Cercul mijlociu animat */}
			<Animated.View
				style={[styles.circle, styles.middleCircle, middleCircleStyle]}
			/>
			{/* Cercul central fix */}
			<View style={[styles.circle, styles.innerCircle]}>
				{/* <Text style={styles.bluetoothSymbol}>⌁</Text> Simbol Bluetooth */}
				<Icon source='bluetooth' size={105} color='#4A4A4A' />
			</View>
		</View>
	);
};

export default SearchButton;
