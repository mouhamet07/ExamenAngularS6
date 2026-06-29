import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, ValidationErrors, AbstractControl, Validator } from '@angular/forms';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  maxDigits: number;
  formatGroups: number[];
}

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
})
export class PhoneInputComponent implements ControlValueAccessor, Validator {
  @Input() disabled = false;

  readonly countries: Country[] = [
    {
      code: 'SN',
      name: 'Sénégal',
      dialCode: '+221',
      flag: 'https://flagcdn.com/w20/sn.png',
      placeholder: '77 123 45 67',
      maxDigits: 9,
      formatGroups: [2, 3, 2, 2],
    },
    {
      code: 'FR',
      name: 'France',
      dialCode: '+33',
      flag: 'https://flagcdn.com/w20/fr.png',
      placeholder: '06 12 34 56 78',
      maxDigits: 10,
      formatGroups: [2, 2, 2, 2, 2],
    },
  ];

  selectedCountry: Country = this.countries[0];
  rawNumber = '';
  search = '';
  open = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  toggleDropdown(): void {
    this.open = !this.open;
  }

  selectCountry(country: Country): void {
    const digits = this.rawNumber.replace(/\D/g, '').slice(0, country.maxDigits);
    this.selectedCountry = country;
    this.rawNumber = this.formatWithGroups(digits, country.formatGroups);
    this.search = '';
    this.open = false;
    this.emitValue();
  }

  handleInput(event: Event): void {
    if (this.disabled) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.selectedCountry.maxDigits);
    this.rawNumber = this.formatWithGroups(digits, this.selectedCountry.formatGroups);
    this.emitValue();
  }

  writeValue(value: string): void {
    this.hydrateFromValue(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    const match = [...this.countries]
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((country) => trimmed.startsWith(country.dialCode));

    if (!match) {
      return { phoneInvalid: true };
    }

    const digits = trimmed.slice(match.dialCode.length).replace(/\D/g, '');
    if (digits.length !== match.maxDigits) {
      return { phoneInvalid: true };
    }

    return null;
  }

  private emitValue(): void {
    this.onTouched();
    this.onChange(
      `${this.selectedCountry.dialCode}${this.rawNumber ? ' ' + this.rawNumber : ''}`.trim(),
    );
  }

  private hydrateFromValue(value?: string): void {
    if (!value) {
      this.rawNumber = '';
      return;
    }

    const trimmed = value.trim();
    const match = [...this.countries]
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((country) => trimmed.startsWith(country.dialCode));

    if (match) {
      this.selectedCountry = match;
      const digits = trimmed.slice(match.dialCode.length).replace(/\D/g, '').slice(0, match.maxDigits);
      this.rawNumber = this.formatWithGroups(digits, match.formatGroups);
      return;
    }

    const digits = trimmed.replace(/\D/g, '').slice(0, this.selectedCountry.maxDigits);
    this.rawNumber = this.formatWithGroups(digits, this.selectedCountry.formatGroups);
  }

  private formatWithGroups(digits: string, groups: number[]): string {
    let result = '';
    let pos = 0;

    for (let i = 0; i < groups.length; i += 1) {
      const chunk = digits.slice(pos, pos + groups[i]);
      if (!chunk) {
        break;
      }
      result += (i > 0 ? ' ' : '') + chunk;
      pos += groups[i];
    }

    return result;
  }

  get filteredCountries(): Country[] {
    if (!this.search) {
      return this.countries;
    }

    const query = this.search.toLowerCase();
    return this.countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) || country.dialCode.includes(query),
    );
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}
}
