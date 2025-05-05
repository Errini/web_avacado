import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Message, MessageService } from '../message.service'; // Corrected path

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, CommonModule], // Add FormsModule and CommonModule
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent implements OnInit, OnChanges {
  @Input() messageToEdit: Message | null = null;
  @Output() messageSaved = new EventEmitter<Message>();
  @Output() editCancelled = new EventEmitter<void>();

  constructor(private messageService: MessageService) { }

  ngOnInit(): void { }

  // Detect changes if a message is passed for editing
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messageToEdit'] && this.messageToEdit) {
      // Potentially pre-fill form if needed, handled by [(ngModel)]
    } else if (!this.messageToEdit) {
      // Clear form if edit is cancelled or finished
      // this.clearForm(); // Might be needed depending on form handling
    }
  }

  onSubmit(form: NgForm) {
    if (this.messageToEdit) {
      // Editing existing message
      this.messageToEdit.content = form.value.content;
      this.messageService.updateMessage(this.messageToEdit)
        .subscribe({
          next: (updatedMessage: Message) => {
            console.log('Message updated:', updatedMessage);
            this.messageSaved.emit(updatedMessage); // Emit event
            this.messageToEdit = null; // Clear edit state
            form.resetForm();
          },
          error: (error: any) => console.error('Error updating message:', error)
        });
    } else {
      // Adding new message
      const messageContent = form.value.content;
      this.messageService.addMessage(messageContent) // Pass only content
        .subscribe({
          next: (savedMessage: Message) => {
            console.log('Message added:', savedMessage);
            this.messageSaved.emit(savedMessage); // Emit event (optional, list might refetch)
            form.resetForm();
          },
          error: (error: any) => console.error("Error adding message:", error)
        });
    }
  }

  onClear(form: NgForm) {
    this.messageToEdit = null;
    this.editCancelled.emit();
    form.resetForm();
  }
}

