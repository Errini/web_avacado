import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // Corrected path
import { mimeType } from './mime-type.validator'; // Import custom validator

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  errorMessage: string | null = null;
  imagePreview: string | null = null; // For image preview

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      username: new FormControl(null, Validators.required),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required], // Make image optional if needed
        asyncValidators: [mimeType] // Add async validator for mime type
      })
    });
  }

  onImagePicked(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.signupForm.patchValue({ image: file });
    this.signupForm.get('image')?.updateValueAndValidity();
    // Generate image preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
        this.errorMessage = 'Por favor, preencha todos os campos corretamente e selecione uma imagem válida.';
        return;
    }
    this.errorMessage = null; // Clear previous errors

    // Use FormData because we have a file
    this.authService.signup(
      this.signupForm.value.username,
      this.signupForm.value.email,
      this.signupForm.value.password,
      this.signupForm.value.image // Pass the file object
    ).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          // TEMPORARY: Store userId and username in localStorage until JWT
          localStorage.setItem('tempUserId', response.userId);
          localStorage.setItem('tempUsername', response.username);
          this.router.navigate(['/messages']);
        },
        error: (error) => {
          console.error('Signup failed:', error);
          this.errorMessage = error.message;
        }
      });
  }
}

