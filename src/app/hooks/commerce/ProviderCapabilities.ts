import { useLocation } from "react-router-dom"
import { Capability } from "models/commerce/Provider"
import { DeliveryMethod } from "models/commerce/Product"

export const CapabilityLabel = {
	"download": "DOWNLOAD",
	"instore_sales": "INSTORE SALE",
	"online_sales": "ONLINE SALE",
	"takeout": "TAKEOUT"
}

export const Capabilities: Capability[] = ["download", "instore_sales", "online_sales", "takeout"]

export const useCapability = (): Capability | undefined => {

	const { search } = useLocation()
	const params = new URLSearchParams(search);
	const capability = params.get("capability") as Capability || "" as Capability

	if (Capabilities.includes(capability)) {
		return capability as Capability
	} else {
		return undefined
	}
}

export const deliveryMethodForProviderCapability = (capability?: Capability): DeliveryMethod | undefined => {
	if (!capability) {
		return undefined
	}
	if (!Capabilities.includes(capability)) return undefined
	switch (capability) {
		case "download": return "download"
		case "instore_sales": return "none"
		case "online_sales": return "shipping"
		case "takeout": return "pickup"
	}
}
