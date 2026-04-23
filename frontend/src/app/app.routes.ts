import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout';
import { Homepage } from './components/homepage/homepage';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { AuthGuard } from './guards/auth-guard';
import { PublicGuard } from './guards/public-guard';
import { ShelterDashboard } from './components/shelter-dashboard/shelter-dashboard';
import { CustomerDashboard } from './components/customer-dashboard/customer-dashboard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { 
        path: '', 
        component: Homepage,
        canActivate: [PublicGuard] 
      },
      { 
        path: 'login', 
        component: LoginComponent,
        canActivate: [PublicGuard] 
      },
      { 
        path: 'register', 
        component: RegisterComponent,
        canActivate: [PublicGuard] 
      },
      {
        path: 'dashboard/shelter',
        canActivate: [AuthGuard],
        component: ShelterDashboard
      },
      {
        path: 'dashboard/customer',
        canActivate: [AuthGuard],
        component: CustomerDashboard
      }
    ]
  }
];