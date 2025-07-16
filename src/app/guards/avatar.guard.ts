import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const avatarGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  const hasPendingUser = userService.getPendingRegistrationId() !== null;
  
  if (!hasPendingUser) {
    router.navigate(['/signup']);
    return false;
  }
  
  return true;
};
