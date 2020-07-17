import { createMuiTheme } from "@material-ui/core/styles";

const FontFamilies = ["-apple-system",
	"BlinkMacSystemFont",
	`"Segoe UI"`,
	"Roboto",
	`"Helvetica Neue"`,
	"Arial",
	"sans-serif",
	`"Apple Color Emoji"`,
	`"Segoe UI Emoji"`,
	`"Segoe UI Symbol"`]

// Create a theme instance.
const theme = createMuiTheme({
	overrides: {
		MuiCssBaseline: {
			"@global": {
				html: {
					fontSize: "14px",
					fontWeight: 500,
					fontFamily: FontFamilies.join(","),
				},
				".MuiSwitch-switchBase": {
					color: "#0FF"
				},
				".MuiBackdrop-root": {
					backgroundColor: "rgba(0, 0, 0, 0.1)"
				}
			},
		},
	},
	palette: {
		primary: {
			main: "rgb(0, 113, 227)",
		},
		text: {
			primary: "rgb(40, 40, 40)"
		},
		background: {
			default: "#f5f5f7"
		},
		error: {
			light: "rgb(255, 221, 221)",
			main: "#f44336",
			dark: "#d32f2f",
			contrastText: "#fff"
		}
	},
	typography: {
		fontFamily: FontFamilies.join(","),
		htmlFontSize: 14,
		fontSize: 14,
		fontWeightLight: 300,
		fontWeightRegular: 500,
		fontWeightMedium: 600,
		fontWeightBold: 700,
		h1: {
			fontWeight: 700,
			fontSize: "2rem",
		},
		h2: {
			fontWeight: 700,
			fontSize: "1.5rem",
		},
		h3: {
			fontWeight: 700,
			fontSize: "1.3rem",
		},
		h4: {
			fontWeight: 700,
			fontSize: "1.2rem",
		},
		h5: {
			fontWeight: 700,
			fontSize: "1.14rem",
		},
		h6: {
			fontWeight: 700,
			fontSize: "1.14rem",
		},
		subtitle1: {
			fontWeight: 700,
			fontSize: "1.03rem",
			lineHeight: 1.5,
			letterSpacing: 0.0
		},
		subtitle2: {
			fontWeight: 600,
			fontSize: "1.03rem",
			lineHeight: 1.5,
			letterSpacing: 0.0
		},
		body1: {
			fontWeight: 500,
			fontSize: "1rem",
			lineHeight: 1.5,
			letterSpacing: 0.0
		},
		body2: {
			fontWeight: 400,
			fontSize: "1rem",
			lineHeight: 1.5,
			letterSpacing: 0.0
		},
		button: {
			fontWeight: 700,
			fontSize: "0.80rem",
			letterSpacing: 0.0
		},
		caption: {
			fontWeight: 500,
			fontSize: "0.88rem",
		},
		overline: {
			fontWeight: 500,
			fontSize: "0.77rem",
		}
	},
	shadows: [
		"none",
		"0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.08)",
		"0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.08)",
		"0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.08)",
		"0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.08)",
		"0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.08)",
		"0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.08)",
		"0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.08)",
		"0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.08)",
		"0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.08)",
		"0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.08)",
		"0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.08)",
		"0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.08)",
		"0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.08)",
		"0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.08)",
		"0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.08)",
		"0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.08)",
		"0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.08)",
		"0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.08)",
		"0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.08)",
		"0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.08)",
		"0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.08)",
		"0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.08)",
		"0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.08)",
		"0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.08)",
	]
});

export default theme;
