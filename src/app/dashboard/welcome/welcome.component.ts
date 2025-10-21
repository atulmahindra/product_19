import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
greeting: string = '';

  constructor() {
    this.setGreeting();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning!';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon!';
    } else {
      this.greeting = 'Good Evening!';
    }
  }
  ngOnInit(): void {
    
  }
}
