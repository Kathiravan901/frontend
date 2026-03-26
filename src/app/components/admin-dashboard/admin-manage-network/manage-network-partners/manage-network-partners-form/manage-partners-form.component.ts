import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerResponseDto, PartnerCreateDto, PartnerUpdateDto } from '@models/partner.model';
import { PartnerStatus } from '@models/enums';

@Component({
  selector: 'app-manage-network-partners-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-partners-form.component.html',
  styleUrls: ['./manage-partners-form.component.scss']
})
export class ManagePartnersFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() isVisible = false;
  @Input() editingPartner: PartnerResponseDto | null = null;

  @Output() save = new EventEmitter<PartnerCreateDto | PartnerUpdateDto>();
  @Output() close = new EventEmitter<void>();

  partnerForm: FormGroup;
  partnerTypes = ['Supplier', 'Carrier', '3PL'];
  statuses = ['Active', 'Inactive'];
  PartnerStatus = PartnerStatus;

  constructor() {
    this.partnerForm = this.fb.group({
      partnerName: ['', Validators.required],
      partnerType: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingPartner'] && this.editingPartner) {
      this.partnerForm.patchValue({
        partnerName: this.editingPartner.partnerName,
        partnerType: this.editingPartner.partnerType,
        status: this.editingPartner.status
      });
    }
    if (changes['isVisible'] && !this.isVisible) {
      this.partnerForm.reset({ status: 'Active' });
    }
  }

  onSave(): void {
    if (this.partnerForm.invalid) {
      return;
    }

    const formValue = this.partnerForm.value;
    const statusValue = this.convertStatusToEnum(formValue.status);

    if (this.editingPartner) {
      const updateDto: PartnerUpdateDto = {
        partnerId: this.editingPartner.partnerId,
        partnerName: formValue.partnerName,
        partnerType: formValue.partnerType,
        status: statusValue
      };
      this.save.emit(updateDto);
    } else {
      const createDto: PartnerCreateDto = {
        partnerName: formValue.partnerName,
        partnerType: formValue.partnerType,
        status: statusValue
      };
      this.save.emit(createDto);
    }
  }

  private convertStatusToEnum(status: string | number): PartnerStatus {
    if (typeof status === 'number') {
      return status;
    }
    return status === 'Active' ? PartnerStatus.Active : PartnerStatus.Inactive;
  }

  onClose(): void {
    this.close.emit();
  }
}
