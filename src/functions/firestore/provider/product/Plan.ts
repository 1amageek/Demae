import * as functions from "firebase-functions"
import { regionFunctions, stripe } from "../../../helper"
import Stripe from "stripe"
import { ErrorCode } from "../../helper"
import { nullFilter } from "../../../helper"
import Plan from "../../../models/commerce/Plan"

const create = async (stripe: Stripe, plan: Plan) => {
	const data: Stripe.PlanCreateParams = {
		id: plan.id,
		product: plan.parent.parent!.id,
		nickname: plan.name,
		interval: plan.interval,
		interval_count: plan.intervalCount,
		currency: plan.currency,
		trial_period_days: plan.trialPeriodDays?.toDate().valueOf(),
		amount: plan.amount,
		active: plan.isAvailable,
		metadata: {
			plan_path: plan.path,
			product_path: plan.parent.parent!.path
		}
	}
	try {
		await stripe.plans.create(nullFilter(data))
	} catch (error) {
		if (error.raw) {
			if (error.raw.code === ErrorCode.resource_missing) {
				return
			}
		}
		throw error
	}
}

const triggerdPath = "/commerce/{version}/providers/{uid}/products/{productID}/plans/{planID}"

export const onCreate = regionFunctions.firestore
	.document(triggerdPath)
	.onCreate(async (snapshot, context) => {
		console.info(context)
		const plan: Plan = Plan.fromSnapshot(snapshot)
		try {
			await create(stripe, plan)
		} catch (error) {
			functions.logger.error(error)
			plan.isAvailable = false
			await plan.update()
		}
	})

export const onUpdate = regionFunctions.firestore
	.document(triggerdPath)
	.onUpdate(async (snapshot, context) => {
		console.info(context)
		const plan: Plan = Plan.fromSnapshot(snapshot.after)
		if (!plan.isAvailable) {
			return
		}
		const data: Stripe.PlanUpdateParams = {
			product: plan.parent.parent!.id,
			metadata: {
				plan_path: plan.path,
				product_path: plan.parent.parent!.path
			}
		}
		try {
			await stripe.plans.update(plan.id, nullFilter(data))
		} catch (error) {
			if (error.raw) {
				if (error.raw.param === "product") {
					return
				}
				if (error.raw.code === ErrorCode.resource_missing) {
					try {
						await create(stripe, plan)
					} catch (error) {
						functions.logger.error(error)
						plan.isAvailable = false
						await plan.update()
					}
					return
				}
			}
			functions.logger.error(error)
			plan.isAvailable = false
			await plan.update()
		}
	})
