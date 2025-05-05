import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core'; // Input, OnChanges, SimpleChanges added
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Message, MessageService } from '../message.service'; // Corrected path
import { MessageFilterCriteria } from '../message-filter/message-filter.component'; // Import filter criteria

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule], // Add CommonModule
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit, OnChanges { // Implement OnChanges
  @Input() filterCriteria: MessageFilterCriteria = {}; // Receive filter criteria
  @Output() editClicked = new EventEmitter<Message>();

  allMessages: Message[] = []; // Store all messages fetched from service
  filteredMessages: Message[] = []; // Messages displayed after filtering

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadMessages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // React to changes in filterCriteria input
    if (changes['filterCriteria']) {
      console.log('Filter criteria changed in list:', this.filterCriteria);
      this.applyClientSideFilter();
    }
  }

  loadMessages(): void {
    this.messageService.getMessages()
      .subscribe({
        next: (messages) => {
          this.allMessages = messages;
          this.applyClientSideFilter(); // Apply initial filter
        },
        error: (error) => console.error('Error loading messages:', error)
      });
  }

  applyClientSideFilter(): void {
    // Basic client-side filtering (backend filtering is better for large datasets)
    this.filteredMessages = this.allMessages.filter(message => {
      let match = true;

      // Filter by user
      if (this.filterCriteria.userId && message.user?._id !== this.filterCriteria.userId) {
        match = false;
      }

      // Filter by 'onlyMyMessages' (requires knowing the current user's ID - using temp localStorage)
      const tempUserId = localStorage.getItem('tempUserId');
      if (this.filterCriteria.onlyMyMessages && (!tempUserId || message.user?._id !== tempUserId)) {
          match = false;
      }

      // Filter by dateRange (basic example - needs date info in message model)
      // if (this.filterCriteria.dateRange === 'today') { ... }
      // if (this.filterCriteria.dateRange === 'week') { ... }

      return match;
    });
  }

  onEdit(message: Message): void {
    this.editClicked.emit(message);
  }

  onDelete(message: Message): void {
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      this.messageService.deleteMessage(message)
        .subscribe({
          next: () => {
            console.log('Message deleted');
            // Remove from both lists after successful deletion
            this.allMessages = this.allMessages.filter(m => m._id !== message._id);
            this.applyClientSideFilter(); // Re-apply filter
          },
          error: (error) => console.error('Error deleting message:', error)
        });
    }
  }
}

