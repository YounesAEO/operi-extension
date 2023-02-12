const getKey = async (key) => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get([key], (result) => {
			if (result[key]) {
				const decodedKey = atob(result[key]);
				resolve(decodedKey);
			}
		});
	});
};

const sendMessage = (content) => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const activeTab = tabs[0].id;

		chrome.tabs.sendMessage(
			activeTab,
			{ message: 'inject', content },
			(response) => {
				if (response.status === 'failed')
					console.log('injection failed');
			}
		);
	});
};
const generate = async (prompt) => {
	const openaiKey = await getKey('openai-key');
	const url = 'https://api.openai.com/v1/completions';

	// Call completions endpoint
	const completionResponse = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${openaiKey}`,
		},
		body: JSON.stringify({
			model: 'text-davinci-003',
			prompt: prompt,
			max_tokens: 1250,
			temperature: 0.7,
		}),
	});

	// Select the top choice and send back
	const completion = await completionResponse.json();
	return completion.choices.pop();
};

const generateCompletionAction = async (info) => {
	try {
		// sendMessage('generating...');

		// show chrome notification
		await chrome.notifications.create('generating', {
			type: 'basic',
			iconUrl: '../assets/logo-128.png',
			title: 'Operi',
			message: 'Let the magic happen...',
		});

		const { selectionText } = info;
		const cvContent = await getKey('cv-content');
		const basePromptPrefix = `
        Write me a detailed cover letter for the job posting below based on the information provided in CV below.
    
		CV: 
		${cvContent}
        Job Posting:
		
        `;

		const completion = await generate(
			`${basePromptPrefix}${selectionText}`
		);

		await chrome.notifications.create('done', {
			type: 'basic',
			iconUrl: '../assets/logo-128.png',
			title: 'Operi',
			message:
				'Yay 🎉, your cover letter is ready! Ctrl + V to paste it.',
		});

		sendMessage(completion.text);
	} catch (error) {
		sendMessage(error.toString());
	}
};
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'context-run',
		title: 'Generate Cover Letter',
		contexts: ['selection'],
	});
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
