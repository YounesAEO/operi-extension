import { Pdf2TextClass } from './pdf2text.js';
const checkForKey = (key) => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get([key], (result) => {
			resolve(result[key]);
		});
	});
};
const encode = (input) => {
	return btoa(input);
};

const saveKey = () => {
	const { value } = document.getElementById('key_input');

	if (value) {
		// Encode String
		const encodedValue = encode(value);
		// Save to google storage
		chrome.storage.local.set({ 'openai-key': encodedValue }, () => {
			document.getElementById('key_needed').style.display = 'none';
			document.getElementById('key_error').style.display = 'none';
			document.getElementById('key_entered').style.display = 'block';
		});
	} else {
		document.getElementById('key_error').style.display = 'block';
	}
};

const changeKey = () => {
	document.getElementById('key_needed').style.display = 'block';
	document.getElementById('key_entered').style.display = 'none';
};

const saveCvURL = () => {
	const files = document.getElementById('cv_file').files;
	if (files.length > 0) {
		//we get the file
		const file = files[0];
		const reader = new FileReader();
		const pdff = new Pdf2TextClass();
		//we save it's url in chrome storage
		reader.onload = (e) => {
			let cvContent = '';
			pdff.pdfToText(e.target.result, null, (text) => {
				cvContent = text;
			});
			document.getElementById('loading').style.display = 'block';
			document.getElementById('cv_needed').style.display = 'none';
			window.setTimeout(async () => {
				const encodedURL = encode(e.target.result);
				const encodedText = encode(cvContent);
				const result = await chrome.storage.local.set(
					{ 'cv-content': encodedText, 'cv-url': encodedURL },
					() => {
						document.getElementById('loading').style.display =
							'none';
						document.getElementById('cv_entered').style.display =
							'block';
						document
							.getElementById('cv')
							.addEventListener('click', (ev) => {
								ev.preventDefault();
								window
									.open()
									.document.write(
										`<iframe src="${e.target.result}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; margin:0;" allowfullscreen></iframe>`
									);
							});
					}
				);
			}, 1500);
		};
		reader.readAsDataURL(file);
	}
};

const changeCvURL = () => {
	document.getElementById('cv_needed').style.display = 'block';
	document.getElementById('cv_entered').style.display = 'none';
};

document.getElementById('save_key_button').addEventListener('click', saveKey);
document
	.getElementById('change_key_button')
	.addEventListener('click', changeKey);

document
	.getElementById('change_cv_button')
	.addEventListener('click', changeCvURL);

document.getElementById('cv_file').addEventListener('change', saveCvURL, false);

checkForKey('openai-key').then((response) => {
	if (response) {
		document.getElementById('key_needed').style.display = 'none';
		document.getElementById('key_entered').style.display = 'block';
		document
			.getElementById('key_input')
			.setAttribute('value', atob(response));
	}
});

checkForKey('cv-url').then((response) => {
	if (response) {
		document.getElementById('cv_needed').style.display = 'none';
		document.getElementById('cv_entered').style.display = 'block';
		document.getElementById('cv').addEventListener('click', (ev) => {
			ev.preventDefault();
			window
				.open()
				.document.write(
					`<iframe src="${atob(
						response
					)}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; margin:0;" allowfullscreen></iframe>`
				);
		});
	}
});
