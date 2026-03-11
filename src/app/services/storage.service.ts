import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { TimeEntry } from '../models/time-entry.model';

interface ExportPayload {
  version: number;
  exportedAt: string;
  categories: Category[];
  entries: TimeEntry[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly categoryKey = 'tt.categories.v1';
  private readonly entryKey = 'tt.entries.v1';

  getCategories(): Category[] {
    return this.readArray<Category>(this.categoryKey);
  }

  setCategories(categories: Category[]): void {
    localStorage.setItem(this.categoryKey, JSON.stringify(categories));
  }

  getEntries(): TimeEntry[] {
    return this.readArray<TimeEntry>(this.entryKey);
  }

  setEntries(entries: TimeEntry[]): void {
    localStorage.setItem(this.entryKey, JSON.stringify(entries));
  }

  exportAll(): Blob {
    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: this.getCategories(),
      entries: this.getEntries()
    };

    return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  }

  importAll(jsonText: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('Invalid JSON file.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Import file must contain an object payload.');
    }

    const payload = parsed as Partial<ExportPayload>;

    if (payload.version !== 1) {
      throw new Error('Unsupported import version. Expected version 1.');
    }

    if (!Array.isArray(payload.categories)) {
      throw new Error('Invalid import: categories must be an array.');
    }

    if (!Array.isArray(payload.entries)) {
      throw new Error('Invalid import: entries must be an array.');
    }

    const categoryIds = new Set(payload.categories.map((category) => category.id));
    const hasBrokenReference = payload.entries.some((entry) => !categoryIds.has(entry.categoryId));
    if (hasBrokenReference) {
      throw new Error('Invalid import: one or more entries reference unknown categories.');
    }

    this.setCategories(payload.categories);
    this.setEntries(payload.entries);
  }

  clearAll(): void {
    localStorage.removeItem(this.categoryKey);
    localStorage.removeItem(this.entryKey);
  }

  private readArray<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
      return [];
    }
  }
}
