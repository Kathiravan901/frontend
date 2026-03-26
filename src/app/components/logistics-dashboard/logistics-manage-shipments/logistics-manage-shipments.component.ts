import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShipmentResponseDto, PartnerResponseDto, OrderResponseDto } from '../../../models';
import { OrderService } from '../../../services/order.service';
import { PartnerService } from '../../../services/partner.service';

@Component({
  selector: 'app-logistics-manage-shipments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './logistics-manage-shipments.component.html',
  styleUrls: ['./logistics-manage-shipments.component.scss']
})
export class LogisticsManageShipmentsComponent implements OnInit {
  shipments: ShipmentResponseDto[] = [];
  allShipments: ShipmentResponseDto[] = [];
  statusOptions: string[] = [];
  partners: PartnerResponseDto[] = [];
  orders: OrderResponseDto[] = [];
  isLoading = false;
  filters: FormGroup;
  selectedShipment: ShipmentResponseDto | null = null;
  showShipmentDetails = false;
  errorMessage = '';
  successMessage = '';
  updatingShipmentId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private partnerService: PartnerService
  ) {
    this.filters = this.fb.group({
      status: [''],
      carrierPartnerId: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadShipments();
    this.loadPartners();
    this.loadOrders();
  }

  loadShipments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.orderService.listShipments().subscribe({
      next: (shipments) => {
        this.shipments = shipments;
        this.allShipments = [...shipments];
        this.statusOptions = Array.from(
          new Set(
            shipments
              .map(shipment => shipment.status)
              .filter((status): status is string => !!status && status.trim().length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading shipments:', error);
        this.errorMessage = 'Failed to load shipments';
        this.isLoading = false;
      }
    });
  }

  loadPartners(): void {
    this.partnerService.listPartners().subscribe({
      next: (partners) => {
        this.partners = partners;
      },
      error: (error: any) => {
        console.error('Error loading partners:', error);
      }
    });
  }

  loadOrders(): void {
    this.orderService.listOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  onFilter(): void {
    const filters = this.filters.value;
    let filtered = [...this.allShipments];

    if (filters.status) {
      const selectedStatus = this.normalizeStatus(filters.status);
      filtered = filtered.filter(shipment => this.normalizeStatus(shipment.status) === selectedStatus);
    }
    if (filters.carrierPartnerId) {
      filtered = filtered.filter(shipment => shipment.carrierPartnerId === Number(filters.carrierPartnerId));
    }
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      filtered = filtered.filter(shipment => new Date(shipment.dispatchDateUtc || 0) >= fromDate);
    }
    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      filtered = filtered.filter(shipment => new Date(shipment.dispatchDateUtc || 0) <= toDate);
    }

    this.shipments = filtered;
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status || '').toLowerCase().replace(/[\s_-]/g, '');
  }

  resetFilters(): void {
    this.filters.reset();
    this.loadShipments();
  }

  viewShipmentDetails(shipment: ShipmentResponseDto): void {
    this.selectedShipment = shipment;
    this.showShipmentDetails = true;
  }

  closeShipmentDetails(): void {
    this.showShipmentDetails = false;
    this.selectedShipment = null;
  }

  canMarkDelivered(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized !== 'delivered' && normalized !== 'cancelled' && normalized !== 'closed';
  }

  markAsDelivered(shipment: ShipmentResponseDto): void {
    if (!shipment?.shipmentId || !this.canMarkDelivered(shipment.status) || this.updatingShipmentId === shipment.shipmentId) {
      return;
    }

    this.updatingShipmentId = shipment.shipmentId;
    this.errorMessage = '';
    this.successMessage = '';

    this.orderService
      .deliverShipment(shipment.shipmentId, { actualArrivalUtc: new Date() })
      .subscribe({
        next: () => {
          this.successMessage = `Shipment #${shipment.shipmentId} marked as Delivered.`;
          this.loadShipments();
          if (this.selectedShipment?.shipmentId === shipment.shipmentId) {
            this.closeShipmentDetails();
          }
          this.updatingShipmentId = null;
        },
        error: (error: any) => {
          console.error('Error marking shipment delivered:', error);
          this.errorMessage = error?.error?.error || 'Failed to update shipment status';
          this.updatingShipmentId = null;
        }
      });
  }

  getPartnerName(partnerId: number | null | undefined): string {
    if (!partnerId) return 'Unknown';
    const partner = this.partners.find(p => p.partnerId === partnerId);
    return partner ? partner.partnerName : 'Unknown';
  }

  getOrderId(orderId: number): string {
    const order = this.orders.find(o => o.orderId === orderId);
    return order ? `Order #${order.orderId}` : 'Unknown';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-warning text-dark',
      'intransit': 'bg-primary text-white',
      'shipped': 'bg-info text-white',
      'delivered': 'bg-success text-white',
      'cancelled': 'bg-danger text-white'
    };
    return classes[this.normalizeStatus(status)] || 'bg-secondary text-white';
  }

  getStatusCount(status: string): number {
    const normalized = this.normalizeStatus(status);
    return this.allShipments.filter(s => this.normalizeStatus(s.status) === normalized).length;
  }
}
