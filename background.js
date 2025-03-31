async function initTabPreferences() {
	try {
		let result = await browser.browserSettings.newTabPosition.set({
			value: "afterCurrent",
		});
		console.log(`New tab position set to afterCurrent: ${result}`);

	} catch (error) {
		console.error("Error setting tab preferences:", error);
	}
}
initTabPreferences();

browser.commands.onCommand.addListener(function(command) {
	if (command.startsWith("stt-")) {
		const index = parseInt(command.split("-")[1]) - 1;
		browser.tabs.query({ currentWindow: true }).then(tabs => {
			browser.tabs.update(tabs[index].id, { active: true });
		});

		return;
	}

	if (command === "next-tab" || command === "prev-tab") {
		browser.tabs.query({ currentWindow: true }).then(tabs => {
			const activeTab = tabs.find(tab => tab.active);
			const curIndex = activeTab.index;
			const tabCount = tabs.length;

			let index;
			if (command === "next-tab") {
				index = (curIndex + 1) % tabCount;
			} else {
				index = (curIndex - 1 + tabCount) % tabCount;
			}

			const targetTab = tabs.find(tab => tab.index === index);
			browser.tabs.update(targetTab.id, { active: true });
		});

		return;

	}

	if (command === "prior-tab") {
		browser.tabs.query({ currentWindow: true }).then(tabs => {
			const activeTab = tabs.find(tab => tab.active);

			const sortedTabs = tabs
				.filter(tab => tab.id !== activeTab.id)
				.sort((a, b) => b.lastAccessed - a.lastAccessed);

			if (sortedTabs.length > 0) {
				browser.tabs.update(sortedTabs[0].id, { active: true });
			}
		});

		return;
	}

	if (command.startsWith("history-")) {
		const action = command.split("-")[1];
		if (action === "back") {
			browser.tabs.goBack();
		} else {
			browser.tabs.goForward();
		}

		return;
	}

	if (command.startsWith("close-others")) {
		browser.tabs.query({ currentWindow: true, hidden: false, active: false }).then(tabs => {
			tabs.map(tab => tab.id).forEach((tabId) => browser.tabs.remove(tabId))
		})
		return;

	}

	if (command.startsWith("close-tab")) {
		browser.tabs.query({ currentWindow: true, hidden: false }).then(tabs => {
			const activeTab = tabs.find(tab => tab.active);
			const activeIndex = tabs.findIndex(tab => tab.active);

			let nextTabIndex;
			if (activeIndex > 0) {
				nextTabIndex = activeIndex - 1;
			} else if (tabs.length > 1) {
				nextTabIndex = tabs.length - 1;
			}

			if (nextTabIndex !== undefined) {
				browser.tabs.update(tabs[nextTabIndex].id, { active: true });
				browser.tabs.remove(activeTab.id);
			}
		});
		return;
	}

	if (command === "copy-url") {
		browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
			const url = tabs[0].url;
			navigator.clipboard.writeText(url);
		});
	}

});
