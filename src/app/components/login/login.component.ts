import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { LoginRequest } from '../../models/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  successMessage: string | null = null;
  returnUrl: string = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to role-based dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  get f() {
    return this.loginForm.controls;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle login form submission
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const loginRequest: LoginRequest = {
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    this.loginService.login(loginRequest).subscribe({
      next: (user) => {
        this.loading = false;

        // Show success message
        this.successMessage = `Welcome back, ${user.displayName}!`;
        this.error = null;

        // Determine redirect URL based on user role
        const roleDashboards: { [key: string]: string } = {
          'Admin': '/admin-dashboard',
          'Executive': '/executive-dashboard',
          'Logistics': '/logistics-dashboard',
          'Planner': '/planner-dashboard',
          'Procurement': '/procurement-dashboard',
          'Warehouse': '/warehouse-dashboard'
        };

        const redirectUrl = this.returnUrl || roleDashboards[user.role] || '/admin-dashboard';

        // Redirect immediately for faster sign-in UX
        this.router.navigate([redirectUrl], { replaceUrl: true });
      },
      error: (error) => {
        this.loading = false;
        this.successMessage = null;
        
        // Extract meaningful error message from response
        let errorMessage = 'Login failed. Please check your credentials and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Normalize inactive/disabled account responses to a user-friendly message
        const normalized = String(errorMessage).toLowerCase();
        if (
          normalized.includes('inactive') ||
          normalized.includes('disabled') ||
          normalized.includes('deactivated') ||
          normalized.includes('not active')
        ) {
          errorMessage = 'Your account is inactive. Please contact the administrator.';
        }
        
        this.error = errorMessage;
        console.error('Login error:', error);
      }
    });
  }
}
