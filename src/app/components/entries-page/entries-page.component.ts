import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category.model';
import { TimeEntry } from '../../models/time-entry.model';
import { IdService } from '../../services/id.service';
import { StorageService } from '../../services/storage.service';
import { EntryFormComponent, EntryFormValue } from '../entry-form/entry-form.component';
import { CategoriesPanelComponent } from '../categories-panel/categories-panel.component';

type DatePreset = 'today' | 'week' | 'all';

@Component({
  selector: 'app-entries-page',
  standalone: true,
  imports: [CommonModule, FormsModule, EntryFormComponent, CategoriesPanelComponent],
  templateUrl: './entries-page.component.html',
  styleUrl: './entries-page.component.scss'
})
export class EntriesPageComponent implements OnInit {
  categories: Category[] = [];
  entries: TimeEntry[] = [];
  showEntryForm = false;

  datePreset: DatePreset = 'today';
  categoryFilter = 'all';

  constructor(
    private readonly storage: StorageService,
    private readonly idService: IdService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.categories = this.storage.getCategories();
    this.entries = this.storage.getEntries().sort((a, b) => b.date.localeCompare(a.date));
  }

  get filteredEntries(): TimeEntry[] {
    return this.entries.filter((entry) => {
      if (!this.matchesDate(entry.date)) {
        return false;
      }

      if (this.categoryFilter === 'all') {
        return true;
      }

      return entry.categoryId === this.categoryFilter;
    });
  }

  get totalMinutes(): number {
    return this.filteredEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  }

  get usedCategoryIds(): Set<string> {
    return new Set(this.entries.map((entry) => entry.categoryId));
  }

  formatMinutes(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}h ${m}m`;
  }

  getCategory(categoryId: string): Category | undefined {
    return this.categories.find((category) => category.id === categoryId);
  }

  addEntry(value: EntryFormValue): void {
    if (!this.categories.some((category) => category.id === value.categoryId)) {
      return;
    }

    const entry: TimeEntry = {
      id: this.idService.uuid(),
      createdAt: new Date().toISOString(),
      ...value
    };

    this.storage.setEntries([entry, ...this.entries]);
    this.load();
    this.showEntryForm = false;
  }

  addCategory(value: { name: string; color: string }): void {
    const category: Category = {
      id: this.idService.uuid(),
      name: value.name,
      color: value.color,
      createdAt: new Date().toISOString()
    };
    this.storage.setCategories([...this.categories, category]);
    this.load();
  }

  deleteCategory(id: string): void {
    this.storage.setCategories(this.categories.filter((category) => category.id !== id));
    if (this.categoryFilter === id) {
      this.categoryFilter = 'all';
    }
    this.load();
  }

  private matchesDate(entryDate: string): boolean {
    if (this.datePreset === 'all') {
      return true;
    }

    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);

    if (this.datePreset === 'today') {
      return entryDate === todayIso;
    }

    const day = today.getDay();
    const offsetToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + offsetToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return entryDate >= monday.toISOString().slice(0, 10) && entryDate <= sunday.toISOString().slice(0, 10);
  }
}
