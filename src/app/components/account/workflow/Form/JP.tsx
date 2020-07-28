import React, { useState, useEffect } from "react";
import firebase from "firebase"
import "firebase/functions"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import DoneIcon from "@material-ui/icons/Done";
import Button from "@material-ui/core/Button";
import { useAuthUser } from "hooks/auth"
import Input, { useInput } from "components/Input"
import Select, { useSelect } from "components/Select"
import Account from "models/account/Account"
import { Create, Individual } from "common/commerce/account"
import Grid from "@material-ui/core/Grid";
import { Box } from "@material-ui/core";
import { SupportedCountries, CountryCode } from "common/Country";
import { nullFilter } from "utils"
import Loading from "components/Loading"
import RegisterableCountries from "config/RegisterableCountries"
import { Gender } from "common/Gender"

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			padding: theme.spacing(2),
			backgroundColor: "#fafafa"
		},
		bottomBox: {
			padding: theme.spacing(2),
			display: "flex",
			justifyContent: "flex-end"
		},
		input: {
			backgroundColor: "#fff"
		},
		cell: {
			borderBottom: "none",
			padding: theme.spacing(1),
		},
		cellStatus: {
			borderBottom: "none",
			padding: theme.spacing(1),
			width: "48px",
		},
		cellStatusBox: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center"
		}
	}),
);

export default ({ individual, onCallback }: { individual: Partial<Individual>, onCallback?: (next: boolean) => void }) => {
	const classes = useStyles()
	const [authUser] = useAuthUser()
	const [open, setOpen] = useState(false)
	const [error, setError] = useState<string | undefined>()
	const first_name_kana = useInput(individual.first_name, { inputProps: { pattern: "^[A-Za-zァ-ヴー・]{1,32}" }, required: true })
	const last_name_kana = useInput(individual.last_name, { inputProps: { pattern: "^[A-Za-zァ-ヴー・]{1,32}" }, required: true })
	const first_name_kanji = useInput(individual.first_name, { inputProps: { pattern: "^.{1,32}" }, required: true })
	const last_name_kanji = useInput(individual.last_name, { inputProps: { pattern: "^.{1,32}" }, required: true })
	const year = useInput(individual.dob?.year, { inputProps: { pattern: "^[12][0-9]{3}$" }, required: true })
	const month = useInput(individual.dob?.month, { inputProps: { pattern: "^(0?[1-9]|1[012])$" }, required: true })
	const day = useInput(individual.dob?.day, { inputProps: { pattern: "^(([0]?[1-9])|([1-2][0-9])|(3[01]))$" }, required: true })
	const gender = useSelect({
		initValue: individual.gender || "male",
		inputProps: {
			menu: [
				{
					label: "男性",
					value: "male"
				},
				{
					label: "女性",
					value: "female"
				}
			]
		},
		controlProps: {
			variant: "outlined"
		}
	})

	const postal_code = useInput(individual.address?.postal_code, { required: true })

	const state = useSelect({
		initValue: individual.address?.country || "US",
		inputProps: {
			menu: SupportedCountries.map(country => {
				return { value: country.alpha2, label: country.name }
			})
		},
		controlProps: {
			variant: "outlined"
		}
	})

	const state_kanji = useInput(individual.address_kanji?.state, { inputProps: { pattern: "^.{1,32}" }, required: true })
	const city_kanji = useInput(individual.address_kanji?.city, { inputProps: { pattern: "^.{1,32}" }, required: true })
	const line1_kanji = useInput(individual.address_kanji?.line1, { inputProps: { pattern: "^.{1,32}" }, required: true })
	const line2_kanji = useInput(individual.address_kanji?.line2)

	const state_kana = useInput(individual.address_kana?.state, { inputProps: { pattern: "^[A-Za-zァ-ヴー・]{1,32}" }, required: true })
	const city_kana = useInput(individual.address_kana?.city, { inputProps: { pattern: "^[A-Za-zァ-ヴー・]{1,32}" }, required: true })
	const line1_kana = useInput(individual.address_kana?.line1, { inputProps: { pattern: "^[0-9A-Za-zァ-ヴー・]{1,32}" }, required: true })
	const line2_kana = useInput(individual.address_kana?.line2, { inputProps: { pattern: "^[0-9A-Za-zァ-ヴー・]{1,32}" } })

	const email = useInput(individual.email, { required: true, type: "email" })
	const phone = useInput(individual.phone, { required: true, type: "tel" })
	const [front, setFront] = useState<string | undefined>()
	const [back, setBack] = useState<string | undefined>()
	const [isFrontLoading, setFrontLoading] = useState(false)
	const [isBackLoading, setBackLoading] = useState(false)
	const [isLoading, setLoading] = useState(false)

	const handleClose = () => setOpen(false)

	const handleSubmit = async (event) => {
		event.preventDefault();
		const uid = authUser?.uid
		if (!uid) return
		let data: Create = {
			type: "custom",
			country: "JP",
			business_type: "individual",
			requested_capabilities: ["card_payments", "transfers"],
			individual: {
				first_name_kanji: first_name_kanji.value,
				last_name_kanji: last_name_kanji.value,
				first_name_kana: first_name_kana.value,
				last_name_kana: last_name_kana.value,
				dob: {
					year: Number(year.value),
					month: Number(month.value),
					day: Number(day.value)
				},
				gender: gender.value as Gender,
				address_kanji: {
					country: "JP",
					state: state_kanji.value,
					city: city_kanji.value,
					line1: line1_kanji.value,
					line2: line2_kanji.value,
					postal_code: postal_code.value
				},
				address_kana: {
					country: "JP",
					state: state_kana.value,
					city: city_kana.value,
					line1: line1_kana.value,
					line2: line2_kana.value,
					postal_code: postal_code.value
				},
				email: email.value,
				phone: phone.value,
				verification: {
					document: {
						front: front,
						back: back
					}
				}
			}
		}
		data = nullFilter(data)
		setLoading(true)
		const accountCreate = firebase.app().functions("us-central1").httpsCallable("stripe-v1-account-create")
		try {
			const response = await accountCreate(data)
			const { result, error } = response.data
			if (error) {
				setError(error.message)
				setLoading(false)
				setOpen(true)
				return
			}
			const account = new Account(uid)
			account.accountID = result.id
			account.country = result.country
			account.businessType = result.business_type
			account.email = result.email
			account.individual = result.individual
			await account.save()
			setLoading(false)
			if (onCallback) {
				onCallback(true)
			}
		} catch (error) {
			setLoading(false)
			setOpen(true)
			console.log(error)
		}
	}

	const handleFrontCapture = async ({ target }) => {
		const uid = authUser?.uid
		if (!uid) return
		setFront(undefined)
		setFrontLoading(true)
		const file = target.files[0] as File
		const ref = firebase.storage().ref(new Account(uid).documentReference.path + "/verification/front.jpg")
		ref.put(file).then(async (snapshot) => {
			if (snapshot.state === "success") {
				const metadata = snapshot.metadata
				const { bucket, fullPath, name, contentType } = metadata
				const uploadFile = firebase.functions().httpsCallable("stripe-v1-file-upload")
				try {
					const result = await uploadFile({ bucket, fullPath, name, contentType, purpose: "identity_document" })
					const data = result.data
					if (data) {
						setFront(data.id)
					}
				} catch (error) {
					console.error(error)
				}
			}
			setFrontLoading(false)
		})
	}

	const handleBackCapture = async ({ target }) => {
		const uid = authUser?.uid
		if (!uid) return
		setBack(undefined)
		setBackLoading(true)
		const file = target.files[0] as File
		const ref = firebase.storage().ref(new Account(uid).documentReference.path + "/verification/back.jpg")
		ref.put(file).then(async (snapshot) => {
			if (snapshot.state === "success") {
				const metadata = snapshot.metadata
				const { bucket, fullPath, name, contentType } = metadata
				const uploadFile = firebase.functions().httpsCallable("stripe-v1-file-upload")
				try {
					const result = await uploadFile({ bucket, fullPath, name, contentType, purpose: "identity_document" })
					const data = result.data
					if (data) {
						setBack(data.id)
					}
				} catch (error) {
					console.error(error)
				}
			}
			setBackLoading(false)
		})
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<Box className={classes.box} >
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Table size="small">
								<TableBody>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">姓</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="姓" variant="outlined" margin="dense" size="small" {...last_name_kanji} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">名前</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="名前" variant="outlined" margin="dense" size="small" {...first_name_kanji} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">姓（カナ）</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="姓（カナ）" variant="outlined" margin="dense" size="small" {...last_name_kana} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">名前（カナ）</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="名前（カナ）" variant="outlined" margin="dense" size="small" {...first_name_kana} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">email</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="email" variant="outlined" margin="dense" size="small" {...email} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">電話番号</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="電話番号" variant="outlined" margin="dense" size="small" {...phone} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">生年月日</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="年" type="number" variant="outlined" margin="dense" size="small" {...year} style={{ width: "80px", marginRight: "8px" }} />
											<Input className={classes.input} label="月" type="number" variant="outlined" margin="dense" size="small" {...month} style={{ width: "66px", marginRight: "8px" }} />
											<Input className={classes.input} label="日" type="number" variant="outlined" margin="dense" size="small" {...day} style={{ width: "66px" }} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">性別</TableCell>
										<TableCell className={classes.cell} align="left">
											<Select {...gender} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}>
											<Box className={classes.cellStatusBox}>
												{isFrontLoading && <CircularProgress size={16} />}
												{(!isFrontLoading && front) && <DoneIcon color="primary" />}
											</Box>
										</TableCell>
										<TableCell className={classes.cell} align="right">身分証明書 (表)</TableCell>
										<TableCell className={classes.cell} align="left">
											<input accept="image/jpeg,image/png,application/pdf" type="file" onChange={handleFrontCapture} required />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}>
											<Box className={classes.cellStatusBox}>
												{isBackLoading && <CircularProgress size={16} />}
												{(!isBackLoading && back) && <DoneIcon color="primary" />}
											</Box>
										</TableCell>
										<TableCell className={classes.cell} align="right">身分証明書 (裏))</TableCell>
										<TableCell className={classes.cell} align="left">
											<input accept="image/jpeg,image/png,application/pdf" type="file" onChange={handleBackCapture} required />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right"></TableCell>
										<TableCell className={classes.cell} align="left">
											<Box fontSize={10}>
												身分証明書はパスポートまたは、免許証、健康保険証を撮影し添付してください。
											</Box>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Table size="small">
								<TableBody>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">郵便番号</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="郵便番号" variant="outlined" margin="dense" size="small" {...postal_code} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">都道府県</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="都道府県" variant="outlined" margin="dense" size="small" {...state_kanji} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">市区町村</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="市区町村" variant="outlined" margin="dense" size="small" {...city_kanji} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">番地など</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="番地など" variant="outlined" margin="dense" size="small" {...line1_kanji} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">アパート名など</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="アパート名など" variant="outlined" margin="dense" size="small" {...line2_kanji} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">都道府県（カナ）</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="都道府県（カナ）" variant="outlined" margin="dense" size="small" {...state_kana} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">市区町村（カナ）</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="市区町村（カナ）" variant="outlined" margin="dense" size="small" {...city_kana} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">番地など（カナ）</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="番地など（カナ）" variant="outlined" margin="dense" size="small" {...line1_kana} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align="right">アパート名など（カナ）</TableCell>
										<TableCell className={classes.cell} align="left">
											<Input className={classes.input} label="アパート名など（カナ）" variant="outlined" margin="dense" size="small" {...line2_kana} />
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Grid>
					</Grid>
				</Box>
				<Box className={classes.bottomBox} >
					<Button style={{}} size="medium" color="primary" onClick={() => {
						if (onCallback) {
							onCallback(false)
						}
					}}>Back</Button>
					<Button style={{}} variant="contained" size="medium" color="primary" type="submit">Save</Button>
				</Box>
			</form>
			{isLoading && <Loading />}
			<Dialog
				open={open}
				onClose={handleClose}
			>
				<DialogTitle>Error</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{error ? error : "Account registration failed."}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary" autoFocus>
						OK
          </Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
