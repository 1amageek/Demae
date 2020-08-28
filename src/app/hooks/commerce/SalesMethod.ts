import { useLocation } from "react-router-dom"
import { SalesMethod } from "models/commerce/Product"
import { Capability } from "models/commerce/Provider"
import { PaymentStatus } from "common/commerce/Types"

export const SalesMethods: SalesMethod[] = ["instore", "download", "pickup", "online"]

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

export const SalesMethodLabel: { [key in SalesMethod]: string } = {
	"instore": "IN-STORE",
	"online": "ONLINE",
	"pickup": "PICKUP",
	"download": "DOWNOAD",
}

export const PaymentStatusLabel: { [key in PaymentStatus]: string } = {
	"none": "NONE",
	"processing": "PROCESSING",
	"succeeded": "SUCCEEDED",
	"payment_failed": "FAILED",
	"canceled": "CANCELED"
}

export const useSalesMethod = (): SalesMethod | undefined => {

	const { search } = useLocation()
	const params = new URLSearchParams(search);
	const salesMethod = params.get("salesMethod") || ""

	if (["instore", "online", "pickup", "download"].includes(salesMethod)) {
		return salesMethod as SalesMethod
	} else {
		return undefined
	}
}

export const capabilityForSalesMethod = (salesMethod?: SalesMethod): Capability | undefined => {
	if (!salesMethod) {
		return undefined
	}
	if (!SalesMethods.includes(salesMethod)) return undefined
	switch (salesMethod) {
		case "instore": return "instore"
		case "online": return "online"
		case "pickup": return "pickup"
		case "download": return "download"
	}
}

interface Item {
	label: string
	value?: string
}

export const deliveryStatusesForSalesMethod = (salesMethod?: SalesMethod): Item[] => {
	switch (salesMethod) {
		case "instore": return [
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
		case "online": return [
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
