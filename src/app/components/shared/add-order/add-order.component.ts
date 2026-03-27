import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ItemResponseDto, PartnerResponseDto, LocationResponseDto, OrderCreateDto } from '../../../models';
import { ItemService } from '../../../services/item.service';
import { LocationService } from '../../../services/location.service';
import { OrderService } from '../../../services/order.service';
import { PartnerService } from '../../../services/partner.service';
import { OrderContextService } from '../../../services/order-context.service';
import { ToastService } from '../../../services/toast.service';
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
  private toastService = inject(ToastService);

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
      expectedDeliveryDate: ['', this.expectedDeliveryDateValidator.bind(this)],
      lines: this.fb.array([])
    });
  }

  ngOnInit() {
    // Subscribe to disabled order types from context service
    this.orderContextService.disabledOrderTypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((disabledTypes) => {
        this.disabledOrderTypes = disabledTypes;

        const currentOrderType = this.orderForm.get('orderType')?.value;
        if (currentOrderType && this.isOrderTypeDisabled(currentOrderType)) {
          const fallbackOrderType = this.getFirstAvailableOrderType();
          this.orderForm.patchValue({ orderType: fallbackOrderType });
          this.applyOrderTypeValidators(fallbackOrderType);
        }
      });

    this.loadItems();
    this.loadPartners();
    this.loadLocations();
    this.addOrderLine();
    
    // Subscribe to orderType changes
    this.orderForm.get('orderType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((orderType) => {
        this.applyOrderTypeValidators(orderType);
        this.updateFilteredPartners(orderType);
        this.orderForm.patchValue({ partnerId: null }); // Reset partner selection
      });
    
    // Initial population of filtered partners (when partners are loaded)
    const initialOrderType = this.orderForm.get('orderType')?.value;
    this.applyOrderTypeValidators(initialOrderType);
    this.updateFilteredPartners(initialOrderType);
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
        this.toastService.error('Failed to load items.');
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
        this.toastService.error('Failed to load partners.');
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
        this.toastService.error('Failed to load locations.');
      }
    });
  }

  private expectedDeliveryDateValidator(control: AbstractControl): ValidationErrors | null {
    const expectedDate = control.value;
    const orderDate = this.orderForm?.get('orderDate')?.value;

    if (!expectedDate || !orderDate) {
      return null;
    }

    const expected = new Date(expectedDate);
    const order = new Date(orderDate);

    if (expected < order) {
      return { expectedBeforeOrderDate: true };
    }

    return null;
  }

  private applyOrderTypeValidators(orderType: string): void {
    const partnerControl = this.orderForm.get('partnerId');
    const originControl = this.orderForm.get('originLocationId');
    const destinationControl = this.orderForm.get('destinationLocationId');

    partnerControl?.clearValidators();
    originControl?.clearValidators();
    destinationControl?.clearValidators();

    if (orderType === 'PO') {
      partnerControl?.setValidators([Validators.required]);
      destinationControl?.setValidators([Validators.required]);
    }

    if (orderType === 'SO') {
      originControl?.setValidators([Validators.required]);
    }

    if (orderType === 'Transfer') {
      originControl?.setValidators([Validators.required]);
      destinationControl?.setValidators([Validators.required]);
    }

    partnerControl?.updateValueAndValidity({ emitEvent: false });
    originControl?.updateValueAndValidity({ emitEvent: false });
    destinationControl?.updateValueAndValidity({ emitEvent: false });
    this.orderForm.get('expectedDeliveryDate')?.updateValueAndValidity({ emitEvent: false });
  }

  private getFirstAvailableOrderType(): string {
    const available = ['PO', 'SO', 'Transfer'].filter(type => !this.isOrderTypeDisabled(type));
    return available.length > 0 ? available[0] : 'Transfer';
  }

  private markAllAsTouched(): void {
    this.orderForm.markAllAsTouched();
    this.orderLines.controls.forEach(line => line.markAllAsTouched());
  }

  private hasInvalidTransferLocations(): boolean {
    const orderType = this.orderForm.get('orderType')?.value;
    const origin = this.orderForm.get('originLocationId')?.value;
    const destination = this.orderForm.get('destinationLocationId')?.value;

    return orderType === 'Transfer' && !!origin && !!destination && Number(origin) === Number(destination);
  }

  onSubmit() {
    const orderType = this.orderForm.get('orderType')?.value;

    if (this.isOrderTypeDisabled(orderType)) {
      this.toastService.error('You are not authorized to place this order type.');
      return;
    }

    if (!this.orderForm.valid) {
      this.markAllAsTouched();
      this.toastService.error('Please fill in all required fields correctly.');
      return;
    }

    if (this.hasInvalidTransferLocations()) {
      this.toastService.error('Origin and Destination must be different for Transfer orders.');
      return;
    }

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
          this.toastService.success('Order placed successfully!');
          this.successMessage = '';
          this.orderForm.reset();
          const fallbackOrderType = this.getFirstAvailableOrderType();
          this.orderForm.patchValue({ orderType: fallbackOrderType, orderDate: new Date().toISOString().split('T')[0] });
          this.applyOrderTypeValidators(fallbackOrderType);
          while (this.orderLines.length > 0) {
            this.orderLines.removeAt(0);
          }
          this.addOrderLine();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.toastService.error('Failed to place order. Please try again.');
          this.errorMessage = '';
          this.isSubmitting = false;
        }
      });
    }
  }

  isOrderTypeDisabled(orderType: string): boolean {
    return this.disabledOrderTypes.includes(orderType);
  }
}
