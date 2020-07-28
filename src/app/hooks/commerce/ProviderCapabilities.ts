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

export const useCapability = (): Capability | "all" => {

	const { search } = useLocation()
	const params = new URLSearchParams(search);
	const capability = params.get("capability") as Capability || "" as Capability

	if (Capabilities.includes(capability)) {
		return capability as Capability
	} else {
		return "all"
	}
}

export const deliveryMethodForProviderCapability = (capability?: Capability | "all"): DeliveryMethod | undefined => {
	if (!capability) {
		return undefined
	}
	if (!["all"].concat(Capabilities).includes(capability)) return undefined
	switch (capability) {
		case "all": return undefined
		case "download": return "download"
		case "instore_sales": return "none"
		case "online_sales": return "shipping"
		case "takeout": return "pickup"
	}
}
