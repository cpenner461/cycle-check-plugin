import { Plugin, App, Modal, Setting, MarkdownView, Notice } from "obsidian";

// Modal that collects both week and cycle in one form
class MultiPromptModal extends Modal {
	week: string = "";
	cycle: string = "";
	onSubmit: (week: string, cycle: string) => void;

	constructor(app: App, onSubmit: (week: string, cycle: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		new Setting(contentEl)
			.setName("Week # (1-8)")
			.addText(text => {
				text.setPlaceholder("Enter week number (1-8)");
				text.onChange((value: string) => {
					this.week = value;
				});
			});
		new Setting(contentEl)
			.setName("Cycle #")
			.addText(text => {
				text.setPlaceholder("Enter cycle number");
				text.onChange((value: string) => {
					this.cycle = value;
				});
			});
		new Setting(contentEl)
			.addButton(btn => {
				btn.setButtonText("OK").setCta().onClick(() => {
					this.close();
				});
			});
	}

	onClose() {
		this.onSubmit(this.week, this.cycle);
		this.contentEl.empty();
	}
}

// Awaitable prompt function for both values
function multiPromptUser(app: App): Promise<{ week: string; cycle: string }> {
	return new Promise(resolve => {
		new MultiPromptModal(app, (week, cycle) => {
			resolve({ week, cycle });
		}).open();
	});
}

export default class CycleCheckPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "insert-cycle-check",
			name: "Insert Cycle Check Line",
			callback: async () => {
				const { week, cycle } = await multiPromptUser(this.app);
				const weekNum = parseInt(week ?? "", 10);
				const cycleStr = cycle?.trim() ?? "";

				let line = "";
				switch (weekNum) {
					case 1: line = `Cycle Check: ❎🟩🟩🟩🟩🟩🟦🟦 We are in week 1 of Cycle ${cycleStr}.`; break;
					case 2: line = `Cycle Check: 🟩❎🟩🟩🟩🟩🟦🟦 We are in week 2 of Cycle ${cycleStr}.`; break;
					case 3: line = `Cycle Check: 🟩🟩❎🟩🟩🟩🟦🟦 We are in week 3 of Cycle ${cycleStr}.`; break;
					case 4: line = `Cycle Check: 🟩🟩🟩❎🟩🟩🟦🟦 We are in week 4 of Cycle ${cycleStr}.`; break;
					case 5: line = `Cycle Check: 🟩🟩🟩🟩❎🟩🟦🟦 We are in week 5 of Cycle ${cycleStr}.`; break;
					case 6: line = `Cycle Check: 🟩🟩🟩🟩🟩❎🟦🟦 We are in week 6 of Cycle ${cycleStr}.`; break;
					case 7: line = `Cycle Check: 🟩🟩🟩🟩🟩🟩🔷🟦 We are in the first week of cooldown for Cycle ${cycleStr}.`; break;
					case 8: line = `Cycle Check: 🟩🟩🟩🟩🟩🟩🟦🔷 We are in the second week of cooldown for Cycle ${cycleStr}.`; break;
					default: line = "Invalid week number. Please enter a number between 1 and 8.";
				}

				const activeLeaf = this.app.workspace.activeLeaf;
				if (
					activeLeaf &&
					activeLeaf.view instanceof MarkdownView
				) {
					const editor = activeLeaf.view.editor;
					editor.replaceSelection(line + "\n");
				} else {
					new Notice("No active Markdown file to insert text.");
				}
			},
		});
	}
}