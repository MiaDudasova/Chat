import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject, merge } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { User } from '../user';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  clickCount: number = 0;
  charCount: number = 0;
  prevInputValue: string = '';
  users: User[] = [];
  userClicked: boolean = false;
  http: any;

  userClick() {
    if (this.userClicked == false) {
      this.userClicked = true;
    } else if (this.userClicked == true) {
      this.userClicked = false;
    }
  }

  private getUsers(): Observable<User[]> {
    return this.httpClient
      .get('https://dummyjson.com/users')
      .pipe(map((res: any) => res.users as User[]));
  }

  async onChar(event: Event): Promise<void> {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue.length > this.prevInputValue.length) {
      this.charCount++;
    }
    this.prevInputValue = inputValue;
  }

  async onClick(): Promise<void> {
    this.clickCount++;
  }

  userId: number = 5;
  userDetails: any = {};
  genderData: any = {};
  zipData: any = {};
  showMoreData: boolean = false
  check: any = ""

  constructor(private httpClient: HttpClient) {
    this.getUsers().subscribe((users) => {
      this.users = users;
    });

    this.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    this.userIdChanges().subscribe((userId) => {
      this.userId = userId;
      this.getUserDetails().subscribe((userDetails) => {
        this.userDetails = userDetails;
      });
    });
  }

  getUserDetails(): Observable<User[]> {
    return this.httpClient
      .get('https://dummyjson.com/users/' + this.userId.toString())
      .pipe(map((res: any) => res));
  }

  userIdChanges(): Observable<number> {
    const subject = new Subject<number>();

    return this.httpClient
      .get('https://dummyjson.com/users/' + this.userId.toString())
      .pipe(
        map((res: any) => res.userId),
        tap((userId) => subject.next(userId)),
        switchMap(() => subject)
      );
  }

  getData() {
    console.log('getting bonus');

    this.httpClient
      .get('https://api.zippopotam.us/us/' + this.userDetails.company.address.postalCode)
      .subscribe((zipData: any) => {
        this.zipData = zipData;
        console.log(zipData)
      });

    this.httpClient
      .get('https://api.genderize.io/?name=' + this.userDetails.firstName)
      .subscribe((genderData: any) => {
        this.genderData = genderData;
        console.log(genderData)
      });

      this.showMoreData = true
  }

  changeUserId(newUserId: number) {
    this.showMoreData = false
    this.userId = newUserId;
    this.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }
}
