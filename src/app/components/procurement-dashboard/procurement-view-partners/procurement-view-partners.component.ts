import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerService } from '@services/partner.service';
import { ToastService } from '@services/toast.service';
import { PartnerResponseDto } from '@models/partner.model';

@Component({
  selector: 'app-procurement-view-partners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './procurement-view-partners.component.html',
  styleUrls: ['./procurement-view-partners.component.scss']
})
export class ProcurementViewPartnersComponent implements OnInit {
  private partnerService = inject(PartnerService);
  private toastService = inject(ToastService);

  partners: PartnerResponseDto[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPartners();
  }

  loadPartners(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.partnerService.listPartners().subscribe({
      next: (data) => {
        this.partners = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.error('Failed to load partners.');
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string | null | undefined): string {
    return (status || '').trim().toLowerCase() === 'active' ? 'success' : 'danger';
  }

  getTypeClass(type: string | null | undefined): string {
    const normalized = (type || '').trim().toLowerCase();
    if (normalized === 'supplier') return 'primary';
    if (normalized === 'carrier') return 'info';
    if (normalized === '3pl' || normalized === 'logistics') return 'warning';
    return 'secondary';
  }

  getTypeCount(type: string): number {
    const normalized = (type || '').trim().toLowerCase();
    return this.partners.filter(p => {
      const partnerType = (p.partnerType || '').trim().toLowerCase();

      if (normalized === '3pl') {
        return partnerType === '3pl' || partnerType === 'logistics';
      }

      return partnerType === normalized;
    }).length;
  }
}
