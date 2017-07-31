import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: Object;
  reports: [Object];
  date: Object;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
      this.authService.getProfile().subscribe( profile => {
      this.user = profile.user;
      this.reports = profile.reports;
      this.date = new Date();
    },
    err => {
      console.log("check check TOKEN:: "+this.authService.authToken);
      console.log(err);
      return false;
    });
  }

  dateFormat(date){
    var d = new Date(date);
    return d;
  }

}
