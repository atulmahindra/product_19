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

  // file upload
   files: File[] = [];
  excelData: any[] = [];
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
handleOptionSelect(option: any) {
  console.log("option", option);
  console.log("currentNode", this.currentNode());
 if(this.currentNode().upload_file === 1){
  alert("jkjdf")
 }
  this.getOptions_bot_fun(option, this.currentNode());
}
file_upload(){
  console.log("file upload called")
}


getOptions_bot_fun(option,node) {
  this.pushUser(option);
this._shared_service.getOptions_bot({ key: node.recordID, optionSelected: option, recordID: node.recordID }).subscribe((res)=>{
  console.log("res", res)
  this.FLOW.update(value => [...value, res])
   this.pushBot(this.currentPrompt(), res);
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

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        validFiles.push(file);
        this.readExcel(file);
      } else {
        alert(`❌ Invalid file type: ${file.name} (only .xls/.xlsx allowed)`);
      }
    }

    this.files = [...this.files, ...validFiles];
  }

  /** Read Excel and log content (optional) */
  readExcel(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(`📘 ${file.name} content:`, jsonData);
      this.excelData.push({ name: file.name, data: jsonData });
    };
    reader.readAsArrayBuffer(file);
  }

  /** Upload all files to API */
  uploadAll(): void {
  if (this.files.length === 0) {
    alert('Please select at least one Excel file.');
    return;
  }

  // Make sure currentNode() and options exist
  // const node = this.currentNode();
  // if (!node || !node.options || !Array.isArray(node.options)) {
  //   alert('Invalid node or missing options.');
  //   return;
  // }

  // Loop through all selected files
  this.files.forEach((file, index) => {
    // Dynamically take file_type from node.options[index]
    const fileOption = this.currentNode().options[index];
    const file_type = fileOption?.file_type || 'EXCEL'; // fallback if missing

    console.log(`Uploading file: ${file.name}, file_type: ${file_type}`);

    this._shared_service
  .uploadfile({
    file,
    file_type,
    recordID: this.currentNode().recordID,
  })
  .subscribe({
    next: (res) => {
      console.log(`✅ ${file.name} uploaded successfully`, res);

      if (res.message === 'FAILED') {
        // alert(`❌ ${file.name} upload failed: ${res.reason}`);

        // ❌ Remove failed file from array
        this.files = this.files.filter(f => f.name !== file.name);
      } else {
        // ✅ Remove successfully uploaded file from array
        // this.files = this.files.filter(f => f.name !== file.name);
      }

      // Optionally trigger next bot step or refresh state
      // this._shared_service.getOptions_bot({ key: 'files_uploaded', optionSelected: 'files_uploaded', recordID: this.currentNode().recordID })
      //   .subscribe((res) => {
      //     console.log("res", res);
      //     this.FLOW.update(value => [...value, res]);
      //     this.pushBot(this.currentPrompt(), res);
      //   });
    },
    error: (err) => {
      console.error(`❌ Error uploading ${file.name}`, err);
      alert(`Error uploading ${file.name}`);

      // ⚠️ Remove errored file as well
      this.files = this.files.filter(f => f.name !== file.name);
    },
  });
  });
}


  /** Prevent default drag behavior */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }
  viewfiles(file){
    console.log("file",file)
  }
  drop(event: CdkDragDrop<File[]>) {
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
  }

  /** Delete a file from list */
  deleteFile(index: number): void {
    const removed = this.files[index];
    this.files.splice(index, 1);
    this.excelData = this.excelData.filter(f => f.name !== removed.name);
  }

   /** Re-upload a specific file */


  // end
}
