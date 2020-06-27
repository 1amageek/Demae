import { useLocation } from "react-router-dom"
import { DeliveryMethod } from "models/commerce/Product"

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

export const PaymentStatusLabel = {
	"none": "NONE",
	"processing": "PROCESSING",
	"succeeded": "SUCCEEDED",
	"payment_failed": "FAILED"
}

export const useDeliveryMethod = (): DeliveryMethod => {

	const { search } = useLocation()
	const params = new URLSearchParams(search);
	const deliveryMethod = params.get("deliveryMethod") || ""

	if (["none", "shipping", "pickup"].includes(deliveryMethod)) {
		return deliveryMethod as DeliveryMethod
	} else {
		return "none"
	}
}

export const deliveryStatusesForDeliveryMethod = (deliveryMethod?: DeliveryMethod): { [label: string]: string }[] => {
	switch (deliveryMethod) {
		case "none": return [
			{
				label: "DOWNLOADED",
				value: "none"
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
