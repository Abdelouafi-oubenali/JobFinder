import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  // form = this.fb.nonNullable.group({ firstName: '', lastName: '', email: '', password: '' });

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required , Validators.minLength(5)]],
    lastName: ['', [Validators.required , Validators.minLength(5)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data = this.form.getRawValue();
    this.auth.register(data).subscribe(
      () => this.router.navigate(['/users/login']),
      () => (this.error = 'Unable to register')
    );
  }
}
