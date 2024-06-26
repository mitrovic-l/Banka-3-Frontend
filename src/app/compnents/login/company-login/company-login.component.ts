import { Component } from '@angular/core';
import {UserService} from "../../../services/user.service";
import {UserActivationDto} from "../../../models/models";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-company-login',
  templateUrl: './company-login.component.html',
  styleUrls: ['./company-login.component.css']
})
export class CompanyLoginComponent {
  codeActivate: boolean = false;
  showCheckAddress: boolean = true;
  userActivationDto = {} as UserActivationDto
  address: string = '';
  isSubmitting: boolean = false;

  checkEmailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  })

  loginForm = new FormGroup({
    password: new FormControl('', Validators.required)
  })

  passwordForm = new FormGroup({
    activationCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
    password: new FormControl('',[Validators.required,Validators.minLength(8),Validators.maxLength(32),Validators.pattern(/^(?=.*\d.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/)]),
    confirmPassword: new FormControl('', Validators.required)
  })

  constructor(private userService: UserService, private router: Router, private snackBar: MatSnackBar) {
  }

  //  Proverava da li postoji korisnik sa datim mejlom
  checkAddr() {
    // this.showCheckAddress = false;
    this.userService.checkEmailCompany(this.emailCheck?.value)
      .subscribe(response => {
        this.userActivationDto = response;
        this.codeActivate = this.userActivationDto.codeActive
        this.address = this.userActivationDto.email
        this.showCheckAddress = false;
      }, error => {
        console.error('Error occurred:', error);
      });
  }


  createPassword() {
    if (this.newPassword?.value !== this.confirmPassword?.value) {
      console.error('Passwords do not match');
      return;
    }

    this.userService.setPasswordCompany(this.address, Number(this.activationCode?.value), this.newPassword?.value)
      .subscribe(response => {
        this.codeActivate = true;
        this.showCheckAddress = false;
        console.log(response)
      }, error => {
        console.error('Error occurred:', error);
      });
  }

  submitLogin() {
    if(this.isSubmitting) {
      // console.log("Jedna forma je vec u procesu slanja!")
      return;
    }

    if(this.password?.valid){
      this.isSubmitting = true;
      let email = this.address
      let password = this.loginForm.get("password")?.value
      console.log(email, password)
      this.userService.loginCompany(email, password).subscribe(
        res => {
          sessionStorage.setItem("token", res.token);
          const token = JSON.parse(atob(res.token.split('.')[1]))
          this.router.navigate(['company-home'])
            .then(()=> {
              window.location.reload()
            })
        },
        error => {
          this.openErrorSnackBar('Pogrešan email ili lozinka.');
          this.isSubmitting = false
        },
        () => {
          setTimeout( ()=> {
            this.isSubmitting = false;
          }, 3000);
        }
      )
    }
  }

  openErrorSnackBar(message: string) {
    this.snackBar.open(message, 'Zatvori', {
      duration: 3000,
    });
  }


  get email() {
    return this.loginForm.get('email');
  }
  get emailCheck(){
    return this.checkEmailForm.get('email')
  }

  get password() {
    return this.loginForm.get('password');
  }
  get activationCode() {
    return this.passwordForm.get('activationCode');
  }
  get newPassword() {
    return this.passwordForm.get('password');
  }
  get confirmPassword() {
    return this.passwordForm.get('confirmPassword')
  }



}
