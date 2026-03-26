import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageNetworkLanesComponent } from './manage-network-lanes/manage-network-lanes.component';
import { ManageNetworkLocationsComponent } from './manage-network-locations/manage-network-locations.component';
import { ManageNetworkPartnersComponent } from './manage-network-partners/manage-network-partners.component';

@Component({
  selector: 'app-admin-manage-network',
  standalone: true,
  imports: [CommonModule, ManageNetworkLanesComponent, ManageNetworkLocationsComponent, ManageNetworkPartnersComponent],
  templateUrl: './admin-manage-network.component.html',
  styleUrls: ['./admin-manage-network.component.scss']
})
export class AdminManageNetworkComponent implements OnInit {
  activeTab: 'lanes' | 'locations' | 'partners' = 'lanes';

  constructor() {}

  ngOnInit(): void {}

  switchTab(tab: 'lanes' | 'locations' | 'partners'): void {
    this.activeTab = tab;
  }
}
