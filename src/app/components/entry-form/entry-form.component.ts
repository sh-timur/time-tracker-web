import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../models/category.model';

export interface EntryFormValue {
  title: string;
  categoryId: string;
  date: string;
  minutes: number;
  notes?: string;
}

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.scss'
})
export class EntryFormComponent {
  @Input({ required: true }) categories: Category[] = [];
  @Output() save = new EventEmitter<EntryFormValue>();
  @Output() cancel = new EventEmitter<void>();

  constructor(private readonly fb: FormBuilder) {}

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    categoryId: ['', [Validators.required]],
    date: [new Date().toISOString().slice(0, 10), [Validators.required]],
    minutes: [30, [Validators.required, Validators.min(1), Validators.max(1440), Validators.pattern(/^\d+$/)]],
    notes: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, categoryId, date, minutes, notes } = this.form.getRawValue();
    
    this.save.emit({
      title: title.trim(),
      categoryId,
      date,
      minutes: Number(minutes),
      notes: notes.trim() || undefined
    });

    this.form.patchValue({
      title: '',
      minutes: 30,
      notes: ''
    });
  }
}
