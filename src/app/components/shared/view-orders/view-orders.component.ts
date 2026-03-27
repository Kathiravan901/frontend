import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '@services/order.service';
import { PartnerService } from '@services/partner.service';
import { ItemService } from '@services/item.service';
import { OrderContextService } from '@services/order-context.service';
import { ToastService } from '@services/toast.service';
import { OrderResponseDto, PartnerResponseDto, ItemResponseDto } from '@models/index';

@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-orders.component.html',
  styleUrls: ['./view-orders.component.scss']
})
export class ViewOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private partnerService = inject(PartnerService);
  private itemService = inject(ItemService);
  private orderContextService = inject(OrderContextService);
  private toastService = inject(ToastService);

  orders: OrderResponseDto[] = [];
  filteredOrders: OrderResponseDto[] = [];
  partners: PartnerResponseDto[] = [];
  items: ItemResponseDto[] = [];
  visibleOrderTypes: string[] = ['PO', 'SO', 'Transfer'];
  isLoading = false;
  errorMessage = '';
  filterOrderType = '';
  filterStatus = '';
  filterPartnerId: number | string = '';
  statusOptions: string[] = ['Open', 'PartiallyShipped', 'Closed', 'Cancelled'];
  selectedOrder: OrderResponseDto | null = null;

  ngOnInit(): void {
    // Subscribe to visible order types
    this.orderContextService.visibleOrderTypes$.subscribe((types) => {
      this.visibleOrderTypes = types;
      this.filterOrders();
    });

    this.loadOrders();
    this.loadPartners();
    this.loadItems();
  }

  loadPartners(): void {
    this.partnerService.listPartners().subscribe({
      next: (data) => {
        this.partners = data;
      },
      error: (error) => {
        console.error('Failed to load partners', error);
      }
    });
  }

  loadItems(): void {
    this.itemService.listItems().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (error) => {
        console.error('Failed to load items', error);
      }
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.listOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filterOrders();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.error('Failed to load orders.');
        this.isLoading = false;
      }
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter((order) => {
      const typeMatch = !this.filterOrderType || order.orderType === this.filterOrderType;
      const statusMatch = !this.filterStatus || this.normalizeStatus(order.status) === this.normalizeStatus(this.filterStatus);
      const partnerMatch = !this.filterPartnerId || order.partnerId === Number(this.filterPartnerId);
      const visibleTypeMatch = this.visibleOrderTypes.includes(order.orderType);
      
      return typeMatch && statusMatch && partnerMatch && visibleTypeMatch;
    });

    if (this.selectedOrder) {
      const stillVisible = this.filteredOrders.find(o => o.orderId === this.selectedOrder?.orderId);
      if (!stillVisible) {
        this.selectedOrder = null;
      }
    }
  }

  resetFilters(): void {
    this.filterOrderType = '';
    this.filterStatus = '';
    this.filterPartnerId = '';
    this.selectedOrder = null;
    this.filterOrders();
  }

  toggleDetails(order: OrderResponseDto): void {
    if (this.selectedOrder?.orderId === order.orderId) {
      this.selectedOrder = null;
      return;
    }

    this.selectedOrder = order;
  }

  closeDetails(): void {
    this.selectedOrder = null;
  }

  getOrderTypeLabel(orderType: string): string {
    const types: { [key: string]: string } = {
      'PO': 'Purchase Order',
      'SO': 'Sales Order',
      'Transfer': 'Transfer'
    };
    return types[orderType] || orderType;
  }

  getPartnerName(partnerId: number | null | undefined): string {
    if (!partnerId) return 'N/A';
    const partner = this.partners.find(p => p.partnerId === partnerId);
    return partner ? partner.partnerName : 'Unknown';
  }

  getItemName(itemId: number | undefined): string {
    if (!itemId) return 'N/A';
    const item = this.items.find(i => i.itemId === itemId);
    return item ? item.itemName : 'Unknown';
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status || '').toLowerCase().replace(/\s+/g, '');
  }

  getStatusClass(status: string): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'open' || normalized === 'pending' || normalized === 'placed') {
      return 'pending';
    }

    if (normalized === 'intransit' || normalized === 'partiallyshipped' || normalized === 'shipped') {
      return 'shipped';
    }

    if (normalized === 'closed' || normalized === 'completed' || normalized === 'delivered') {
      return 'completed';
    }

    if (normalized === 'cancelled' || normalized === 'canceled') {
      return 'cancelled';
    }

    return 'pending';
  }

  getStatusLabel(status: string | null | undefined): string {
    const normalized = this.normalizeStatus(status);
    if (!normalized) return 'Pending';

    if (normalized === 'pending' || normalized === 'placed') return 'Pending';
    if (normalized === 'shipped') return 'Shipped';
    if (normalized === 'completed' || normalized === 'delivered') return 'Completed';
    if (normalized === 'cancelled' || normalized === 'canceled') return 'Cancelled';
    if (normalized === 'intransit') return 'In Transit';
    if (normalized === 'partiallyshipped') return 'Partially Shipped';
    if (normalized === 'open') return 'Open';
    if (normalized === 'closed') return 'Closed';

    return status || 'Pending';
  }

  getOrderTypeColor(orderType: string): string {
    const colors: { [key: string]: string } = {
      'PO': 'primary',
      'SO': 'success',
      'Transfer': 'warning'
    };
    return colors[orderType] || 'secondary';
  }
}
