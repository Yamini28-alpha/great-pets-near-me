import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, Navbar, RouterOutlet],
  templateUrl: './layout.html'
})
export class LayoutComponent { }