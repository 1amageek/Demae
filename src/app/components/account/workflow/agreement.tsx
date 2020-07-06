import React from "react";
import Toolbar from "@material-ui/core/Toolbar";
import { Button, Box, AppBar } from "@material-ui/core";
import { CountryCode } from "common/Country";
import TOS from "config/TOS";


export default ({ country, onCallback }: { country: CountryCode, onCallback: (next: boolean) => void }) => {
	return (
		<>
			<AppBar position="static" color="transparent" elevation={0}>
				<Toolbar>
					<Box fontSize={18} fontWeight={600}>Agreement</Box>
				</Toolbar>
			</AppBar>
			<Box fontSize={14} padding={2}>
				{country === "US" && <US />}
				{country === "JP" && <JP />}
			</Box>
			<Box padding={2} display="flex" flexGrow={1} justifyContent="flex-end">
				<Button variant="contained" size="medium" color="primary" onClick={(e) => {
					e.preventDefault()
					onCallback(true)
				}}>Agree</Button>
			</Box>
		</>
	)
}

const US = () => {
	const code = "us"
	return (
		<>
			{`Payment processing services for ${TOS[code].accountHolderTerm} on ${TOS[code].platformName} are provided by Stripe and are subject to the `}
			<a href="https://stripe.com/connect-account/legal" target="_blank">Stripe Connected Account Agreement</a>
			{`, which includes the `}
			<a href="" target="_blank">Stripe Terms of Service</a>
			{` (collectively, the “Stripe Services Agreement”). By agreeing to ${TOS[code].terms} or continuing to operate as a ${TOS[code].accountHolderTerm} on ${TOS[code].platformName}, you agree to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time. As a condition of ${TOS[code].platformName} enabling payment processing services through Stripe, you agree to provide ${TOS[code].platformName} accurate and complete information about you and your business, and you authorize ${TOS[code].platformName} to share it and transaction information related to your use of the payment processing services provided by Stripe.`}
		</>
	)
}

const JP = () => {
	const code = "jp"
	return (
		<>
			{`${TOS[code].platformName}における${TOS[code].accountHolderTerm}向けの支払処理サービスは、Stripeが提供し、`}
			<a href="https://stripe.com/jp/connect-account/legal" target="_blank">Stripe Connectアカウント契約（</a>
			<a href="https://stripe.com/jp/legal" target="_blank">Stripe利用規約</a>
			{`を含み、総称して「Stripeサービス契約」といいます。）に従うものとします。[本契約、本条件等]への同意又は${TOS[code].platformName}において${TOS[code].accountHolderTerm}としての取引の継続により、お客様はStripeサービス契約（随時Stripeにより修正されることがあり、その場合には修正されたものを含みます。）に拘束されることに同意するものとします。 Stripeを通じた支払処理サービスを${TOS[code].platformName}ができるようにするための条件として、お客様は、${TOS[code].platformName}に対してお客様及びお客様の事業に関する正確かつ完全な情報を提供することに同意し、${TOS[code].platformName}が当該情報及びStripeが提供する支払処理サービスのお客様による使用に関連する取引情報を共有することを認めるものとします。`}
		</>
	)
}

