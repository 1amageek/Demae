import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import styled, { ServerStyleSheet } from 'styled-components'
import { ServerStyleSheets } from '@material-ui/styles';
import theme from '../theme';

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const styledComponentsSheet = new ServerStyleSheet()
		const materialSheets = new ServerStyleSheets()
		const originalRenderPage = ctx.renderPage;

		try {
			ctx.renderPage = () => originalRenderPage({
				enhanceApp: App => props => styledComponentsSheet.collectStyles(materialSheets.collect(<App {...props} />))
			})
			const initialProps = await Document.getInitialProps(ctx)
			return {
				...initialProps,
				styles: (
					<React.Fragment>
						{initialProps.styles}
						{materialSheets.getStyleElement()}
						{styledComponentsSheet.getStyleElement()}
					</React.Fragment>
				)
			}
		} finally {
			styledComponentsSheet.seal()
		}
	}

	render() {
		return (
			<html lang="en" dir="ltr">
				<Head>
					<meta charSet="utf-8" />
					{/* Use minimum-scale=1 to enable GPU rasterization */}
					<meta
						name="viewport"
						content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
					/>
					{/* PWA primary color */}
					<meta
						name="theme-color"
						content={theme.palette.primary.main}
					/>
					<link
						rel="stylesheet"
						href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
					/>
					<link
						rel="stylesheet"
						href="https://cdnjs.cloudflare.com/ajax/libs/paymentfont/1.1.2/css/paymentfont.min.css"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		);
	}
}

// const Body = styled.body`
// 	min-height: 100vh;
//   /* mobile viewport bug fix */
//   min-height: -webkit-fill-available;
// `

export default MyDocument
