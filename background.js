browser.commands.onCommand.addListener(function(command) {
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
	}
});
