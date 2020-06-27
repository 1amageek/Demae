import { createMuiTheme } from '@material-ui/core/styles';

// Create a theme instance.
const theme = createMuiTheme({
	overrides: {
		MuiCssBaseline: {
			'@global': {
				body: {
					fontFamily: [
						'-apple-system',
						'BlinkMacSystemFont',
						'"Segoe UI"',
						'Roboto',
						'"Helvetica Neue"',
						'Arial',
						'sans-serif',
						'"Apple Color Emoji"',
						'"Segoe UI Emoji"',
						'"Segoe UI Symbol"',
					].join(','),
					fontsize: 14,
					fontWeight: 400,
				},
				'.MuiButton-root': {

				},
			},
		},
	},
	palette: {
		primary: {
			main: 'rgb(0, 113, 227)',
		},
		secondary: {
			main: 'rgb(52, 199, 89)',
		}
	},
	typography: {
		fontFamily: [
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(','),
		htmlFontSize: 15,
		fontSize: 13,
		fontWeightLight: 300,
		fontWeightRegular: 400,
		fontWeightMedium: 500,
		fontWeightBold: 700,
		h1: {
			fontWeight: 700,
			fontSize: '2rem',
		},
		h2: {
			fontWeight: 700,
			fontSize: '1.5rem',
		},
		h3: {
			fontWeight: 700,
			fontSize: '1.3rem',
		},
		h4: {
			fontWeight: 700,
			fontSize: '1.2rem',
		},
		h5: {
			fontWeight: 700,
			fontSize: '1.14rem',
		},
		h6: {
			fontWeight: 600,
			fontSize: '1.14rem',
		},
		subtitle1: {
			fontWeight: 700,
			fontSize: '1.03rem',
			lineHeight: 1.5
		},
		subtitle2: {
			fontWeight: 600,
			fontSize: '1.03rem',
			lineHeight: 1.5
		},
		body1: {
			fontWeight: 500,
			fontSize: '1rem',
			lineHeight: 1.43
		},
		body2: {
			fontWeight: 400,
			fontSize: '0.92rem',
			lineHeight: 1.42
		},
		button: {
			fontWeight: 700,
			fontSize: '0.80rem',
			letterSpacing: 0.0
		},
		caption: {
			fontWeight: 400,
			fontSize: '0.8rem',
		},
		overline: {
			fontWeight: 400,
			fontSize: '0.77rem',
		}
	}
});

export default theme;
