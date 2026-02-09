import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
  form = this.fb.nonNullable.group({ firstName: '', lastName: '', email: '', password: '' });
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    const data = this.form.getRawValue();
    this.auth.register(data).subscribe(
      () => this.router.navigate(['/users/login']),
      () => (this.error = 'Unable to register')
    );
  }
}
