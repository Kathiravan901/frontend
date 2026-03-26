import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaneResponseDto } from '@models/lane.model';
import { LocationResponseDto } from '@models/location.model';

@Component({
  selector: 'app-manage-network-lanes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-network-lanes-list.component.html',
  styleUrls: ['./manage-network-lanes-list.component.scss']
})
export class ManageLanesListComponent {
  @Input() lanes: LaneResponseDto[] = [];
  @Input() locations: LocationResponseDto[] = [];
  @Input() isLoading = false;

  @Output() edit = new EventEmitter<LaneResponseDto>();
  @Output() delete = new EventEmitter<number>();

  onEdit(lane: LaneResponseDto): void {
    this.edit.emit(lane);
  }

  onDelete(laneId: number): void {
    if (confirm('Are you sure you want to delete this lane?')) {
      this.delete.emit(laneId);
    }
  }

  getLocationName(locationId: number): string {
    return this.locations.find(l => l.locationId === locationId)?.name || 'Unknown';
  }
}
