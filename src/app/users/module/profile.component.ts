import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UsersService, AppUser } from '../service/users.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    id: this.fb.control<number | null>(null),
    firstName: this.fb.nonNullable.control(''),
    lastName: this.fb.nonNullable.control(''),
    email: this.fb.nonNullable.control(''),
    password: this.fb.control<string | null>('')
  });
  user: AppUser | null = null;

  constructor(private auth: AuthService, private users: UsersService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.currentUser();
    if (this.user) this.form.patchValue(this.user as any);
  }

  save() {
    const value = this.form.getRawValue();
    const payload: AppUser = {
      ...value,
      id: value.id ?? undefined,
      password: value.password || undefined
    };
    this.users.update(payload).subscribe(() => {
      const safe = { ...payload } as any;
      delete safe.password;
      sessionStorage.setItem('currentUser', JSON.stringify(safe));
      this.router.navigate(['/']);
    });
  }

  deleteAccount() {
    if (!this.user || !this.user.id) return;
    this.users.delete(this.user.id).subscribe(() => {
      this.auth.logout();
    });
  }
}
