import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ItemResponseDto, PartnerResponseDto, LocationResponseDto, OrderCreateDto } from '../../../models';
import { ItemService } from '../../../services/item.service';
import { LocationService } from '../../../services/location.service';
import { OrderService } from '../../../services/order.service';
import { PartnerService } from '../../../services/partner.service';
import { OrderContextService } from '../../../services/order-context.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss']
})
export class AddOrderComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private itemService = inject(ItemService);
  private partnerService = inject(PartnerService);
  private locationService = inject(LocationService);
  private orderContextService = inject(OrderContextService);

  orderForm: FormGroup;
  items: ItemResponseDto[] = [];
  partners: PartnerResponseDto[] = [];
  locations: LocationResponseDto[] = [];
  filteredPartners: PartnerResponseDto[] = [];
  disabledOrderTypes: string[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor() {
    this.orderForm = this.fb.group({
      orderType: ['PO', Validators.required],
      partnerId: [null],
      originLocationId: [null],
      destinationLocationId: [null],
      orderDate: [new Date().toISOString().split('T')[0], Validators.required],
      expectedDeliveryDate: [''],
      lines: this.fb.array([])
    });
  }

  ngOnInit() {
    // Subscribe to disabled order types from context service
    this.orderContextService.disabledOrderTypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((disabledTypes) => {
        this.disabledOrderTypes = disabledTypes;
      });

    this.loadItems();
    this.loadPartners();
    this.loadLocations();
    this.addOrderLine();
    
    // Subscribe to orderType changes
    this.orderForm.get('orderType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((orderType) => {
        this.updateFilteredPartners(orderType);
        this.orderForm.patchValue({ partnerId: null }); // Reset partner selection
      });
    
    // Initial population of filtered partners (when partners are loaded)
    this.updateFilteredPartners(this.orderForm.get('orderType')?.value);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get orderLines(): FormArray {
    return this.orderForm.get('lines') as FormArray;
  }

  addOrderLine() {
    const line = this.fb.group({
      itemId: [null, Validators.required],
      qtyOrdered: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
    this.orderLines.push(line);
  }

  removeOrderLine(index: number) {
    this.orderLines.removeAt(index);
  }

  loadItems() {
    this.itemService.listItems().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load items.';
      }
    });
  }

  loadPartners() {
    this.partnerService.listPartners().subscribe({
      next: (data) => {
        this.partners = data;
        this.updateFilteredPartners(this.orderForm.get('orderType')?.value);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load partners.';
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

  loadLocations() {
    this.locationService.listLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load locations.';
      }
    });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      const formValue = this.orderForm.value;
      const dto: OrderCreateDto = {
        orderType: formValue.orderType,
        partnerId: formValue.partnerId || undefined,
        originLocationId: formValue.originLocationId || undefined,
        destinationLocationId: formValue.destinationLocationId || undefined,
        orderDate: new Date(formValue.orderDate),
        expectedDeliveryDate: formValue.expectedDeliveryDate ? new Date(formValue.expectedDeliveryDate) : undefined,
        lines: formValue.lines
      };

      this.orderService.placeOrder(dto).subscribe({
        next: (response) => {
          this.successMessage = 'Order placed successfully!';
          this.orderForm.reset();
          this.orderForm.patchValue({ orderType: 'PO', orderDate: new Date().toISOString().split('T')[0] });
          while (this.orderLines.length > 0) {
            this.orderLines.removeAt(0);
          }
          this.addOrderLine();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to place order. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  isOrderTypeDisabled(orderType: string): boolean {
    return this.disabledOrderTypes.includes(orderType);
  }
}
