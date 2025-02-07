import {
	DefaultTheme as PaperDefaultTheme,
	MD3LightTheme,
} from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// 🌟 Definirea culorilor pentru aplicație
const colors = {
	primary: '#064BB5',
	secondary: '#BCFF5E',
	background: '#FFFFFF',
	text: '#FFFFFF',
	textSecondary: '#4A4A4A',
	border: '#DDDDDD',
	error: '#D32F2F',
};

// 🌟 Dimensiuni pentru fonturi
const fontSizes = {
	small: 12,
	medium: 16,
	large: 20,
	title: 24,
};

// 🌟 Definirea marginilor și padding-ului
const spacing = {
	small: 8,
	medium: 16,
	large: 24,
};

// 🌟 Tema pentru react-native-paper
const paperTheme = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme.colors,
		primary: colors.primary,
		background: colors.background,
		text: colors.text,
	},
};

// 🌟 Tema pentru react-navigation
const navigationTheme = {
	...NavigationDefaultTheme,
	colors: {
		...NavigationDefaultTheme.colors,
		primary: colors.primary,
		background: colors.background,
		text: colors.text,
	},
};

// 🌟 Definirea fonturilor
const fontFamilies = {
	regular: 'Poppins-Regular',
	medium: 'Poppins-Medium',
	black: 'Poppins-Black',
};

// 🌟 Exportul temei
const theme = {
	colors,
	fontSizes,
	spacing,
	paperTheme,
	navigationTheme,
	fontFamilies,
};

export default theme;
