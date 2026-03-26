import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '@services/location.service';
import { LocationResponseDto } from '@models/location.model';

@Component({
  selector: 'app-procurement-view-locations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './procurement-view-locations.component.html',
  styleUrls: ['./procurement-view-locations.component.scss']
})
export class ProcurementViewLocationsComponent implements OnInit {
  private locationService = inject(LocationService);

  locations: LocationResponseDto[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.locationService.listLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load locations.';
        this.isLoading = false;
      }
    });
  }

  getLocationTypeBadgeClass(type: string): string {
    switch ((type || '').trim().toLowerCase()) {
      case 'plant':
        return 'primary';
      case 'warehouse':
        return 'warning';
      case 'dc':
      case 'distributioncenter':
      case 'distribution center':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getTypeCount(type: string): number {
    const normalized = (type || '').trim().toLowerCase().replace(/\s+/g, '');
    return this.locations.filter(l => {
      const locationType = (l.type || '').trim().toLowerCase().replace(/\s+/g, '');

      if (normalized === 'dc') {
        return locationType === 'dc' || locationType === 'distributioncenter';
      }

      return locationType === normalized;
    }).length;
  }

  getRegionCount(): number {
    return new Set(
      this.locations
        .map(l => (l.region || '').trim())
        .filter(region => region.length > 0)
    ).size;
  }

  getLocationTypeLabel(type: string): string {
    switch ((type || '').trim().toLowerCase().replace(/\s+/g, '')) {
      case 'dc':
      case 'distributioncenter':
        return 'DC';
      case 'plant':
        return 'Plant';
      case 'warehouse':
        return 'Warehouse';
      default:
        return type || 'Unknown';
    }
  }
}
