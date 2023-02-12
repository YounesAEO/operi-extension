const insert = async (content) => {
	// check if content is already in the clipboard
	if (navigator.clipboard.readText() === content) {
		// if it is, do nothing
		return false;
	}
	// if it isn't, copy the content to the clipboard
	return navigator.clipboard.writeText(content).then(
		() => {
			// On success return true
			return true;
		},
		() => {
			// On failure return false
			return false;
		}
	);
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	if (request.message === 'inject') {
		const { content } = request;
		const result = await insert(content);
		if (!result) {
			sendResponse({ status: 'failed' });
		}

		sendResponse({ status: 'success' });
	}
});
