import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ManageUserService } from '../../../services/manage-user.service';
import { RouterLink, RouterOutlet } from "@angular/router";

interface UserData {
  userId: number;
  displayName: string;
  email: string;
  roleId?: number;
  roleName?: string;
  status: string;
}

@Component({
  selector: 'app-admin-manage-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './admin-manage-users.component.html',
  styleUrls: ['./admin-manage-users.component.scss']
})
export class AdminManageUsersComponent implements OnInit {
  users: UserData[] = [];
  filteredUsers: UserData[] = [];
  isLoading = false;
  showEditForm = false;
  isEditing = false;
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';

  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private manageUserService: ManageUserService
  ) {
    this.editForm = this.fb.group({
      userId: [null],
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roleId: [null],
      roleName: [''],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.manageUserService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.users = data.map(user => ({
          userId: user.userId,
          displayName: user.displayName || 'N/A',
          email: user.email || 'N/A',
          roleId: user.roleId,
          roleName: user.roleName,
          status: user.status || 'Active'
        }));
        this.filteredUsers = this.users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users from database';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(searchValue: string): void {
    this.searchQuery = searchValue.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.displayName.toLowerCase().includes(this.searchQuery) ||
      user.email.toLowerCase().includes(this.searchQuery) ||
      (user.roleName && user.roleName.toLowerCase().includes(this.searchQuery)) ||
      user.status.toLowerCase().includes(this.searchQuery)
    );
  }

  openEdit(user: UserData): void {
    this.isEditing = true;
    this.editingId = user.userId;
    this.showEditForm = true;
    this.editForm.patchValue({
      userId: user.userId,
      displayName: user.displayName,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      status: user.status
    });
  }

  closeEdit(): void {
    this.showEditForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.editForm.reset();
    this.errorMessage = '';
  }

  save(): void {
    if (this.editForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const formValue = this.editForm.value;
    
    if (this.isEditing && this.editingId) {
      // Update existing user via PATCH
      this.manageUserService.editUser(formValue).subscribe({
        next: (response) => {
          this.successMessage = 'User updated successfully!';
          setTimeout(() => {
            this.successMessage = '';
            this.loadUsers();
            this.closeEdit();
          }, 1500);
        },
        error: (error) => {
          let errorMsg = 'Failed to update user. Please try again.';
          if (error?.error?.message) {
            errorMsg = error.error.message;
          } else if (error?.error) {
            errorMsg = error.error;
          } else if (error?.message) {
            errorMsg = error.message;
          } else if (error?.statusText) {
            errorMsg = `Server error: ${error.statusText}`;
          }
          
          this.errorMessage = errorMsg;
        }
      });
    }
  }

}







