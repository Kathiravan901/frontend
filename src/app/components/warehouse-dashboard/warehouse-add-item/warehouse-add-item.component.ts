import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UomResponseDto, ItemCreateDto, ItemResponseDto } from '../../../models';
import { ItemService } from '../../../services/item.service';
import { UomService } from '../../../services/uom.service';

@Component({
  selector: 'app-warehouse-add-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './warehouse-add-item.component.html',
  styleUrls: ['./warehouse-add-item.component.scss']
})
export class WarehouseAddItemComponent implements OnInit {
  itemForm: FormGroup;
  uoms: UomResponseDto[] = [];
  items: ItemResponseDto[] = [];
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showAddForm = false;
  editingItemId: number | null = null;
  selectedItem: ItemResponseDto | null = null;
  searchTerm = '';
  isDeleting = false;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private uomService: UomService
  ) {
    this.itemForm = this.fb.group({
      itemName: ['', [Validators.required, Validators.maxLength(100)]],
      itemDescription: [''],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      uomId: [null],
      itemThreshold: [0, [Validators.required, Validators.min(0)]],
      category: ['']
    });
  }

  ngOnInit() {
    this.loadUoms();
    this.loadItems();
  }

  openAddForm() {
    this.successMessage = '';
    this.errorMessage = '';
    this.editingItemId = null;
    this.itemForm.reset({
      itemName: '',
      itemDescription: '',
      unitPrice: 0,
      uomId: null,
      itemThreshold: 0,
      category: ''
    });
    this.showAddForm = true;
  }

  loadUoms() {
    this.uomService.listUoms().subscribe({
      next: (data) => {
        this.uoms = data;
      },
      error: (error) => {
        console.error('Failed to load UOMs', error);
      }
    });
  }

  loadItems() {
    this.isLoading = true;
    this.itemService.listItems().subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load items', error);
        this.isLoading = false;
      }
    });
  }

  getFilteredItems(): ItemResponseDto[] {
    if (!this.searchTerm) {
      return this.items;
    }
    const term = this.searchTerm.toLowerCase();
    return this.items.filter(item =>
      item.itemName.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term)
    );
  }

  getUomCode(uomId: number | null | undefined): string {
    if (!uomId) return '-';
    const uom = this.uoms.find(u => u.uomId === uomId);
    return uom ? uom.uomCode : '-';
  }

  onSubmit() {
    if (this.itemForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      const dto: ItemCreateDto = this.itemForm.value;

      if (this.editingItemId) {
        const updateDto = { itemId: this.editingItemId, ...dto } as any;
        this.itemService.updateItem(updateDto).subscribe({
          next: () => {
            this.successMessage = 'Item updated successfully!';
            this.itemForm.reset();
            this.editingItemId = null;
            this.showAddForm = false;
            this.loadItems();
            this.isSubmitting = false;
          },
          error: () => {
            this.errorMessage = 'Failed to update item. Please try again.';
            this.isSubmitting = false;
          }
        });
      } else {
        this.itemService.createItem(dto).subscribe({
          next: () => {
            this.successMessage = 'Item created successfully!';
            this.itemForm.reset();
            this.showAddForm = false;
            this.loadItems();
            this.isSubmitting = false;
          },
          error: () => {
            this.errorMessage = 'Failed to create item. Please try again.';
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  viewItem(item: ItemResponseDto) {
    this.selectedItem = item;
  }

  editItem(item: ItemResponseDto) {
    this.editingItemId = item.itemId;
    this.itemForm.patchValue({
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      unitPrice: item.unitPrice,
      uomId: item.uomId,
      itemThreshold: item.itemThreshold,
      category: item.category
    });
    this.showAddForm = true;
    this.selectedItem = null;
  }

  deleteItem(itemId: number) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    this.isDeleting = true;
    this.itemService.deleteItem(itemId).subscribe({
      next: () => {
        this.successMessage = 'Item deleted successfully!';
        this.loadItems();
        this.isDeleting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to delete item. Please try again.';
        this.isDeleting = false;
      }
    });
  }

  closeViewModal() {
    this.selectedItem = null;
  }

  cancelEdit() {
    this.editingItemId = null;
    this.itemForm.reset();
    this.showAddForm = false;
  }

  closeAddForm() {
    this.editingItemId = null;
    this.itemForm.reset();
    this.showAddForm = false;
    this.successMessage = '';
    this.errorMessage = '';
  }
}