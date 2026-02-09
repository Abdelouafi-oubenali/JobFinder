import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as UsersActions from '../store/users.actions';
import { selectAllUsers } from '../store/users.selectors';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  private store = inject(Store);
  users$ = this.store.select(selectAllUsers);

  ngOnInit() {
    this.store.dispatch(UsersActions.loadUsers());
  }
}
    