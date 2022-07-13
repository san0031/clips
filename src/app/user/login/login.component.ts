import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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

  constructor(private auth: AngularFireAuth) {}
  inSubmission = false;
  ngOnInit(): void {}

  async login() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Login in Progress.';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (e) {
      this.alertMsg = 'Unexpected error occurred. Please try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      console.log(e);
      return;
    }
    this.alertMsg = 'Login successful';
    this.alertColor = 'green';
  }
}
