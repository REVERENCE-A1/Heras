import { Skills } from './skills/index.js';
import { Plugins } from './plugins/index.js';
import { Auth } from './utils/auth.js';
import { Theme } from './utils/theme.js';

const Heras = {
  profile: {
    name: "Friend",
    apiKey: "Omnivo", // Replace with your OpenAI API Key or use config.js
    theme: "dark",
  },
  skills: {},
  plugins: {},
  init() {
    Auth.init(Heras);
    Theme.init(Heras);
    Skills.init(Heras);
    Plugins.init(Heras);
    this.initUI();
    this.addMsg('system', `👋 Hello ${this.profile.name}, I'm Heras! Ask or click a quick action.`);
  },
  initUI() {
    // Quick actions from skills
    const qa = document.getElementById('quick-actions');
    qa.innerHTML = '';
    Object.values(this.skills).forEach(skill => {
      if (skill.quickAction) {
        const btn = document.createElement('button');
        btn.textContent = skill.quickAction.label;
        btn.onclick = skill.quickAction.action;
        qa.appendChild(btn);
      }
    });
    // Text form/voice/file handlers
    document.getElementById('text-form').onsubmit = (e) => {
      e.preventDefault();
      const val = document.getElementById('text-input').value.trim();
      if (val) {
        this.addMsg('user', val);
        this.processInput(val);
        document.getElementById('text-input').value = '';
      }
    };
    // Voice stub (add full logic as needed)
    document.getElementById('voice-btn').onclick = () => alert('Voice input coming soon!');
  },
  addMsg(sender, msg) {
    const div = document.createElement('div');
    div.className = 'msg ' + sender;
    div.textContent = (sender === 'heras' ? "Heras: " : sender === 'system' ? "" : "You: ") + msg;
    document.getElementById('conversation').appendChild(div);
    document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
  },
  async processInput(input) {
    // Intent classifier
    let intent = await Skills.classifyIntent?.(input, this);
    // Skills
    if (intent && this.skills[intent]) {
      const resp = await this.skills[intent].run(input, this);
      if (resp) return this.addMsg('heras', resp);
    }
    // Plugins
    for (let pluginId in this.plugins) {
      if (this.plugins[pluginId].match(input)) {
        const resp = await this.plugins[pluginId].run(input, this);
        if (resp) return this.addMsg('heras', resp);
      }
    }
    // Fallback: AI chat
    this.addMsg('heras', await Skills.askAI(input, this));
  }
};

window.Heras = Heras;
window.addEventListener('DOMContentLoaded', () => Heras.init());
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
