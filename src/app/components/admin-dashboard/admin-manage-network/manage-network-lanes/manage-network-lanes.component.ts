import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaneService } from '@services/lane.service';
import { LocationService } from '@services/location.service';
import { ToastService } from '@services/toast.service';
import { LaneResponseDto, LaneCreateDto, LaneUpdateDto } from '@models/lane.model';
import { LocationResponseDto } from '@models/location.model';
import { ManageLanesListComponent } from './manage-network-lanes-list/manage-network-lanes-list.component';
import { ManageLanesFormComponent } from './manage-network-lanes-form/manage-network-lanes-form.component';

@Component({
  selector: 'app-manage-network-lanes',
  standalone: true,
  // eslint-disable-next-line @angular-eslint/no-unused-selector
  imports: [CommonModule, ManageLanesListComponent, ManageLanesFormComponent],
  templateUrl: './manage-network-lanes.component.html',
  styleUrls: ['./manage-network-lanes.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ManageNetworkLanesComponent implements OnInit {
  private laneService = inject(LaneService);
  private locationService = inject(LocationService);
  private toastService = inject(ToastService);

  lanes: LaneResponseDto[] = [];
  locations: LocationResponseDto[] = [];
  isLoading = false;
  isFormVisible = false;
  editingLane: LaneResponseDto | null = null;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadLocations();
    this.loadLanes();
  }

  loadLocations(): void {
    this.locationService.listLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.errorMessage = 'Failed to load locations.';
      }
    });
  }

  loadLanes(): void {
    this.isLoading = true;
    this.laneService.listLanes().subscribe({
      next: (data) => {
        this.lanes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading lanes:', err);
        this.errorMessage = 'Failed to load lanes.';
        this.isLoading = false;
      }
    });
  }

  openForm(): void {
    this.isFormVisible = true;
    this.editingLane = null;
    this.errorMessage = '';
  }

  onEditLane(lane: LaneResponseDto): void {
    this.isFormVisible = true;
    this.editingLane = lane;
  }

  onSaveLane(dto: LaneCreateDto | LaneUpdateDto): void {
    if ('laneId' in dto) {
      // Update
      this.laneService.updateLane(dto as LaneUpdateDto).subscribe({
        next: () => {
          this.toastService.success('Lane updated successfully! Notifications sent to Logistics.');
          this.isFormVisible = false;
          this.loadLanes();
        },
        error: (err) => {
          console.error('Error updating lane:', err);
          this.toastService.error(err.error?.message || 'Failed to update lane.');
        }
      });
    } else {
      // Create
      this.laneService.createLane(dto as LaneCreateDto).subscribe({
        next: () => {
          this.toastService.success('Lane added successfully! Notifications sent to Logistics.');
          this.isFormVisible = false;
          this.loadLanes();
        },
        error: (err) => {
          console.error('Error creating lane:', err);
          this.toastService.error(err.error?.message || 'Failed to add lane.');
        }
      });
    }
  }

  onDeleteLane(laneId: number): void {
    this.laneService.deleteLane(laneId).subscribe({
      next: () => {
        this.successMessage = 'Lane deleted successfully!';
        this.loadLanes();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error deleting lane:', err);
        this.errorMessage = err.error?.message || 'Failed to delete lane.';
      }
    });
  }

  closeForm(): void {
    this.isFormVisible = false;
    this.editingLane = null;
    this.errorMessage = '';
  }

  getLocationName(locationId: number): string {
    return this.locations.find(l => l.locationId === locationId)?.name || 'Unknown';
  }
}
