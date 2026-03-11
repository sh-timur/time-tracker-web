import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  importError = '';

  constructor(private readonly storage: StorageService) {}

  exportJson(): void {
    const blob = this.storage.exportAll();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openImportPicker(): void {
    this.fileInput?.nativeElement.click();
  }

  async importJson(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.importError = '';
    const text = await file.text();

    try {
      this.storage.importAll(text);
      window.location.reload();
    } catch (error) {
      this.importError = error instanceof Error ? error.message : 'Import failed.';
    } finally {
      input.value = '';
    }
  }

  clearLocalStorage() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      this.storage.clearAll();
      window.location.reload();
    }
  }
}
