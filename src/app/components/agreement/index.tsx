import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TOS from 'config/TOS';

export default ({ open, onClose, onNext }) => {
	const code = 'us'
	return (
		<Dialog
			open={open}
			onClose={onClose}
		>
			<DialogTitle>Services agreement</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{`Payment processing services for ${TOS[code].accountHolderTerm} on ${TOS[code].platformName} are provided by Stripe and are subject to the `}
					<a href='https://stripe.com/jp/connect-account/legal' target='_blank'>Stripe Connected Account Agreement</a>
					{`, which includes the `}
					<a href='' target='_blank'>Stripe Terms of Service</a>
					{` (collectively, the “Stripe Services Agreement”). By agreeing to ${TOS[code].terms} or continuing to operate as a ${TOS[code].accountHolderTerm} on ${TOS[code].platformName}, you agree to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time. As a condition of ${TOS[code].platformName} enabling payment processing services through Stripe, you agree to provide ${TOS[code].platformName} accurate and complete information about you and your business, and you authorize ${TOS[code].platformName} to share it and transaction information related to your use of the payment processing services provided by Stripe.`}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color='primary'>
					DISAGREE
        </Button>
				<Button onClick={onNext} variant='contained' color='primary' autoFocus>
					AGREE
        </Button>
			</DialogActions>
		</Dialog>
	)
}
