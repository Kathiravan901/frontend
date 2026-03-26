import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationResponseDto } from '@models/location.model';

@Component({
  selector: 'app-manage-network-locations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-locations-list.component.html',
  styleUrls: ['./manage-locations-list.component.scss']
})
export class ManageLocationsListComponent {
  @Input() locations: LocationResponseDto[] = [];
  @Input() isLoading = false;

  @Output() edit = new EventEmitter<LocationResponseDto>();
  @Output() delete = new EventEmitter<number>();

  onEdit(location: LocationResponseDto): void {
    this.edit.emit(location);
  }

  onDelete(locationId: number): void {
    if (confirm('Are you sure you want to delete this location?')) {
      this.delete.emit(locationId);
    }
  }
}
