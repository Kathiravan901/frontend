import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UomCreateDto, UomResponseDto } from '../../../models';
import { UomService } from '../../../services/uom.service';
import { ToastService } from '../../../services/toast.service';


@Component({
  selector: 'app-warehouse-add-uom',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './warehouse-add-uom.component.html',
  styleUrls: ['./warehouse-add-uom.component.scss']
})
export class WarehouseAddUomComponent implements OnInit {
  uomForm: FormGroup;
  isSubmitting = false;
  isLoading = false;
  showAddForm = false;
  editingUomId: number | null = null;
  searchTerm = '';
  uoms: UomResponseDto[] = [];

  constructor(private fb: FormBuilder, private uomService: UomService, private toastService: ToastService) {
    this.uomForm = this.fb.group({
      uomCode: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit() {
    this.loadUoms();
  }

  openAddForm() {
    this.editingUomId = null;
    this.uomForm.reset({ uomCode: '' });
    this.showAddForm = true;
  }

  closeAddForm() {
    this.editingUomId = null;
    this.uomForm.reset();
    this.showAddForm = false;
  }

  loadUoms() {
    this.isLoading = true;
    this.uomService.listUoms().subscribe({
      next: (data) => {
        this.uoms = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load UOMs', error);
        this.isLoading = false;
      }
    });
  }

  getFilteredUoms(): UomResponseDto[] {
    if (!this.searchTerm) {
      return this.uoms;
    }
    const term = this.searchTerm.toLowerCase();
    return this.uoms.filter(uom =>
      uom.uomCode.toLowerCase().includes(term)
    );
  }

  onSubmit() {
    if (this.uomForm.valid) {
      this.isSubmitting = true;

      const dto: UomCreateDto = this.uomForm.value;

      if (this.editingUomId) {
        // Update UOM
        const updateDto = { uomId: this.editingUomId, ...dto } as any;
        this.uomService.updateUom(updateDto).subscribe({
          next: () => {
            this.toastService.success('UOM updated successfully!');
            this.uomForm.reset();
            this.editingUomId = null;
            this.showAddForm = false;
            this.loadUoms();
            this.isSubmitting = false;
          },
          error: () => {
            this.toastService.error('Failed to update UOM. Please try again.');
            this.isSubmitting = false;
          }
        });
      } else {
        // Create new UOM
        this.uomService.createUom(dto).subscribe({
          next: () => {
            this.toastService.success('UOM created successfully!');
            this.uomForm.reset();
            this.showAddForm = false;
            this.loadUoms();
            this.isSubmitting = false;
          },
          error: () => {
            this.toastService.error('Failed to create UOM. Please try again.');
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  editUom(uom: UomResponseDto) {
    this.editingUomId = uom.uomId;
    this.uomForm.patchValue({
      uomCode: uom.uomCode
    });
    this.showAddForm = true;
  }
}