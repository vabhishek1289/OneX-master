import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../services/auth.service';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  code: String;
  input: String;
  language: String;
  output: String;
  error: String;
  modes =  { 'c': 'text/x-csrc' , 'java': 'text/x-java' ,  'python': 'python'} ;
  md = 'text/x-csrc';
  user: Object;


  constructor(
    private authService: AuthService,
    private flashMessages: FlashMessagesService
  ) {

    this.code = `#include <stdio.h>
int main() {
  printf("Hello World \\n");
}`;
  }

  changeMode() {
    this.md = this.modes[''+this.language];
    //console.log(this.user);
  }

  ngOnInit() {
    this.authService.getProfile().subscribe( profile => {
      this.user = profile.user;
    });
  }
  onRunSubmit() {
    const codeFile = {
      code: this.code,
      input: this.input,
      language: this.language,
      user: this.user
    }
    console.log(this.code);
    if((codeFile.code != undefined ) && (codeFile.language != undefined )) {
      this.authService.compileCode(codeFile).subscribe( (data) => {
        if(data.success) {
          this.output = data.output;// .replace(/(?:\r\n|\r|\n)/g, '<br />');
          this.error = data.stderr;// .replace(/(?:\r\n|\r|\n)/g, '<br />');
        }
      });
    } else {
      this.flashMessages.show("Error Occur, try again", {cssClass: 'alert-danger', timeOut: 3000});
    }
  }

}
