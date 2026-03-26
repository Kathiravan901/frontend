import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerService } from '@services/partner.service';
import { ToastService } from '@services/toast.service';
import { PartnerResponseDto, PartnerCreateDto, PartnerUpdateDto } from '@models/partner.model';
import { ManagePartnersListComponent } from './manage-network-partners-list/manage-partners-list.component';
import { ManagePartnersFormComponent } from './manage-network-partners-form/manage-partners-form.component';

@Component({
  selector: 'app-manage-network-partners',
  standalone: true,
  imports: [CommonModule, ManagePartnersListComponent, ManagePartnersFormComponent],
  templateUrl: './manage-network-partners.component.html',
  styleUrls: ['./manage-network-partners.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ManageNetworkPartnersComponent implements OnInit {
  private partnerService = inject(PartnerService);
  private toastService = inject(ToastService);

  partners: PartnerResponseDto[] = [];
  isLoading = false;
  isFormVisible = false;
  editingPartner: PartnerResponseDto | null = null;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadPartners();
  }

  loadPartners(): void {
    this.isLoading = true;
    this.partnerService.listPartners().subscribe({
      next: (data) => {
        this.partners = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading partners:', err);
        this.errorMessage = 'Failed to load partners.';
        this.isLoading = false;
      }
    });
  }

  openForm(): void {
    this.isFormVisible = true;
    this.editingPartner = null;
    this.errorMessage = '';
  }

  onEditPartner(partner: PartnerResponseDto): void {
    this.isFormVisible = true;
    this.editingPartner = partner;
  }

  onSavePartner(dto: PartnerCreateDto | PartnerUpdateDto): void {
    if ('partnerId' in dto) {
      // Update
      this.partnerService.updatePartner(dto as PartnerUpdateDto).subscribe({
        next: () => {
          this.toastService.success('Partner updated successfully! Notifications sent to Logistics.');
          this.isFormVisible = false;
          this.loadPartners();
        },
        error: (err) => {
          console.error('Error updating partner:', err);
          this.toastService.error(err.error?.message || 'Failed to update partner.');
        }
      });
    } else {
      // Create
      this.partnerService.createPartner(dto as PartnerCreateDto).subscribe({
        next: () => {
          this.toastService.success('Partner added successfully! Notifications sent to Logistics.');
          this.isFormVisible = false;
          this.loadPartners();
        },
        error: (err) => {
          console.error('Error creating partner:', err);
          this.toastService.error(err.error?.message || 'Failed to add partner.');
        }
      });
    }
  }

  closeForm(): void {
    this.isFormVisible = false;
    this.editingPartner = null;
    this.errorMessage = '';
  }
}
