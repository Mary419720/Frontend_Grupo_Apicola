import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';

// Custom validator to check that two fields match
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  // Return null if controls haven't been initialized yet, or if they are and values match.
  if (!password || !confirmPassword || password.value === confirmPassword.value) {
    return null;
  }
  // Return a validation error if they don't match.
  return { passwordMismatch: true };
};

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  userForm!: FormGroup;
  submissionError = false;
  errorMessage = '';
  successMessage = '';
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      rol: ['', Validators.required]
    }, { 
      validators: passwordMatchValidator 
    });
  }

  get name() { return this.userForm.get('name'); }
  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
  get confirmPassword() { return this.userForm.get('confirmPassword'); }
  get rol() { return this.userForm.get('rol'); }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onSubmit(): void {
    this.submissionError = false;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    // Exclude confirmPassword from the data sent to the backend
    const { confirmPassword, ...userData } = this.userForm.value;

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.successMessage = '¡Usuario creado exitosamente!';
        this.userForm.reset();
        this.userForm.get('rol')?.setValue(''); // Ensure placeholder is shown
      },
      error: (err) => {
        this.submissionError = true;
        this.errorMessage = err.error?.message || 'Ocurrió un error al crear el usuario.';
      }
    });
  }
}
