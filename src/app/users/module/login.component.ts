import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({ email: '', password: '' });
  
  error = '';
  returnUrl = '/';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const q = this.route.snapshot.queryParams['returnUrl'];
    if (q) this.returnUrl = q;
  }

  submit() {
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe(u => {
      if (u) {
        this.router.navigateByUrl(this.returnUrl);
      } else {
        this.error = 'Invalid email or password';
      }
    });
  }
}
