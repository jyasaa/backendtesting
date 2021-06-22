import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  //inject user service object
  constructor(private us:UserService,private router:Router) { }

  ngOnInit(): void {
  }

  onLogin(userCredentials)
  {
    //console.log(userCredentials)
    this.us.LoginUser(userCredentials).subscribe(
      res=>{
        if(res.message=="Successful Login"){
          //save token to local storage
          localStorage.setItem("token",res.token)
          localStorage.setItem("username",res.username)
          localStorage.setItem("userObj",JSON.stringify (res.userObj))
          console.log(res)
          //navigate to userpofile
          this.router.navigateByUrl(`userprofile/${res.username}`)
          
        }
        else{
          alert(res.message)
        }
      },
      err=>{
        alert("Something went wrong in login")
      }
    )
  }

}
