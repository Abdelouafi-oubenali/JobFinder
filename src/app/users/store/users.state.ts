import { AppUser } from '../service/users.service';

export interface UsersState {
  users: AppUser[];
  loading: boolean;
  error: any;
}

export const initialState: UsersState = {
  users: [],
  loading: false,
  error: null
};

export const USERS_FEATURE_KEY = 'users';
