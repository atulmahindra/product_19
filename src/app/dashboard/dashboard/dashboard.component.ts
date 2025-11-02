import { Component, signal, computed, effect } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../../shared/shared.service';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import * as XLSX from 'xlsx';

/** Message type */
interface Message {
  from: 'bot' | 'user';
  text: string;
  options: string[] | FileUpload[];
  key: string;
  upload_file: number;
  file_view?: number,
  ts: number;
  uploadedFiles?: string[];
  confirmation_message?: string
}

/** Flow node type */
interface FlowNode {
  display_message?: string;
  options?: string[] | FileUpload[]
  option_type?: string;
  upload_file?: number;
  file_view?: number;
  recordID?: string;
  end?: string;
  [key: string]: any;
}

interface FileUploadResponse {
  message?: string,
  reason?: string,
  file_name?: string
}

interface FileUpload {
  display_text: string
  file_type: string
  file_upload: number
  error: string
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  /** Download Excel file by index */
  downloadExcel(index: number): void {
    const file = this.files[index];
    if (!file) return;
    const url = window.URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  }
  files: File[] = [];
  excelData: any[] = [];
  fileStatus: { [key: string]: { status: 'pending' | 'uploading' | 'success' | 'failed', reason?: string } } = {};

  // Track the order and state of file uploads
  uploadOrder: string[] = [];
  uploadInProgress = false;
  replaceIndex: number | null = null;
  allFilesUploaded: boolean = false;
  node = { recordID: '68f1eb62f530a91e52ce5f47' }; 
  // file uploadend
  file_vew: boolean = false;
  file_response: any;
  donwload_files: any;
  title = 'yesno-bot';
  isDragging = false
  isAPICall = false
  searchText: string = '';
  messages = signal<any[]>([]);
  step = signal<number>(0);
  finished = signal<boolean>(false);

  FLOW = signal<any>([{ options: [], option_type: "", upload_file: 0, file_view: 0, display_message: "Great choise, VS! Let's start building a fresh solution. Please provide me with the project details(scope, requirements, and objectives), and I will help you design the best-fit solution.", recordID: "" }]); // ✅ store API result here
  currentNode = computed(() => this.FLOW()[this.FLOW().length - 1] || {});
  fileUpload = signal<FileUpload[]>([])

  constructor(private router: Router, private _shared_service: SharedService) { }
  projectname
  fileuploaded: boolean = false;
  ngOnInit(): void {
    this._shared_service.project_name.subscribe((res) => {
      if (res) {
        this.projectname = res
      }
    })
    this._shared_service.bot_obj.subscribe((res: any) => {
      if (res) {
        this.FLOW.update(value => [...value, res])
        console.log("flow", this.FLOW());
        console.log('FLOW loaded:', this.FLOW());
        this.pushBot(this.currentPrompt(), '');
       
      } else {
        console.log('Invalid flow response:', res);
      }
    });
    // console.log("currentNode",this.currentNode())
  }

  trackByMsg(_index: number, item: Message) {
    return item.ts;
  }

  currentPrompt(): string {
    console.log("currentNode in currentPrompt", this.currentNode()) 
    const node = this.currentNode();
    return node.end ? node.end : (node ?? '');
  }
handleOptionSelect(option: any, msgIndex: number, optIndex: number) {
  // disable options for this message so previous options can't be clicked again
  this.messages.update((m) => {
    const updated = [...m];
    if (updated[msgIndex]) {
      updated[msgIndex] = { ...updated[msgIndex], optionsDisabled: true };
    }
    return updated;
  });

  console.log('option', option);
  console.log('currentNode', this.currentNode());
  if (this.currentNode().upload_file === 1) {
    alert('jkjdf');
  }
  this.getOptions_bot_fun(option, this.currentNode());
}
file_upload(){
  console.log("file upload called")
}


getOptions_bot_fun(option,node) {
  this.pushUser(option);
this._shared_service.getOptions_bot({ key: node.recordID, optionSelected: option, recordID: node.recordID }).subscribe((res)=>{
 if(res){
   console.log("res", res)
  this.FLOW.update(value => [...value, res])
   this.pushBot(this.currentPrompt(), res);
   console.log("messages after bot", this.messages())
 }
})
}
  onAnswer(choice: string, key: string, msg: any) {
    console.log("msg", msg)

    if (this.finished()) return;
    this.pushUser(choice);

    const node = this.currentNode();

    if (node.end) {
      this.finished.set(true);
      return;
    }
    console.log("node", node)
    if (node['is_api_call'] === 1) {
      this.isAPICall = true
    }
  
   




  }
 




  






  reset() {
    this.messages.set([]);
    this.step.set(0);
    this.finished.set(false);
    if (this.FLOW().length > 0) {
      this.pushBot(this.currentPrompt(),'');
    }
  }


  private async pushBot(fullText: any, options:any ) {
    console.log("fullText", fullText)
    this.messages.update((m) => [...m, { from: 'bot', text: 'typing', ...fullText }]);
    // console.log("kkkkkk", this.messages())
    const index = this.messages().length - 1;

    const typingDuration = 10;
    const dotInterval = 10;
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

    for (let i = 0; i < fullText?.display_message.length; i++) {
      const current = fullText.display_message.slice(0, i + 1);
      this.messages.update((m) => {
        const updated = [...m];
        updated[index] = { ...updated[index], text: current };
        return updated;
      });
      await new Promise((res) => setTimeout(res, typingSpeed));
    }
    console.log('messages', this.messages());
  }

  private pushUser(text: string) {
    this.messages.update((m) => [...m, { from: 'user', text, ts: Date.now(), options: [], key: '', upload_file: 0, file_view: 0 }]);
  }



  // start
  /** Handle file drop */
  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const items = event.dataTransfer?.files;
    if (items) this.handleFiles(items);
  }

  /** Handle file browse selection */
  onFileBrowse(event: any): void {
    const items = event.target.files;
    if (items) this.handleFiles(items);
  }

  /** Common handler for file validation */
  handleFiles(fileList: FileList): void {
    const validFiles: File[] = [];

    // Get the maximum allowed files from current node options
    const maxAllowedFiles = this.currentNode().options?.length || 0;

    // Check if adding these files would exceed the limit
    if (this.files.length + fileList.length > maxAllowedFiles) {
      alert(`You can only upload ${maxAllowedFiles} file(s). You already have ${this.files.length} file(s).`);
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!(file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        // skip invalid types
        continue;
      }

      // Prevent adding duplicates by file name
      const alreadyExists = this.files.some(f => f.name === file.name) || validFiles.some(f => f.name === file.name);
      if (alreadyExists) {
        // Notify the user and skip duplicate
        alert(`File "${file.name}" is already added. Duplicate files are not allowed.`);
        continue;
      }

      validFiles.push(file);
      // this.readExcel(file);
    }

    if (validFiles.length > 0) {
      this.files = [...this.files, ...validFiles];
    }
    // Fix ExpressionChangedAfterItHasBeenCheckedError by updating scroll after change
    setTimeout(() => {
      const scrollMe = document.querySelector('.chat-container') as HTMLElement;
      if (scrollMe) scrollMe.scrollTop = scrollMe.scrollHeight;
    });
  }

  /** Read Excel and log content (optional) */
  // readExcel(file: File): void {
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     const data = new Uint8Array(e.target.result);
  //     const workbook = XLSX.read(data, { type: 'array' });
  //     const firstSheet = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[firstSheet];
  //     const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  //     console.log(`📘 ${file.name} content:`, jsonData);
  //     this.excelData.push({ name: file.name, data: jsonData });
  //   };
  //   reader.readAsArrayBuffer(file);
  // }

  /** Upload all files to API sequentially */
  async uploadAll(): Promise<void> {
    console.log('Starting upload all...');
    if (this.files.length === 0) {
      alert('Please select at least one Excel file.');
      return;
    }

    // Only upload files that are not yet successful
    const filesToUpload = this.files.filter(file => {
      const status = this.fileStatus[file.name]?.status;
      return status !== 'success' && status !== 'uploading';
    });

    if (filesToUpload.length === 0) {
      alert('All files are already uploaded successfully!');
      return;
    }

    // Set status to pending for files to be uploaded
    filesToUpload.forEach(file => {
      this.fileStatus[file.name] = { status: 'pending' };
    });

    let allSuccess = true;
    const uploadedFiles = [];

    // Upload files sequentially
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const index = this.files.findIndex(f => f.name === file.name);
      const fileOption = this.currentNode().options[index];
      const file_type = fileOption?.file_type || 'EXCEL';

      this.fileStatus[file.name].status = 'uploading';

      try {
        // Wait for each file upload to complete before moving to next
        const res = await this._shared_service
          .uploadfile({
            file,
            file_type,
            recordID: this.currentNode().recordID,
          })
          .toPromise();

        if (res.message === 'FAILED') {
          this.fileStatus[file.name] = { 
            status: 'failed',
            reason: res.reason 
          };
          allSuccess = false;
        } else {
          this.fileStatus[file.name] = { status: 'success' };
          uploadedFiles.push(file.name);
        }
      } catch (err: any) {
        console.error(`❌ Error uploading ${file.name}`, err);
        this.fileStatus[file.name] = {
          status: 'failed',
          reason: err && err.message ? err.message : 'Unknown error'
        };
        allSuccess = false;
        alert(`Error uploading ${file.name}: ${err && err.message ? err.message : 'Unknown error'}`);
      }
    }

    // Check if all files are now successful
    const allNowSuccess = this.files.every(f => this.fileStatus[f.name]?.status === 'success');
    if (allNowSuccess) {
      alert('✅ All files uploaded successfully!');
      this.allFilesUploaded = true;
      // Trigger next bot step
      this._shared_service.getOptions_bot({ 
        key: 'files_uploaded', 
        optionSelected: 'files_uploaded', 
        recordID: this.currentNode().recordID 
      }).subscribe((res) => {
        this.FLOW.update(value => [...value, res]);
        this.pushBot(this.currentPrompt(), res);
      });
    } else {
      const successCount = this.files.filter(f => this.fileStatus[f.name]?.status === 'success').length;
      const failedCount = this.files.length - successCount;
      // Optionally alert or update UI
    }
  }

  /** Re-upload a specific failed file */
  // async reuploadFile(index: number): Promise<void> {
  //   const file = this.files[index];
  //   if (!file) return;

  //   const fileOption = this.currentNode().options[index];
  //   const file_type = fileOption?.file_type || 'EXCEL';

  //   this.fileStatus[file.name].status = 'uploading';

  //   try {
  //     const res = await this._shared_service
  //       .uploadfile({
  //         file,
  //         file_type,
  //         recordID: this.currentNode().recordID,
  //       })
  //       .toPromise();

  //     if (res.message === 'FAILED') {
  //       this.fileStatus[file.name] = { 
  //         status: 'failed',
  //         reason: res.reason 
  //       };
  //       alert(`❌ Re-upload failed: ${res.reason}`);
  //     } else {
  //       this.fileStatus[file.name] = { status: 'success' };
  //       alert('✅ File re-uploaded successfully!');
  //       // Check if all files are now successful
  //       const allSuccess = this.files.every(f => this.fileStatus[f.name]?.status === 'success');
  //       if (allSuccess) {
  //         alert('✅ All files uploaded successfully!');
  //         this.allFilesUploaded = true;
  //         // Trigger next bot step
  //         this._shared_service.getOptions_bot({ 
  //           key: 'files_uploaded', 
  //           optionSelected: 'files_uploaded', 
  //           recordID: this.currentNode().recordID 
  //         }).subscribe((res) => {
  //           this.FLOW.update(value => [...value, res]);
  //           this.pushBot(this.currentPrompt(), res);
  //         });
  //       }
  //     }
  //   } catch (err: any) {
  //     console.error(`❌ Error re-uploading file`, err);
  //     this.fileStatus[file.name] = { 
  //       status: 'failed',
  //       reason: err.message 
  //     };
  //     alert(`Error re-uploading file: ${err.message}`);
  //   }
  // }

  /** Trigger replace file dialog for specific file index */
  openReplace(index: number): void {
    this.replaceIndex = index;
    const input = document.getElementById('replaceInput') as HTMLInputElement | null;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  /** Handler when a replace file is selected via hidden input */
  onReplaceSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Only Excel files are allowed!');
      return;
    }
    const idx = this.replaceIndex;
    if (idx === null || idx === undefined) return;
    // Prevent replacing with a file name that already exists in another slot
    const existingIndex = this.files.findIndex((f, i) => f.name === file.name && i !== idx);
    if (existingIndex !== -1) {
      alert(`Cannot replace: a file named "${file.name}" already exists at position ${existingIndex + 1}.`);
      // reset input
      input.value = '';
      this.replaceIndex = null;
      return;
    }

    this.handleReplaceFile(file, idx);
    this.replaceIndex = null;
    // reset input
    input.value = '';
  }

  /** Replace file at index with new file, update data and reset status */
  handleReplaceFile(file: File, index: number): void {
    const old = this.files[index];
    if (!old) return;
    // replace in files array
    this.files[index] = file;
    // remove old excelData entry
    this.excelData = this.excelData.filter(f => f.name !== old.name);
    // read new file content
    // this.readExcel(file);
    // reset status for the replaced file
    this.fileStatus[file.name] = { status: 'pending' };
    // remove old status entry if different name
    if (old.name !== file.name) {
      delete this.fileStatus[old.name];
    }
    // Do NOT automatically upload the replaced file — leave as pending for manual upload
  }

  /** Prevent default drag behavior */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /** View files details */
  viewfiles(file: File): void {
    console.log("file", file);
  }

  /** Handle drag and drop reordering */
  drop(event: CdkDragDrop<File[]>): void {
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
  }

  /** Delete a file from list */
  deleteFile(index: number): void {
    const removed = this.files[index];
    this.files.splice(index, 1);
    this.excelData = this.excelData.filter(f => f.name !== removed.name);
    // Fix ExpressionChangedAfterItHasBeenCheckedError by updating scroll after change
    setTimeout(() => {
      const scrollMe = document.querySelector('.chat-container') as HTMLElement;
      if (scrollMe) scrollMe.scrollTop = scrollMe.scrollHeight;
    });
  }

  // end
}
