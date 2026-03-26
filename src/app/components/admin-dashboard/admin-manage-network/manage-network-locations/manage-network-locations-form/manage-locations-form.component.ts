import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationResponseDto, LocationCreateDto, LocationUpdateDto } from '@models/location.model';

@Component({
  selector: 'app-manage-network-locations-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-locations-form.component.html',
  styleUrls: ['./manage-locations-form.component.scss']
})
export class ManageLocationsFormComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() editingLocation: LocationResponseDto | null = null;

  @Output() save = new EventEmitter<LocationCreateDto | LocationUpdateDto>();
  @Output() close = new EventEmitter<void>();

  locationForm: FormGroup;
  locationTypes = ['Plant', 'Warehouse', 'DC'];

  constructor(private fb: FormBuilder) {
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      region: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingLocation'] && this.editingLocation) {
      this.locationForm.patchValue(this.editingLocation);
    }
    if (changes['isVisible'] && !this.isVisible) {
      this.locationForm.reset();
    }
  }

  onSave(): void {
    if (this.locationForm.invalid) {
      return;
    }

    const formValue = this.locationForm.value;

    if (this.editingLocation) {
      const updateDto: LocationUpdateDto = {
        ...formValue,
        locationId: this.editingLocation.locationId
      };
      this.save.emit(updateDto);
    } else {
      const createDto: LocationCreateDto = formValue;
      this.save.emit(createDto);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
