import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResolutionActionDTO, ExceptionEventDTO, ActionStatus, ResolutionActionUpsertDTO, AppUserDTO } from '../../../models';
import { ExceptionEventService } from '../../../services/exception-event.service';
import { ResolutionActionService } from '../../../services/resolution-action.service';
import { ToastService } from '../../../services/toast.service';


@Component({
  selector: 'app-planner-manage-resolution-actions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './planner-manage-resolution-actions.component.html',
  styleUrls: ['./planner-manage-resolution-actions.component.scss']
})
export class PlannerManageResolutionActionsComponent implements OnInit {
  actions: ResolutionActionDTO[] = [];
  exceptions: ExceptionEventDTO[] = [];
  allUsers: AppUserDTO[] = [];
  filteredUsers: AppUserDTO[] = [];
  isLoading = false;
  filterForm: FormGroup;
  editForm: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  actionStatuses = Object.values(ActionStatus);
  createActionStatuses: ActionStatus[] = [ActionStatus.InProgress, ActionStatus.Closed];
  editActionStatuses: ActionStatus[] = [ActionStatus.Closed];

  constructor(
    private fb: FormBuilder,
    private actionService: ResolutionActionService,
    private exceptionService: ExceptionEventService,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      status: ['']
    });

    this.editForm = this.fb.group({
      exceptionId: [null, Validators.required],
      ownerUserId: [null, Validators.required],
      actionDescription: ['', Validators.required],
      dueDate: [''],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadExceptions();
    this.loadActions();
  }

  loadUsers(): void {
    this.actionService.getAssignableUsers().subscribe({
      next: (users) => {
        this.allUsers = users || [];
        this.filteredUsers = [...this.allUsers];
      },
      error: () => {
        this.allUsers = [];
        this.filteredUsers = [];
      }
    });
  }

  private buildUsersFromActions(actions: ResolutionActionDTO[]): AppUserDTO[] {
    const map = new Map<number, AppUserDTO>();
    for (const action of actions) {
      if (!map.has(action.ownerUserId)) {
        map.set(action.ownerUserId, {
          userId: action.ownerUserId,
          displayName: action.ownerUserName || `User #${action.ownerUserId}`,
          roleName: 'User'
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.displayName || '').localeCompare(b.displayName || '')
    );
  }

  loadExceptions(): void {
    this.exceptionService.getAllExceptionEvents().subscribe({
      next: (exceptions) => {
        this.exceptions = exceptions;
      },
      error: (error) => {
        console.error('Error loading exception events:', error);
      }
    });
  }

  loadActions(): void {
    this.isLoading = true;
    this.actionService.getAllResolutionActions().subscribe({
      next: (actions) => {
        this.actions = actions;
        if (!this.allUsers || this.allUsers.length === 0) {
          this.allUsers = this.buildUsersFromActions(actions);
          this.filteredUsers = [...this.allUsers];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading resolution actions:', error);
        this.toastService.error('Unable to load resolution actions.');
        this.allUsers = [];
        this.filteredUsers = [];
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const { status } = this.filterForm.value;
    if (!status) {
      this.loadActions();
      return;
    }

    this.isLoading = true;
    this.actionService.filterResolutionActions(status).subscribe({
      next: (actions) => {
        this.actions = actions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error filtering resolution actions:', error);
        this.toastService.error('Unable to filter resolution actions.');
        this.isLoading = false;
      }
    });
  }

  openCreate(): void {
    this.resetForm();
    this.showForm = true;
    this.isEditing = false;
    this.editingId = null;
    this.editForm.patchValue({ status: ActionStatus.InProgress });
    this.successMessage = '';
    this.errorMessage = '';
    this.updateFilteredUsers(null);
  }

  updateFilteredUsers(exceptionId: number | null): void {
    if (!exceptionId) {
      this.filteredUsers = [...this.allUsers];
      return;
    }

    const selectedException = this.exceptions.find(ex => ex.exceptionId === exceptionId);
    if (!selectedException) {
      this.filteredUsers = [...this.allUsers];
      return;
    }

    const expectedRole = this.getExpectedRoleByExceptionType(selectedException.type);
    if (!expectedRole) {
      this.filteredUsers = [...this.allUsers];
      return;
    }

    this.filteredUsers = this.allUsers.filter(user => 
      user.roleName?.toLowerCase() === expectedRole
    );

    if (this.filteredUsers.length === 0) {
      this.filteredUsers = [...this.allUsers];
    }
  }

  openEdit(action: ResolutionActionDTO): void {
    this.showForm = true;
    this.isEditing = true;
    this.editingId = action.actionId;
    this.updateFilteredUsers(action.exceptionId);
    this.editForm.patchValue({
      exceptionId: action.exceptionId,
      ownerUserId: action.ownerUserId,
      actionDescription: action.actionDescription,
      dueDate: action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : '',
      status: ActionStatus.Closed
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
      exceptionId: null,
      ownerUserId: null,
      actionDescription: '',
      dueDate: '',
      status: ActionStatus.InProgress
    });
  }

  save(): void {
    if (this.editForm.invalid) {
      this.toastService.error('Please fill in all required fields.');
      return;
    }

    const dto: ResolutionActionUpsertDTO = {
      exceptionId: this.editForm.value.exceptionId,
      ownerUserId: this.editForm.value.ownerUserId,
      actionDescription: this.editForm.value.actionDescription,
      dueDate: this.editForm.value.dueDate || undefined,
      status: this.isEditing ? ActionStatus.Closed : this.editForm.value.status
    };

    if (this.isEditing && this.editingId) {
      this.actionService.updateResolutionAction(this.editingId, dto).subscribe({
        next: () => {
          this.toastService.success('Resolution action updated successfully.');
          this.loadActions();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error updating resolution action:', error);
          this.toastService.error('Failed to update resolution action.');
        }
      });
    } else {
      this.actionService.createResolutionAction(dto).subscribe({
        next: () => {
          this.toastService.success('Resolution action created successfully.');
          this.loadActions();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error creating resolution action:', error);
          this.toastService.error('Failed to create resolution action.');
        }
      });
    }
  }

  private getExpectedRoleByExceptionType(exceptionType: string | null | undefined): string {
    const type = (exceptionType || '').toLowerCase();
    if (type === 'delay') return 'logistics';
    if (type === 'capacity' || type === 'shortage') return 'warehouse';
    return '';
  }

  /**
   * Get the expected role for a given exception type
   */
  getExpectedRoleForException(exceptionId: number | null): string {
    if (!exceptionId) return '';
    const exception = this.exceptions.find(ex => ex.exceptionId === exceptionId);
    if (!exception) return '';

    const expectedRole = this.getExpectedRoleByExceptionType(exception.type);
    if (!expectedRole) return 'users';
    return expectedRole === 'logistics' ? 'Logistics' : 'Warehouse';
  }
}
