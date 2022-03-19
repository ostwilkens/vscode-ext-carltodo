const vscode = require('vscode');

function deactivate(context) {
	console.log("deactivate")
}

function activate(context) {
	console.log("activate")

	const disposable1 = vscode.commands.registerCommand('extension.check', function ({startIndex, endIndex}) {
		console.log("check", startIndex, endIndex)
		const editor = vscode.window.activeTextEditor

		if (editor) {
			editor.edit(editBuilder => {
				const startPos = activeEditor.document.positionAt(startIndex);
				const endPos = activeEditor.document.positionAt(endIndex);
				const range = new vscode.Range(startPos, endPos);
				
				const text = editor.document.getText(range)
				const newText = text.replace("[ ]", "[x]").replace("[]", "[x]")

				editBuilder.replace(range, newText)
			})
		}
	});
	context.subscriptions.push(disposable1);
	const disposable2 = vscode.commands.registerCommand('extension.uncheck', function ({startIndex, endIndex}) {
		console.log("uncheck", startIndex, endIndex)
		const editor = vscode.window.activeTextEditor

		if (editor) {
			editor.edit(editBuilder => {
				const startPos = activeEditor.document.positionAt(startIndex);
				const endPos = activeEditor.document.positionAt(endIndex);
				const range = new vscode.Range(startPos, endPos);
				
				const text = editor.document.getText(range)
				const newText = text.replace("[x]", "[ ]")

				editBuilder.replace(range, newText)
			})
		}
	});
	context.subscriptions.push(disposable2);

	let timeout = undefined;

	const uncheckedDecorationType = vscode.window.createTextEditorDecorationType({
		color: "#ABD"
	});
	const checkedDecorationType = vscode.window.createTextEditorDecorationType({
		opacity: "0.5"
	});
	const commentDecorationType = vscode.window.createTextEditorDecorationType({
		color: "#596",
		fontStyle: "italic",
		opacity: "0.9"
	});
	const headingDecorationType = vscode.window.createTextEditorDecorationType({
		fontWeight: "600",
		color: "#89C",
		textDecoration: "underline",
	});

	let activeEditor = vscode.window.activeTextEditor;

	const uncheckedRegex = /\[ ?\].*$/gm;
	// const uncheckedRegex = /\[ ?\]/gm;
	const checkedRegex = /\[x\]/gm;
	const commentRegex = /\#.*?$/gm;
	const headingRegex = /^[^\[\n]*:$/gm;

	function updateDecorations() {
		if (!activeEditor) {
			return
		}

		const text = activeEditor.document.getText()
		const unchecked = []
		const checked = []
		const comment = []
		const heading = []

		let match
		while ((match = uncheckedRegex.exec(text))) {
			const startIndex = match.index
			const endIndex = match.index + match[0].length

			const startPos = activeEditor.document.positionAt(startIndex);
			const endPos = activeEditor.document.positionAt(endIndex);
			const range = new vscode.Range(startPos, endPos);

			const args = { startIndex, endIndex }
			const commandUri = vscode.Uri.parse(
				`command:extension.check?${encodeURIComponent(JSON.stringify(args))}`
			);
			const link = new vscode.MarkdownString(`[✔](${commandUri})`);
			link.isTrusted = true;

			const decoration = {
				range: range,
				hoverMessage: link
			};
			unchecked.push(decoration);
		}

		while ((match = checkedRegex.exec(text))) {
			const startIndex = match.index
			const endIndex = match.index + match[0].length

			const startPos = activeEditor.document.positionAt(startIndex);
			const endPos = activeEditor.document.positionAt(endIndex);
			const range = new vscode.Range(startPos, endPos);

			const args = { startIndex, endIndex }
			const commandUri = vscode.Uri.parse(
				`command:extension.uncheck?${encodeURIComponent(JSON.stringify(args))}`
			);
			const link = new vscode.MarkdownString(`[Undo](${commandUri})`);
			link.isTrusted = true;

			const decoration = {
				range: range,
				hoverMessage: link
			};
			checked.push(decoration);
		}

		while ((match = commentRegex.exec(text))) {
			const startIndex = match.index
			const endIndex = match.index + match[0].length

			const startPos = activeEditor.document.positionAt(startIndex);
			const endPos = activeEditor.document.positionAt(endIndex);
			const range = new vscode.Range(startPos, endPos);

			const decoration = {
				range: range
			};
			comment.push(decoration);
		}

		while ((match = headingRegex.exec(text))) {
			const startIndex = match.index
			const endIndex = match.index + match[0].length

			const startPos = activeEditor.document.positionAt(startIndex);
			const endPos = activeEditor.document.positionAt(endIndex);
			const range = new vscode.Range(startPos, endPos);

			const decoration = {
				range: range
			};
			heading.push(decoration);
		}

		activeEditor.setDecorations(uncheckedDecorationType, unchecked);
		activeEditor.setDecorations(checkedDecorationType, checked);
		activeEditor.setDecorations(commentDecorationType, comment);
		activeEditor.setDecorations(headingDecorationType, heading);
	}

	function triggerUpdateDecorations(throttle = false) {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		if (throttle) {
			timeout = setTimeout(updateDecorations, 500);
		} else {
			updateDecorations();
		}
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		const isCorrectLanguage = editor.document.languageId === "ctd"
		activeEditor = editor;
		if (editor && isCorrectLanguage) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		const isCorrectLanguage = event.document.languageId === "ctd"
		if (activeEditor && event.document === activeEditor.document && isCorrectLanguage) {
			triggerUpdateDecorations(true);
		}
	}, null, context.subscriptions);
}

module.exports = {
	activate,
	deactivate
}