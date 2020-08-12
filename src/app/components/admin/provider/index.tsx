
import React, { useState } from "react"
import { NavigationView, ListView, ContentView } from "components/NavigationContainer"
import { AdminProviderDraftProvider } from "hooks/commerce";
import Content from "./Content"

export default () => {
	return (
		<AdminProviderDraftProvider>
			<NavigationView>
				<ContentView>
					<Content />
				</ContentView>
			</NavigationView>
		</AdminProviderDraftProvider>
	)
}
