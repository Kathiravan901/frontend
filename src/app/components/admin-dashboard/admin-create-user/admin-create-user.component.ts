import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreateUserDTO } from '../../../models';
import { UserService } from '../../../services/user.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { ToastService } from '../../../services/toast.service';


@Component({
  selector: 'app-admin-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-create-user.component.html',
  styleUrls: ['./admin-create-user.component.scss']
})
export class AdminCreateUserComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  roleOptions: string[] = [];

  private readonly roleNameToIdMap = new Map<string, number>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthenticationService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''],
      roleName: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initializeRoleMappings();
  }

  private initializeRoleMappings(): void {
    this.roleNameToIdMap.clear();
    const normalizedRoleNames = new Map<string, string>();

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        users.forEach(user => {
          if (user.roleName && user.roleId != null) {
            const normalizedRoleName = user.roleName.trim().toLowerCase();
            this.roleNameToIdMap.set(normalizedRoleName, user.roleId);

            if (!normalizedRoleNames.has(normalizedRoleName)) {
              normalizedRoleNames.set(normalizedRoleName, user.roleName.trim());
            }
          }
        });

        this.roleOptions = Array.from(normalizedRoleNames.values()).sort((a, b) => a.localeCompare(b));

        if (this.roleOptions.length === 0) {
          this.toastService.error('No roles available to assign. Please create at least one user role in the system.');
        }
      },
      error: () => {
        this.toastService.error('Unable to load roles dynamically. Please refresh and try again.');
      }
    });
  }

  private resolveRoleId(roleName: string): number | null {
    if (!roleName) {
      return null;
    }

    const mappedRoleId = this.roleNameToIdMap.get(roleName.trim().toLowerCase());
    return mappedRoleId ?? null;
  }

  submit(): void {
    if (this.userForm.invalid) {
      this.toastService.error('Please fill in all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const selectedRoleName: string = this.userForm.value.roleName?.trim();
    const resolvedRoleId = this.resolveRoleId(selectedRoleName);
    const loggedInUserId = this.authService.getCurrentUserId();

    if (!resolvedRoleId) {
      this.toastService.error('Unable to map selected role to a valid role ID. Please select a valid role name.');
      this.isSubmitting = false;
      return;
    }

    if (!loggedInUserId) {
      this.toastService.error('Session user is missing. Please login again and try creating the user.');
      this.isSubmitting = false;
      return;
    }

    const dto: CreateUserDTO = {
      userId: loggedInUserId,
      displayName: this.userForm.value.displayName,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      phoneNumber: this.userForm.value.phoneNumber,
      roleName: selectedRoleName,
      roleId: resolvedRoleId,
      status: this.userForm.value.status
    };

    this.userService.createUser(dto).subscribe({
      next: (message) => {
        this.toastService.success(message ?? 'User created successfully.');
        this.userForm.reset({ roleName: '', status: 'Active' });
        this.isSubmitting = false;
        // Navigate to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/admin-dashboard']);
        }, 2000);
      },
      error: (error) => {
        let errorMsg = 'Failed to create user. Please check the details and try again.';
        if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.error?.title) {
          errorMsg = error.error.title;
        } else if (error?.message) {
          errorMsg = error.message;
        }
        
        this.toastService.error(errorMsg);
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['../users'], { relativeTo: this.router.routerState.root.firstChild?.firstChild });
  }
}
