import { Component, signal, computed, effect } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../../shared/shared.service';
import { Router } from '@angular/router';

/** Message type */
interface Message {
  from: 'bot' | 'user';
  text: string;
  ts: number;
}

/** Flow node type */
interface FlowNode {
  display_message?: string;
  options?: string[];
  option_type?: string;
  upload_file?: number;
  recordID?: string;
  end?: string;
  [key: string]: any;
}

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

  FLOW = signal<FlowNode[]>([{ options: ["Warehousing", "Transportation"], option_type: "solution_type", upload_file: 0, display_message: "What solution you want to develop today? Please select one.", recordID: "68fa5e7e25e064d2f4e164a3" }]); // ✅ store API result here
  currentNode = computed(() => this.FLOW()[this.step()] || {});

  constructor(private router: Router, private _shared_service: SharedService) {}

 ngOnInit(): void {

  this._shared_service.bot_obj.subscribe((res: any) => {
    if (res) {

      const flowArray = Array.isArray(res) ? res : [res];

      this.FLOW.set(flowArray); // ✅ Always set as array
      console.log('FLOW loaded:', this.FLOW());

  
      this.pushBot(this.currentPrompt());
    } else {
      console.warn('Invalid flow response:', res);
    }
  });
}

  trackByMsg(_index: number, item: Message) {
    return item.ts;
  }

  currentPrompt(): string {
    const node = this.currentNode();
    return node.end ? node.end : (node.display_message ?? '');
  }

  onAnswer(choice: string) {
    if (this.finished()) return;
    this.pushUser(choice);

    const node = this.currentNode();

    if (node.end) {
      this.finished.set(true);
      return;
    }

  
    this._shared_service.getOptions_bot({  key: "solution_design", optionSelected: choice, recordID: node.recordID }).subscribe({
      next: (nextNode: FlowNode) => {
       
        this.FLOW.set([nextNode]);
        this.step.set(0); // always 0 index
        this.pushBot(this.currentPrompt());
      },
      error: (err) => {
        console.error('Error loading next flow:', err);
        this.pushBot('Oops, something went wrong while processing your choice.');
      }
    });
  }

  reset() {
    this.messages.set([]);
    this.step.set(0);
    this.finished.set(false);
    if (this.FLOW().length > 0) {
      this.pushBot(this.currentPrompt());
    }
  }

  private async pushBot(fullText: string) {
    this.messages.update((m) => [...m, { from: 'bot', text: 'typing', ts: Date.now() }]);
    const index = this.messages().length - 1;

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

    const typingSpeed = 10;
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
    this.messages.update((m) => [...m, { from: 'user', text, ts: Date.now() }]);
  }
}
