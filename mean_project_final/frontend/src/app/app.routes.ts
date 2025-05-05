import { Routes } from '@angular/router';
import { MessagesComponent } from './messages/messages.component'; // Importado
import { SignupComponent } from './auth/signup/signup.component'; // Importado
import { LoginComponent } from './auth/login/login.component'; // Importado

export const routes: Routes = [
    { path: '', redirectTo: '/messages', pathMatch: 'full' }, // Rota padrão
    { path: 'messages', component: MessagesComponent }, // Rota para mensagens
    { path: 'signup', component: SignupComponent }, // Rota para cadastro
    { path: 'login', component: LoginComponent } // Rota para login adicionada
];
  