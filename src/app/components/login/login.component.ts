import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../user';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  users: User[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient
  ) {
    this.getUsers().subscribe((users: any) => {
      this.users = users;
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('log') == 't') {
      this.router.navigate(['./']);
    }
  }

  private getUsers(): Observable<User[]> {
    return this.httpClient
      .get('https://dummyjson.com/users')
      .pipe(map((res: any) => res.users as User[]));
  }

  login(firstName: string, lastName: string): void {
    if (
      this.users.find((data: { firstName: string; lastName: string }) => {
        return data.firstName === firstName && data.lastName === lastName;
      }) != undefined
    ) {
      localStorage.setItem('firstName', firstName);
      localStorage.setItem('lastName', lastName);
      localStorage.setItem("loginTime", new Date().toString())
      localStorage.setItem('log', 't');
      this.router.navigate(['./']);
    }
  }
}
