(function () {
	// eslint-disable-next-line no-undef
	const vscode = acquireVsCodeApi();

	vscode.postMessage({ type: 'historyRefreshRequested' });

	// Handle messages sent from the extension to the webview
	// eslint-disable-next-line no-undef
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'refreshHistory':
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
				vscode.postMessage({ type: 'historyColorUpdated', value: value || '', oldValue: color });
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

	/** 
	 * @param {string} color 
	 */
	function onColorRemoverClicked(color) {
		vscode.postMessage({ type: 'historyColorUpdated', value: '', oldValue: color });
	}
}());

