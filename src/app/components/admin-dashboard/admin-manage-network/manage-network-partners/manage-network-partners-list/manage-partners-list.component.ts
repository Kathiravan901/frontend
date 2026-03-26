import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerResponseDto } from '@models/partner.model';

@Component({
  selector: 'app-manage-network-partners-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-partners-list.component.html',
  styleUrls: ['./manage-partners-list.component.scss']
})
export class ManagePartnersListComponent {
  @Input() partners: PartnerResponseDto[] = [];
  @Input() isLoading = false;

  @Output() edit = new EventEmitter<PartnerResponseDto>();

  onEdit(partner: PartnerResponseDto): void {
    this.edit.emit(partner);
  }
}
