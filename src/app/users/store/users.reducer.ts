import { createReducer, on } from '@ngrx/store';
import * as UsersActions from './users.actions';
import { initialState } from './users.state';

export const usersReducer = createReducer(
  initialState,
  on(UsersActions.loadUsers, state => ({
    ...state,
    loading: true
  })),
  on(UsersActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false
  })),
  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);
