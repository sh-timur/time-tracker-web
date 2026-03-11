import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories-panel.component.html',
  styleUrl: './categories-panel.component.scss'
})
export class CategoriesPanelComponent {
  @Input({ required: true }) categories: Category[] = [];
  @Input({ required: true }) usedCategoryIds = new Set<string>();

  @Output() createCategory = new EventEmitter<{ name: string; color: string }>();
  @Output() deleteCategory = new EventEmitter<string>();

  errorMessage = '';

  constructor(private readonly fb: FormBuilder) { }

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    color: ['#3366ff', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]]
  });

  addCategory(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.createCategory.emit({
      name: value.name.trim(),
      color: value.color
    });
    this.form.patchValue({ name: '' });
    this.errorMessage = '';
  }

  requestDelete(category: Category): void {
    if (this.usedCategoryIds.has(category.id)) {
      this.errorMessage = 'Cannot delete category while it is used by entries.';
      return;
    }

    this.errorMessage = '';
    this.deleteCategory.emit(category.id);
  }
}
