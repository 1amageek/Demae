import { Doc, Field } from '@1amageek/ballcap-admin'

export default class Card extends Doc {
	@Field brand!: string
	@Field expMonth!: number
	@Field expYear!: number
	@Field last4!: string
}
