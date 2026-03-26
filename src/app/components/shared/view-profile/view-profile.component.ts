import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../services/authentication.service';

interface UserProfile {
  id?: string;
  userId?: number;
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
  lastLogin?: string;
  status?: string;
}

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {
  userProfile: UserProfile = {};
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    const currentUser = this.authService.currentUser;

    if (currentUser) {
      this.userProfile = {
        userId: currentUser.userId,
        email: currentUser.email,
        displayName: currentUser.displayName,
        role: currentUser.role
      };
    }
    this.isLoading = false;
  }

  getInitials(): string {
    const displayName = this.userProfile.displayName || this.userProfile.email || '';
    const parts = displayName.split(' ');
    const first = parts[0]?.charAt(0) || '';
    const last = parts[1]?.charAt(0) || '';
    return (first + last).toUpperCase();
  }
}
