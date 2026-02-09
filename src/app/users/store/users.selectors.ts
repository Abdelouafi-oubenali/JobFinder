import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState, USERS_FEATURE_KEY } from './users.state';

export const selectUsersState =
  createFeatureSelector<UsersState>(USERS_FEATURE_KEY);

export const selectAllUsers = createSelector(
  selectUsersState,
  state => state.users
);

export const selectUsersLoading = createSelector(
  selectUsersState,
  state => state.loading
);
