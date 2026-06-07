// test/obsidian-stub.js · minimal stand-in for Obsidian's API · only what main.js touches at parse time

class Modal {
  constructor(app) { this.app = app; this.contentEl = { empty() {}, createEl() { return {}; }, createDiv() { return { createEl() { return {}; }, createDiv() { return {}; } }; } }; }
  open() {}
  close() {}
}
class Plugin {
  constructor(app, manifest) { this.app = app; this.manifest = manifest; }
  addCommand() {}
  addRibbonIcon() {}
  async onload() {}
  onunload() {}
}
class SuggestModal extends Modal {}
class Notice { constructor(_msg) {} }
class MarkdownView {}

module.exports = { Modal, Plugin, SuggestModal, Notice, MarkdownView };
