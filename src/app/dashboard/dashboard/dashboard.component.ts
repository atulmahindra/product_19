import { Component, signal, computed } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button'

/** Simple message type */
interface Message {
  from: 'bot' | 'user';
  text: string;
  ts: number;
}

/** A tiny decision tree of yes/no questions */
interface Node {
  q?: string;       // question text (optional for terminal nodes)
  yes?: number;    // index of next node for "Yes"
  no?: number;     // index of next node for "No"
  end?: string;    // optional end message
}

const FLOW: Node[] = [
  { q: 'Do you want to create a new Angular project?', yes: 1, no: 2 },
  { q: 'selcted yes', yes: 3, no: 4 },
  { q: 'selected no', yes: 3, no: 6 },
  { q: '', end: 'Great! Run: ng add @angular/material' },
  { q: '', end: 'No problem. You can style later with plain CSS.' },
  { q: '', end: 'Create one with: ng new my-app --standalone' },
  { q: 'Is this helpful?', yes: 1, no: 2 },
  { q: '', end: 'Awesome! Have a great day.' },
  { q: '', end: 'Thanks for the feedback — I will improve.' },
];
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
title = 'yesno-bot';

  messages = signal<Message[]>([]);
  step = signal<number>(0);
  finished = signal<boolean>(false);
  
  currentNode = computed(() => FLOW[this.step()]);

  constructor() {
    this.pushBot(this.currentPrompt());
  }

  trackByMsg(_index: number, item: Message) {
    return item.ts;
  }

  currentPrompt(): string {
    const node = this.currentNode();
    console.log('Current node:', node);
    return node.end ? node.end : (node.q ?? '');
  }

  onAnswer(choice: any) {
    console.log('User choice:', choice);
    if (this.finished()) return;

    // push user answer
    this.pushUser(choice);

    const node = this.currentNode();

    // if this node ends the flow
    if (node.end) {
      this.finished.set(true);
      return;
    }

    // move to next node by choice
    const nextIndex = choice === 'Yes' ? node.yes : node.no;
console.log('Next node index:', nextIndex);
    if (typeof nextIndex === 'number') {
      this.step.set(nextIndex);
      const nextNode = FLOW[nextIndex];

      // If next node is terminal, mark finished after bot reply
        if (nextNode.end) {
          this.pushBot(nextNode.end);
          this.finished.set(true);
        } else {
          this.pushBot(nextNode.q ?? '');
        }
    } else {
      // safety: if flow is malformed, end politely
      this.pushBot('Thanks! That was the last question.');
      this.finished.set(true);
    }
  }

  reset() {
    this.messages.set([]);
    this.step.set(0);
    this.finished.set(false);
    this.pushBot(this.currentPrompt());
  }

  private async pushBot(fullText: string) {
  // Step 1: Show typing placeholder
  this.messages.update((m) => [...m, { from: 'bot', text: 'typing', ts: Date.now(),options: ['Yes', 'No'] }]);
  console.log("messages",this.messages())
  const index = this.messages().length - 1;
console.log('Bot message index:', index);
  // Step 2: Animate dots for 1 seconds
  const typingDuration = 1000;
  const dotInterval = 300;
  let elapsed = 0;
  while (elapsed < typingDuration) {
    const dots = '.'.repeat((elapsed / dotInterval) % 4);
    this.messages.update((m) => {
      const updated = [...m];
      updated[index] = { ...updated[index], text: `typing${dots}` };
      return updated;
    });
    await new Promise((r) => setTimeout(r, dotInterval));
    elapsed += dotInterval;
  }

  // Step 3: Replace typing text with real message (typed slowly)
  const typingSpeed = 10; // ms per character
  this.messages.update((m) => {
    const updated = [...m];
    updated[index] = { ...updated[index], text: '' };
    return updated;
  });

  for (let i = 0; i < fullText.length; i++) {
    const current = fullText.slice(0, i + 1);
    this.messages.update((m) => {
      const updated = [...m];
      updated[index] = { ...updated[index], text: current };
      return updated;
    });
    await new Promise((res) => setTimeout(res, typingSpeed));
  }
}


  private pushUser(text: string) {
    console.log("selected option:", text);
    this.messages.update((m) => [...m, { from: 'user', text, ts: Date.now() }]);
    console.log('User message:', this.messages);
  }
}
