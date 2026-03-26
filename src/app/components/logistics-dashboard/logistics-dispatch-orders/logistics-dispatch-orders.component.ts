import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderResponseDto, PartnerResponseDto, ShipmentDispatchDto } from '../../../models';
import { OrderService } from '../../../services/order.service';
import { PartnerService } from '../../../services/partner.service';
import { ShipmentService } from '../../../services/shipment.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-logistics-dispatch-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './logistics-dispatch-orders.component.html',
  styleUrls: ['./logistics-dispatch-orders.component.scss']
})
export class LogisticsDispatchOrdersComponent implements OnInit, OnDestroy {
  orders: OrderResponseDto[] = [];
  partners: PartnerResponseDto[] = [];
  filteredPartners: PartnerResponseDto[] = [];
  isLoading = false;
  showDispatchForm = false;
  selectedOrder: OrderResponseDto | null = null;
  dispatchForm: FormGroup;
  isDispatching = false;
  successMessage = '';
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private partnerService: PartnerService,
    private shipmentService: ShipmentService
  ) {
    this.dispatchForm = this.fb.group({
      carrierPartnerId: [null, Validators.required],
      shipmentRefNo: [''],
      dispatchDateUtc: [new Date().toISOString().split('T')[0], Validators.required],
      estimatedArrivalUtc: ['']
    });
  }

  ngOnInit() {
    this.loadOrders();
    this.loadPartners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.listOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load orders';
        this.isLoading = false;
      }
    });
  }

  loadPartners() {
    this.partnerService.listPartners().subscribe({
      next: (partners) => {
        this.partners = partners;
      },
      error: (error: any) => {
        console.error('Error loading partners:', error);
      }
    });
  }

  updateFilteredPartners(orderType: string) {
    if (!orderType) {
      this.filteredPartners = [];
      return;
    }

    let partnerType: string;
    switch (orderType) {
      case 'PO':
        partnerType = 'Supplier';
        break;
      case 'SO':
        partnerType = 'Carrier';
        break;
      case 'Transfer':
        partnerType = '3PL';
        break;
      default:
        partnerType = '';
    }

    if (!partnerType) {
      this.filteredPartners = [];
      return;
    }

    this.filteredPartners = this.partners.filter(
      (partner) => partner.partnerType?.trim().toLowerCase() === partnerType.toLowerCase()
    );
  }

  openDispatchForm(order: OrderResponseDto) {
    this.selectedOrder = order;
    this.updateFilteredPartners(order.orderType);
    this.dispatchForm.patchValue({
      carrierPartnerId: null,
      shipmentRefNo: '',
      dispatchDateUtc: new Date().toISOString().split('T')[0],
      estimatedArrivalUtc: ''
    });
    this.showDispatchForm = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeDispatchForm() {
    this.showDispatchForm = false;
    this.selectedOrder = null;
  }

  onDispatch() {
    if (this.dispatchForm.valid && this.selectedOrder) {
      this.isDispatching = true;
      const formValue = this.dispatchForm.value;
      const dto: ShipmentDispatchDto = {
        carrierPartnerId: formValue.carrierPartnerId,
        shipmentRefNo: formValue.shipmentRefNo || undefined,
        dispatchDateUtc: new Date(formValue.dispatchDateUtc),
        estimatedArrivalUtc: formValue.estimatedArrivalUtc ? new Date(formValue.estimatedArrivalUtc) : undefined
      };

      this.shipmentService.dispatch(this.selectedOrder.orderId, dto).subscribe({
        next: (response) => {
          this.successMessage = 'Order dispatched successfully!';
          this.orders = this.orders.filter(o => o.orderId !== this.selectedOrder!.orderId);
          this.closeDispatchForm();
          this.isDispatching = false;
        },
        error: (error) => {
          // Extract specific error message from backend
          if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else if (error.status === 400) {
            this.errorMessage = 'Invalid dispatch information. Check inventory levels and adjust as needed.';
          } else {
            this.errorMessage = 'Failed to dispatch order. Please try again.';
          }
          this.isDispatching = false;
        }
      });
    }
  }

  getOrderTypeCount(orderType: string): number {
    return this.orders.filter(o => (o.orderType || '').toLowerCase() === orderType.toLowerCase()).length;
  }
}
