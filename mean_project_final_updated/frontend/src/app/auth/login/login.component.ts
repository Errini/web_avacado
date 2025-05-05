import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms'; // Import FormsModule
import { AuthService } from '../auth.service'; // Corrected path
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add CommonModule and FormsModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage: string | null = null;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  onLogin(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = 'Por favor, preencha o email e a senha.';
      return;
    }
    this.errorMessage = null; // Clear previous errors
    this.authService.login(form.value.email, form.value.password)
      .subscribe({
        // Navigation is handled inside the authService.login method upon success
        error: (error) => {
          console.error('Login failed:', error);
          this.errorMessage = error.message; // Display error message from service
        }
      });
  }
}

