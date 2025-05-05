import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MessageInputComponent } from './message-input/message-input.component'; // Corrected path
import { MessageListComponent } from './message-list/message-list.component'; // Corrected path
import { MessageFilterComponent, MessageFilterCriteria } from './message-filter/message-filter.component'; // Import filter component and criteria
import { Message } from './message.service'; // Corrected path

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, MessageInputComponent, MessageListComponent, MessageFilterComponent], // Add MessageFilterComponent
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messageBeingEdited: Message | null = null;
  currentFilter: MessageFilterCriteria = {}; // Hold current filter

  constructor() { }

  ngOnInit(): void {
  }

  // Function to handle when edit is clicked in the list
  handleEditClicked(message: Message) {
    this.messageBeingEdited = message;
  }

  // Function to handle when a message is saved (either new or edited)
  handleMessageSaved(message: Message) {
    // Currently, the list reloads itself after save/delete.
    // If we want to avoid full reload, add logic here to update the list component's data.
    this.messageBeingEdited = null; // Clear edit state after save
    // Potentially trigger list reload if needed after save
    // this.currentFilter = { ...this.currentFilter }; // Trigger change detection if list depends on filter input
  }

  // Function to handle when editing is cancelled in the input form
  handleEditCancelled() {
    this.messageBeingEdited = null;
  }

  // Function to handle filter changes from the filter component
  handleFilterChanged(criteria: MessageFilterCriteria) {
    console.log('Filter changed:', criteria);
    this.currentFilter = criteria;
    // The list component will react to the change in the [filterCriteria] input
  }
}

