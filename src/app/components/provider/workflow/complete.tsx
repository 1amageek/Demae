import React from "react"
import firebase from "firebase"
import { Paper, Box, AppBar, Toolbar, Button, Typography } from "@material-ui/core"
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { Account } from "models/account"
import { useProcessing } from "components/Processing";
import { Provider } from "models/commerce"
import { useAuthUser } from "hooks/auth";
import { useDialog } from "components/Dialog";

export default () => {
	const [setProcessing] = useProcessing()
	const [auth] = useAuthUser()
	const [setDialog] = useDialog()
	return (
		<Paper>
			<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding={8} fontSize={30} fontWeight={800}>
				<CheckCircleIcon style={{ fontSize: "60px", color: "#00e34e" }} />
				Welcome 🎉
				<Typography>
					You"ve opened your shop!
				</Typography>
			</Box>
			<Box display="flex" justifyContent="center" alignItems="center" padding={2} fontSize={20} fontWeight={400}>
				<Button variant="contained" color="primary" size="large" onClick={async () => {
					if (!auth) return
					setProcessing(true)
					const adminAttach = firebase.functions().httpsCallable("commerce-v1-admin-attach")
					try {
						await adminAttach({ providerID: auth.uid })
						await firebase.auth().currentUser?.getIdTokenResult(true)
						window.open("/admin/products", "_blank")
					} catch (error) {
						setDialog("Error", "Error", [{
							title: "OK"
						}])
						console.error(error)
					}
					setProcessing(false)
				}}>
					Let"s register our products!
				</Button>
			</Box>
		</Paper>
	)
}
