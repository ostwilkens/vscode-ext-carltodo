const vscode = require('vscode');

function deactivate(context) {
	// console.log("deactivate")
}

function activate(context) {
	// console.log("activate")

	const disposable1 = vscode.commands.registerCommand('extension.check', function ({startIndex, endIndex}) {
		// console.log("check", startIndex, endIndex)
		const editor = vscode.window.activeTextEditor

		if (editor) {
			editor.edit(editBuilder => {
				const startPos = activeEditor.document.positionAt(startIndex);
				const endPos = activeEditor.document.positionAt(endIndex);
				const range = new vscode.Range(startPos, endPos);
				
				const text = editor.document.getText(range)
				const charIndex = text.indexOf("-")
				const newText = text.substring(0, charIndex) + "x" + text.substring(charIndex + 1)

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

	const checkedDecorationType = vscode.window.createTextEditorDecorationType({
		opacity: "0.45",
	});
	const commentDecorationType = vscode.window.createTextEditorDecorationType({
		color: "#596",
		fontStyle: "italic",
	});
	const projectDecorationType = vscode.window.createTextEditorDecorationType({
		// color: "#89C",
		// fontStyle: "italic",
		fontWeight: "bold",
		// backgroundColor: "red"
	});
	const areaDecorationType = vscode.window.createTextEditorDecorationType({
		color: "#AAA",
		fontStyle: "italic",
		// backgroundColor: "red"
		// fontWeight: "100"
	});
	const uncheckedDecorationType = vscode.window.createTextEditorDecorationType({
		color: "#ABD"
		// color: "#89C",
	});
	const areaWithoutEmojiDecorationType = vscode.window.createTextEditorDecorationType({
		// color: "#ABD"
		// backgroundColor: 'red'
		// color: "#89C",
	});
	// const headingDecorationType = vscode.window.createTextEditorDecorationType({
	// 	fontWeight: "600",
	// 	color: "#89C",
	// 	textDecoration: "underline",
	// });

	let activeEditor = vscode.window.activeTextEditor;

	const uncheckedRegex =  /^[\t ]*?-.*$/gm;
	const checkedBoxRegex = /^[\t ]*?\x.*$/gm;
	const commentRegex = /\#.*?$/gm;
	// const projectRegex = /[\>] .*:?$/gm;
	// const projectRegex = /.*:$/gm;
	// const projectRegex = /^- .*$/gm;
	const projectRegex = /^[^\s].*$/gm;
	// const projectRegex = /[^>]*:$/gm;
	// const projectRegex = /.*:?$/gm;
	const areaRegex = /[A-Za-z0-9 \._]*\>/gm;
	// const uncheckedRegex = /\[ ?\].*$/gm;
	// const uncheckedRegex = /\[ ?\]/gm;
	// const checkedRegex = /\[x\]/gm;
	// const headingRegex = /^[^\[\n]*:$/gm;
	// const emojiRegex = /^[^\s].*$/gm;
	const emojiRegex = /\p{Emoji_Presentation} .*>/ug
	const areaWithoutEmojiRegex = /- [A-Za-z0-9 \._]* .*>/ugm

	function updateDecorations() {
		if (!activeEditor) {
			return
		}

		const doc = activeEditor.document
		const text = doc.getText()
		let match

		const checked = []
		const comment = []
		const project = []
		const area = []
		const unchecked = []
		const areaWithoutEmoji = []
		// const heading = []

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

		const getIndentCountOnLine = (lineNumber) => {
			const line = doc.lineAt(lineNumber)
			const indentCount = line.firstNonWhitespaceCharacterIndex
			return indentCount
		}

		while ((match = checkedBoxRegex.exec(text))) {
			const firstLine = doc.positionAt(match.index).line

			const firstLineIndentCount = getIndentCountOnLine(firstLine)
			let currentLine = firstLine
			while (getIndentCountOnLine(currentLine + 1) > firstLineIndentCount) {
				currentLine += 1
			}

			// console.log(firstLine, currentLine)

			const startPos = doc.positionAt(match.index)
			const endPos = doc.lineAt(currentLine).range.end

			checked.push({ range: new vscode.Range(startPos, endPos) });
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

		while ((match = projectRegex.exec(text))) {
			let startIndex = match.index
			const endIndex = match.index + match[0].length

			// if (match[0][0] === " ") {
			// 	startIndex += 1
			// }

			const startPos = activeEditor.document.positionAt(startIndex);
			const endPos = activeEditor.document.positionAt(endIndex);
			const range = new vscode.Range(startPos, endPos);

			const decoration = {
				range: range
			};
			project.push(decoration);
		}

		while ((match = areaRegex.exec(text))) {
			let startIndex = match.index
			const endIndex = match.index + match[0].length

			if (match[0][0] === " ") {
				startIndex += 1
			}

			const startPos = activeEditor.document.positionAt(startIndex);
			const endPos = activeEditor.document.positionAt(endIndex);
			const range = new vscode.Range(startPos, endPos);

			const isRootIndent = getIndentCountOnLine(startPos.line) === 0
			if (isRootIndent) {
				const decoration = {
					range: range
				};
				area.push(decoration);
			}
		}

		const areaEmojis = {}

		while ((match = emojiRegex.exec(text))) {
			// extract area emoji
			const value = match[0]
			const spaceIndex = value.indexOf(" ")
			const emojiValue = value.slice(0, spaceIndex)
			const areaName = value.slice(spaceIndex, value.length - 1).trim()
			areaEmojis[areaName.toLowerCase()] = emojiValue
		}
		// console.log(areaEmojis)

		while ((match = areaWithoutEmojiRegex.exec(text))) {
			const startIndex = match.index
			const endIndex = match.index + match[0].length

			// extract area name
			const value = match[0]
			const areaName = value.slice(2, value.length - 1).trim()
			let emoji = areaEmojis[areaName.toLowerCase()]
			if (!emoji) {
				emoji = "﹖"
			}

			const startPos = activeEditor.document.positionAt(startIndex + 2);
			const endPos = activeEditor.document.positionAt(endIndex);
			const range = new vscode.Range(startPos, endPos);

			const decoration = {
				range: range,
				renderOptions: {
					before: {
						contentText: emoji + " "
					}
				}
			};
			areaWithoutEmoji.push(decoration);
		}



		// while ((match = headingRegex.exec(text))) {
		// 	const startIndex = match.index
		// 	const endIndex = match.index + match[0].length

		// 	const startPos = activeEditor.document.positionAt(startIndex);
		// 	const endPos = activeEditor.document.positionAt(endIndex);
		// 	const range = new vscode.Range(startPos, endPos);

		// 	const decoration = {
		// 		range: range
		// 	};
		// 	heading.push(decoration);
		// }

		activeEditor.setDecorations(checkedDecorationType, checked);
		activeEditor.setDecorations(commentDecorationType, comment);
		activeEditor.setDecorations(projectDecorationType, project);
		activeEditor.setDecorations(areaDecorationType, area);
		activeEditor.setDecorations(uncheckedDecorationType, unchecked);
		activeEditor.setDecorations(areaWithoutEmojiDecorationType, areaWithoutEmoji);
		// activeEditor.setDecorations(headingDecorationType, heading);
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