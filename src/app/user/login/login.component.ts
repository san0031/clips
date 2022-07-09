import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
  };

  showAlert = false;
  alertMsg = 'Please wait! Login in Progress.';
  alertColor = 'blue';

  constructor() {}

  ngOnInit(): void {}

  register() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Login in Progress.';
    this.alertColor = 'blue';

    //console.log('login  called ;Form submitted');
  }
}
