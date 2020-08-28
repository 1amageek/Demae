import { useLocation } from "react-router-dom"
import { Capability } from "models/commerce/Provider"
import { SalesMethod } from "models/commerce/Product"

export const CapabilityLabel: { [key in Capability]: string } = {
	"download": "DOWNLOAD",
	"instore": "INSTORE SALE",
	"online": "ONLINE SALE",
	"pickup": "PICKUP"
}

export const Capabilities: Capability[] = ["download", "instore", "online", "pickup"]

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

export const salesMethodForProviderCapability = (capability?: Capability | "all"): SalesMethod | undefined => {
	if (!capability) {
		return undefined
	}
	if (!["all"].concat(Capabilities).includes(capability)) return undefined
	switch (capability) {
		case "all": return undefined
		case "download": return "download"
		case "instore": return "instore"
		case "online": return "online"
		case "pickup": return "pickup"
	}
}
