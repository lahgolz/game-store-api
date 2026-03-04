import { SetMetadata } from '@nestjs/common';

export const IS_ADMIN_KEY = 'isAdmin';

export function AdminOnly() {
  return SetMetadata(IS_ADMIN_KEY, true);
}
