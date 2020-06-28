import { createMuiTheme } from '@material-ui/core/styles';

// Create a theme instance.
const theme = createMuiTheme({
	overrides: {
		MuiCssBaseline: {
			'@global': {
				html: {
					fontSize: '14px',
					fontWeight: 500,
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
		},
		text: {
			primary: 'rgb(40, 40, 40)'
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
		htmlFontSize: 14,
		fontSize: 14,
		fontWeightLight: 300,
		fontWeightRegular: 500,
		fontWeightMedium: 600,
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
			fontWeight: 700,
			fontSize: '1.14rem',
		},
		subtitle1: {
			fontWeight: 700,
			fontSize: '1.03rem',
			lineHeight: 1.5,
			letterSpacing: 0.0
		},
		subtitle2: {
			fontWeight: 600,
			fontSize: '1.03rem',
			lineHeight: 1.5,
			letterSpacing: 0.0
		},
		body1: {
			fontWeight: 600,
			fontSize: '1rem',
			lineHeight: 1.5,
			letterSpacing: 0.0
		},
		body2: {
			fontWeight: 500,
			fontSize: '1rem',
			lineHeight: 1.5,
			letterSpacing: 0.0
		},
		button: {
			fontWeight: 700,
			fontSize: '0.80rem',
			letterSpacing: 0.0
		},
		caption: {
			fontWeight: 500,
			fontSize: '0.88rem',
		},
		overline: {
			fontWeight: 500,
			fontSize: '0.77rem',
		}
	}
});

export default theme;
