
import React, { useState } from "react"
import { NavigationView, ListView, ContentView } from "components/NavigationContainer"
import Content from "./Content"

export default () => {
	return (
		<NavigationView>
			<ContentView>
				<Content />
			</ContentView>
		</NavigationView>
	)
}
