import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IdService {
  uuid(): string {
    return crypto.randomUUID();
  }
}
