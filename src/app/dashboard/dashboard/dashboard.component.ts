import { Component, signal, computed, effect } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../../shared/shared.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

interface UploadedFile extends File {
  status?: 'processing' | 'done' | 'error';
  progress?: number;
}

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

  // upload
  public isDownload = false;
  public isLoading = false;
  public isDragOver = false;
  public uploadedFiles: UploadedFile[] = [];

  /** Drag events */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  /** File selection */
  onFileSelect(event: any): void {
    const files = event.target.files;
    this.handleFiles(files);
  }

  /** Handle multiple Excel files */
  private handleFiles(fileList: FileList): void {
    const excelFiles: UploadedFile[] = Array.from(fileList).filter(file =>
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (excelFiles.length === 0) {
      alert('Only Excel files are allowed!');
      return;
    }

    excelFiles.forEach(file => {
      file.status = 'processing';
      file.progress = 0;
      this.uploadedFiles.push(file);
    });

    this.processFiles(excelFiles);
  }

  /** Process all uploaded Excel files */
  private processFiles(files: UploadedFile[]): void {
    this.isLoading = true;
    const allData: any = {};
    let processedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();

      reader.onprogress = (e: ProgressEvent<FileReader>) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          file.progress = progress;
        }
      };

      reader.onload = (e: any) => {
        try {
          const wb: XLSX.WorkBook = XLSX.read(e.target.result, { type: 'binary' });
          const jsonData = wb.SheetNames.reduce((acc, sheetName) => {
            const sheet = wb.Sheets[sheetName];
            acc[sheetName] = XLSX.utils.sheet_to_json(sheet);
            return acc;
          }, {});
          allData[file.name] = jsonData;
          file.status = 'done';
          file.progress = 100;
        } catch (err) {
          file.status = 'error';
        }

        processedCount++;
        if (processedCount === files.length) {
          this.isLoading = false;
          const dataString = JSON.stringify(allData, null, 2);
          // document.getElementById('output')!.innerText = dataString.slice(0, 400) + '...';
          this.jsonDownload(dataString);
        }
      };

      reader.readAsBinaryString(file);
    });
  }

  /** Remove file from the list */
  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  /** JSON Download link */
  private jsonDownload(data: any): void {
    this.isDownload = true;
    setTimeout(() => {
      const el = document.querySelector('#download2') as HTMLAnchorElement;
      el.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(data)}`);
      el.setAttribute('download', 'excel_to_json.json');
    }, 500);
  }
  // upload end
}
