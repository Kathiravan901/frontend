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

  onEdit(location: LocationResponseDto): void {
    this.edit.emit(location);
  }
}
