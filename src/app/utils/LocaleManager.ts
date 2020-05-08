export default class LocaleManager {

	private static instance: LocaleManager;

	static getInstance() {
		if (!LocaleManager.instance) {
			LocaleManager.instance = new LocaleManager();

		}
		return LocaleManager.instance;
	}

	private constructor() {

	}

}
