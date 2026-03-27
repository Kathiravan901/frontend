import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExceptionEventDTO, ExceptionType, ExceptionSeverity, ActionStatus, ExceptionEventUpsertDTO } from '../../../models';
import { ExceptionEventService } from '../../../services/exception-event.service';
import { ToastService } from '../../../services/toast.service';


@Component({
  selector: 'app-planner-manage-exception-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './planner-manage-exception-events.component.html',
  styleUrls: ['./planner-manage-exception-events.component.scss']
})
export class PlannerManageExceptionEventsComponent implements OnInit {
  events: ExceptionEventDTO[] = [];
  isLoading = false;
  filterForm: FormGroup;
  editForm: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  exceptionTypes = Object.values(ExceptionType);
  exceptionSeverities = Object.values(ExceptionSeverity);
  actionStatuses = Object.values(ActionStatus);
  createActionStatuses: ActionStatus[] = [ActionStatus.Open, ActionStatus.InProgress];
  editActionStatuses: ActionStatus[] = [ActionStatus.Open, ActionStatus.InProgress];
  referenceTypeOptions = [
    { label: 'Order', value: 'Order' },
    { label: 'Shipment', value: 'Shipment' },
    { label: 'Inventory', value: 'InventoryPosition' }
  ];

  constructor(
    private fb: FormBuilder,
    private exceptionService: ExceptionEventService,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      type: [''],
      severity: [''],
      referenceType: [''],
      status: ['']
    });

    this.editForm = this.fb.group({
      type: ['', Validators.required],
      referenceType: ['', Validators.required],
      referenceId: [null],
      detectedDate: [new Date().toISOString().split('T')[0], Validators.required],
      severity: ['', Validators.required],
      status: [ActionStatus.Open, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.exceptionService.getAllExceptionEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exception events:', error);
        this.toastService.error('Unable to load exception events.');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const { type, severity, referenceType, status } = this.filterForm.value;
    if (!type && !severity && !referenceType && !status) {
      this.loadEvents();
      return;
    }

    this.isLoading = true;
    this.exceptionService.filterExceptionEvents(type, severity, status).subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error filtering exception events:', error);
        this.toastService.error('Unable to filter exception events.');
        this.isLoading = false;
      }
    });
  }

  openCreate(): void {
    this.resetForm();
    this.showForm = true;
    this.isEditing = false;
    this.editingId = null;
    this.editForm.patchValue({ status: ActionStatus.Open, referenceId: null });
    this.successMessage = '';
    this.errorMessage = '';
  }

  openEdit(event: ExceptionEventDTO): void {
    this.showForm = true;
    this.isEditing = true;
    this.editingId = event.exceptionId;
    this.editForm.patchValue({
      type: event.type,
      referenceType: event.referenceType,
      referenceId: event.referenceId,
      detectedDate: new Date(event.detectedDate).toISOString().split('T')[0],
      severity: event.severity,
      status: event.status
    });
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.editForm.reset({
      type: '',
      referenceType: '',
      referenceId: null,
      detectedDate: new Date().toISOString().split('T')[0],
      severity: '',
      status: ActionStatus.Open
    });
  }

  save(): void {
    if (this.editForm.invalid) {
      this.toastService.error('Please fill in all required fields.');
      return;
    }

    const dto: ExceptionEventUpsertDTO = {
      type: this.editForm.value.type,
      referenceType: this.normalizeReferenceType(this.editForm.value.referenceType),
      referenceId: this.isEditing ? (this.editForm.value.referenceId ?? 0) : 0,
      detectedDate: new Date(this.editForm.value.detectedDate),
      severity: this.editForm.value.severity,
      status: this.isEditing ? this.editForm.value.status : ActionStatus.Open
    };

    if (this.isEditing && this.editingId) {
      this.exceptionService.updateExceptionEvent(this.editingId, dto).subscribe({
        next: () => {
          this.toastService.success('Exception event updated successfully.');
          this.loadEvents();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error updating exception event:', error);
          this.toastService.error('Failed to update exception event.');
        }
      });
    } else {
      this.exceptionService.createExceptionEvent(dto).subscribe({
        next: () => {
          this.toastService.success('Exception event created successfully.');
          this.loadEvents();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error creating exception event:', error);
          this.toastService.error('Failed to create exception event.');
        }
      });
    }
  }

  deleteEvent(id: number): void {
    if (!confirm('Delete this exception event?')) {
      return;
    }

    this.exceptionService.deleteExceptionEvent(id).subscribe({
      next: () => {
        this.toastService.success('Exception event deleted.');
        this.loadEvents();
      },
      error: (error) => {
        console.error('Error deleting exception event:', error);
        this.toastService.error('Failed to delete exception event.');
      }
    });
  }

  getStatusClass(status: string): string {
    const normalized = (status || '').toLowerCase().replace(/\s+/g, '');

    if (normalized === 'open') {
      return 'bg-danger';
    }

    if (normalized === 'inprogress') {
      return 'bg-warning text-dark';
    }

    if (normalized === 'closed' || normalized === 'resolved') {
      return 'bg-success';
    }

    return 'bg-secondary';
  }

  private normalizeReferenceType(value: string): string {
    const normalized = (value || '').trim().toLowerCase().replace(/\s+/g, '');

    if (normalized === 'inventory' || normalized === 'inventoryposition') {
      return 'InventoryPosition';
    }

    if (normalized === 'shipment') {
      return 'Shipment';
    }

    return 'Order';
  }
}
