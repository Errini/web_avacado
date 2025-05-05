import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule

// Define filter criteria interface
export interface MessageFilterCriteria {
  userId?: string | null;
  dateRange?: 'today' | 'week' | 'all' | null;
  onlyMyMessages?: boolean | null;
}

@Component({
  selector: 'app-message-filter',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add CommonModule and FormsModule
  templateUrl: './message-filter.component.html',
  styleUrls: ['./message-filter.component.css']
})
export class MessageFilterComponent implements OnInit {
  @Output() filterChanged = new EventEmitter<MessageFilterCriteria>();

  // Dummy user list - replace with actual data later
  users = [
    { _id: 'user1', username: 'Alice' },
    { _id: 'user2', username: 'Bob' },
    { _id: 'user3', username: 'Charlie' }
  ];

  // Filter model
  filterCriteria: MessageFilterCriteria = {
    userId: null,
    dateRange: 'all',
    onlyMyMessages: false
  };

  constructor() { }

  ngOnInit(): void {
  }

  applyFilters(): void {
    // Emit a copy of the criteria to prevent mutation
    this.filterChanged.emit({ ...this.filterCriteria });
  }

  resetFilters(): void {
    this.filterCriteria = {
      userId: null,
      dateRange: 'all',
      onlyMyMessages: false
    };
    this.filterChanged.emit({ ...this.filterCriteria }); // Emit reset criteria
  }
}

