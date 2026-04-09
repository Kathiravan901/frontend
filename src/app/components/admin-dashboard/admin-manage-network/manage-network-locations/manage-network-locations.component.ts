import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '@services/location.service';
import { ToastService } from '@services/toast.service';
import { LocationResponseDto, LocationCreateDto, LocationUpdateDto } from '@models/location.model';
import { ManageLocationsListComponent } from './manage-network-locations-list/manage-locations-list.component';
import { ManageLocationsFormComponent } from './manage-network-locations-form/manage-locations-form.component';

@Component({
  selector: 'app-manage-network-locations',
  standalone: true,
  imports: [CommonModule, ManageLocationsListComponent, ManageLocationsFormComponent],
  templateUrl: './manage-network-locations.component.html',
  styleUrls: ['./manage-network-locations.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ManageNetworkLocationsComponent implements OnInit {
  private locationService = inject(LocationService);
  private toastService = inject(ToastService);

  locations: LocationResponseDto[] = [];
  isLoading = false;
  isFormVisible = false;
  editingLocation: LocationResponseDto | null = null;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading = true;
    this.locationService.listLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.errorMessage = 'Failed to load locations.';
        this.isLoading = false;
      }
    });
  }

  openForm(): void {
    this.isFormVisible = true;
    this.editingLocation = null;
    this.errorMessage = '';
  }

  onEditLocation(location: LocationResponseDto): void {
    this.isFormVisible = true;
    this.editingLocation = location;
  }

  onSaveLocation(dto: LocationCreateDto | LocationUpdateDto): void {
    if ('locationId' in dto) {
      // Update
      this.locationService.updateLocation(dto as LocationUpdateDto).subscribe({
        next: () => {
          this.toastService.success('Location updated successfully! Notifications sent to Logistics, Warehouse, and Procurement.');
          this.isFormVisible = false;
          this.loadLocations();
        },
        error: (err) => {
          console.error('Error updating location:', err);
          this.toastService.error(err.error?.message || 'Failed to update location.');
        }
      });
    } else {
      // Create
      this.locationService.createLocation(dto as LocationCreateDto).subscribe({
        next: () => {
          this.toastService.success('Location added successfully! Notifications sent to Logistics, Warehouse, and Procurement.');
          this.isFormVisible = false;
          this.loadLocations();
        },
        error: (err) => {
          console.error('Error creating location:', err);
          this.toastService.error(err.error?.message || 'Failed to add location.');
        }
      });
    }
  }

  closeForm(): void {
    this.isFormVisible = false;
    this.editingLocation = null;
    this.errorMessage = '';
  }
}
