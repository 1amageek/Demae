import { useLocation } from "react-router-dom"
import { DeliveryMethod } from "models/commerce/Product"
import { Capability } from "models/commerce/Provider"
import { PaymentStatus } from "common/commerce/Types"

export const DeliveryMethods: DeliveryMethod[] = ["none", "download", "pickup", "shipping"]

export const DeliveryStatusLabel = {
	"none": "NONE",
	"pending": "PENDING",
	"preparing_for_delivery": "TODO",
	"out_for_delivery": "OUT FOR DELIVERY",
	"in_transit": "IN TRANSIT",
	"failed_attempt": "FAILED ATTEMPT",
	"delivered": "DELIVERED",
	"available_for_pickup": "AVAILABLE FOR PICKUP",
	"exception": "EXCEPTION",
	"expired": "EXPIRED"
}

export const DeliveryMethodLabel: { [key in DeliveryMethod]: string } = {
	"none": "IN-STORE",
	"shipping": "ONLINE",
	"pickup": "TAKEOUT",
	"download": "DOWNOAD",
}

export const PaymentStatusLabel: { [key in PaymentStatus]: string } = {
	"none": "NONE",
	"processing": "PROCESSING",
	"succeeded": "SUCCEEDED",
	"payment_failed": "FAILED",
	"canceled": "CANCELED"
}

export const useDeliveryMethod = (): DeliveryMethod | undefined => {

	const { search } = useLocation()
	const params = new URLSearchParams(search);
	const deliveryMethod = params.get("deliveryMethod") || ""

	if (["none", "shipping", "pickup", "download"].includes(deliveryMethod)) {
		return deliveryMethod as DeliveryMethod
	} else {
		return undefined
	}
}

export const capabilityForDeliveryMethod = (deliveryMethod?: DeliveryMethod): Capability | undefined => {
	if (!deliveryMethod) {
		return undefined
	}
	if (!DeliveryMethods.includes(deliveryMethod)) return undefined
	switch (deliveryMethod) {
		case "none": return "instore_sales"
		case "shipping": return "online_sales"
		case "pickup": return "takeout"
		case "download": return "download"
	}
}

interface Item {
	label: string
	value?: string
}

export const deliveryStatusesForDeliveryMethod = (deliveryMethod?: DeliveryMethod): Item[] => {
	switch (deliveryMethod) {
		case "none": return [
			{
				label: "IN-STORE",
				value: "none"
			},
		]
		case "download": return [
			{
				label: "DOWNLOAD",
				value: "download"
			},
		]
		case "pickup": return [
			{
				label: "TODO",
				value: "preparing_for_delivery"
			},
			{
				label: "AVAILABLE FOR PICKUP",
				value: "available_for_pickup"
			},
			{
				label: "COMPLETED",
				value: "delivered"
			},
		]
		case "shipping": return [
			{
				label: "TODO",
				value: "preparing_for_delivery"
			},
			{
				label: "OUT FOR DELIVERY",
				value: "out_for_delivery"
			},
			{
				label: "IN TRANSIT",
				value: "in_transit"
			},
			{
				label: "PENDING",
				value: "pending"
			},
		]
		default: return []
	}
}
