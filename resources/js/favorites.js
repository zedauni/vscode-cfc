(function () {
	// eslint-disable-next-line no-undef
	const vscode = acquireVsCodeApi();

	vscode.postMessage({ type: 'favoritesRefreshRequested' });

	// eslint-disable-next-line no-undef
	document.addEventListener('DOMContentLoaded', () => {
		// eslint-disable-next-line no-undef
		const form = document.querySelector('#add-color-form');

		// eslint-disable-next-line no-undef
		const input = document.createElement('input');
		input.className = 'add-color-input';
		input.placeholder = ' #3d5a80, rgb(255, 200, 100), ...';
		input.type = 'text';

		// eslint-disable-next-line no-undef
		const button = document.createElement('button');
		button.className = 'add-color-button';
		button.type = 'submit';
		// eslint-disable-next-line no-undef
		button.innerText = i18nMessages.addColor;

		form.appendChild(input);
		form.appendChild(button);

		form?.addEventListener('submit', (e) => {
			e.preventDefault();
			addColorToFavorites();
		});
	});

	// Handle messages sent from the extension to the webview
	// eslint-disable-next-line no-undef
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'refreshFavorites':
				{
					updateColorList(message.value || []);
					break;
				}
		}
	});

	/**
	 * @param {Array<{ value: string }>} colors
	 */
	function updateColorList(colors) {
		// eslint-disable-next-line no-undef
		const ul = document.querySelector('.color-list');
		ul.textContent = '';
		for (let color of colors) {
			// eslint-disable-next-line no-undef
			const li = document.createElement('li');
			li.className = 'color-entry';

			// eslint-disable-next-line no-undef
			const colorPreview = document.createElement('div');
			colorPreview.className = 'color-preview';
			colorPreview.style.backgroundColor = color;
			colorPreview.addEventListener('click', () => {
				onColorClicked(color);
			});
			li.appendChild(colorPreview);

			// eslint-disable-next-line no-undef
			const input = document.createElement('input');
			input.className = 'color-input';
			input.type = 'text';
			input.value = color;
			input.addEventListener('change', (e) => {
				const value = e.target.value;
				vscode.postMessage({ type: 'favoritesColorUpdated', value: value || '', oldValue: color });
			});
			li.appendChild(input);

			// eslint-disable-next-line no-undef
			const colorRemover = document.createElement('div');
			colorRemover.className = 'color-remover';
			colorRemover.innerHTML = `
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
					</svg>
			`;
			colorRemover.addEventListener('click', () => {
				onColorRemoverClicked(color);
			});
			li.appendChild(colorRemover);

			ul.appendChild(li);
		}

		// Update the saved state
		vscode.setState({ colors: colors });
	}

	/** 
	 * @param {string} color 
	 */
	function onColorClicked(color) {
		vscode.postMessage({ type: 'colorSelected', value: color });
	}

	function addColorToFavorites() {
		// eslint-disable-next-line no-undef
		const newColor = document.querySelector('#add-color-form .add-color-input');
		if (newColor.value === '') {
			return;
		}
		vscode.postMessage({ type: 'favoritesColorAdded', value: newColor.value });
		newColor.value = '';
	}

	/** 
	 * @param {string} color 
	 */
	function onColorRemoverClicked(color) {
		vscode.postMessage({ type: 'favoritesColorUpdated', value: '', oldValue: color });
	}
}());
