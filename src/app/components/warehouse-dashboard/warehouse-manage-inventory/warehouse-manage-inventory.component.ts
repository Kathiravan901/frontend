import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryPositionResponseDto, ItemResponseDto, LocationResponseDto, InventoryAdjustDto } from '../../../models';
import { InventoryService } from '../../../services/inventory.service';
import { ItemService } from '../../../services/item.service';
import { LocationService } from '../../../services/location.service';
import { ToastService } from '../../../services/toast.service';


@Component({
  selector: 'app-warehouse-manage-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './warehouse-manage-inventory.component.html',
  styleUrls: ['./warehouse-manage-inventory.component.scss']
})
export class WarehouseManageInventoryComponent implements OnInit {
  inventory: InventoryPositionResponseDto[] = [];
  items: ItemResponseDto[] = [];
  locations: LocationResponseDto[] = [];
  filters: FormGroup;
  adjustForm: FormGroup;
  createForm: FormGroup;
  showAdjustForm = false;
  showCreateForm = false;
  selectedInventory: InventoryPositionResponseDto | null = null;
  isLoading = false;
  isAdjusting = false;
  isCreating = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private itemService: ItemService,
    private locationService: LocationService,
    private toastService: ToastService
  ) {
    this.filters = this.fb.group({
      locationId: [''],
      itemId: [''],
      onlyLowStock: [false],
      search: ['']
    });

    this.adjustForm = this.fb.group({
      deltaQty: [0, Validators.required],
      safetyStock: [0]
    });

    this.createForm = this.fb.group({
      locationId: ['', Validators.required],
      itemId: ['', Validators.required],
      initialQty: [0, [Validators.required, Validators.min(0)]],
      safetyStock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadItems();
    this.loadLocations();
    this.loadInventory();
  }

  loadInventory() {
    this.isLoading = true;
    const filters = this.filters.value;
    this.inventoryService.listInventory(
      filters.locationId || undefined,
      filters.itemId || undefined,
      filters.onlyLowStock,
      filters.search || undefined
    ).subscribe({
      next: (data) => {
        this.inventory = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load inventory', error);
        this.isLoading = false;
      }
    });
  }

  loadItems() {
    this.itemService.listItems().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (error) => {
        console.error('Failed to load items', error);
      }
    });
  }

  loadLocations() {
    this.locationService.listLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (error) => {
        console.error('Failed to load locations', error);
      }
    });
  }

  getItemName(itemId: number): string {
    const item = this.items.find(i => i.itemId === itemId);
    return item ? item.itemName : 'Unknown';
  }

  getLocationName(locationId: number): string {
    const location = this.locations.find(l => l.locationId === locationId);
    return location ? location.name : 'Unknown';
  }

  getItemThresholdValue(position: InventoryPositionResponseDto): number {
    if (typeof position.itemThreshold === 'number' && !Number.isNaN(position.itemThreshold)) {
      return position.itemThreshold;
    }

    const masterItem = this.items.find(i => i.itemId === position.itemId);
    return masterItem?.itemThreshold ?? 0;
  }

  getReorderLevel(position: InventoryPositionResponseDto): number {
    if (position.reorderLevel !== undefined && position.reorderLevel !== null) {
      return position.reorderLevel;
    }

    const threshold = this.getItemThresholdValue(position);
    return Math.max(position.safetyStock, threshold);
  }

  isLowStock(position: InventoryPositionResponseDto): boolean {
    return position.quantityOnHand < this.getReorderLevel(position);
  }

  getStockStatus(position: InventoryPositionResponseDto): string {
    return this.isLowStock(position) ? 'Low Stock' : 'In Stock';
  }

  onFilter() {
    this.loadInventory();
  }

  openAdjustForm(inventory: InventoryPositionResponseDto) {
    this.selectedInventory = inventory;
    this.adjustForm.patchValue({
      deltaQty: 0,
      safetyStock: inventory.safetyStock
    });
    this.showAdjustForm = true;
  }

  closeAdjustForm() {
    this.showAdjustForm = false;
    this.selectedInventory = null;
  }

  onAdjust() {
    if (this.adjustForm.valid && this.selectedInventory) {
      this.isAdjusting = true;
      const formValue = this.adjustForm.value;
      const dto: InventoryAdjustDto = {
        locationId: this.selectedInventory.locationId,
        itemId: this.selectedInventory.itemId,
        deltaQty: formValue.deltaQty,
        safetyStock: formValue.safetyStock
      };

      this.inventoryService.adjustInventory(dto).subscribe({
        next: (response) => {
          this.toastService.success('Inventory adjusted successfully!');
          this.loadInventory(); // Refresh the list
          this.closeAdjustForm();
          this.isAdjusting = false;
        },
        error: (error) => {
          this.toastService.error('Failed to adjust inventory. Please try again.');
          this.isAdjusting = false;
        }
      });
    }
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.createForm.reset({ initialQty: 0, safetyStock: 0 });
  }

  closeCreateForm() {
    this.showCreateForm = false;
  }

  onCreate() {
    if (this.createForm.valid) {
      this.isCreating = true;
      const formValue = this.createForm.value;
      const dto: InventoryAdjustDto = {
        locationId: formValue.locationId,
        itemId: formValue.itemId,
        deltaQty: formValue.initialQty,
        safetyStock: formValue.safetyStock
      };

      this.inventoryService.adjustInventory(dto).subscribe({
        next: (response) => {
          this.toastService.success('Inventory created successfully!');
          this.loadInventory();
          this.closeCreateForm();
          this.isCreating = false;
        },
        error: (error) => {
          this.toastService.error('Failed to create inventory. Please try again.');
          this.isCreating = false;
        }
      });
    }
  }
}