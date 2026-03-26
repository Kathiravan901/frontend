import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LaneResponseDto, LaneCreateDto, LaneUpdateDto } from '@models/lane.model';
import { LocationResponseDto } from '@models/location.model';

@Component({
  selector: 'app-manage-network-lanes-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-network-lanes-form.component.html',
  styleUrls: ['./manage-network-lanes-form.component.scss']
})
export class ManageLanesFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() isVisible = false;
  @Input() editingLane: LaneResponseDto | null = null;
  @Input() locations: LocationResponseDto[] = [];

  @Output() save = new EventEmitter<LaneCreateDto | LaneUpdateDto>();
  @Output() close = new EventEmitter<void>();

  laneForm: FormGroup;
  transportModes = ['Road', 'Rail', 'Air', 'Sea'];

  constructor() {
    this.laneForm = this.fb.group({
      originLocationId: [0, Validators.required],
      destinationLocationId: [0, Validators.required],
      mode: ['', Validators.required],
      transitTimeDays: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingLane'] && this.editingLane) {
      this.laneForm.patchValue(this.editingLane);
    }
    if (changes['isVisible'] && !this.isVisible) {
      this.laneForm.reset();
    }
  }

  onSave(): void {
    if (this.laneForm.invalid) {
      return;
    }

    const formValue = this.laneForm.value;

    if (this.editingLane) {
      const updateDto: LaneUpdateDto = {
        ...formValue,
        laneId: this.editingLane.laneId
      };
      this.save.emit(updateDto);
    } else {
      const createDto: LaneCreateDto = formValue;
      this.save.emit(createDto);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
