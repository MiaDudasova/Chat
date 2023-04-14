import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { User } from '../user';
import { Message } from '../message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  clickCount: number = 0;
  charCount: number = 0;
  chatsCount: number = 0;
  prevInputValue: string = '';
  users: User[] = [];
  userClicked: boolean = false;
  userId: number = 5;
  userDetails: any = {};
  genderData: any = {};
  zipData: any = {};
  showMoreData: boolean = false;
  detailShow: boolean = true;
  chatName: string = '';
  showChat: boolean = false;
  allChats: Message[] = [];
  tempChats: Message[] = [];
  message: string = '';
  responseMessage: string = '';
  lenJsonText: number = 0;
  lastOriginNum: number = 0;
  postTime: string = '';
  responseTime: string = '';
  text: string = '';
  loggedFirstName: string | null = localStorage.getItem('firstName');
  loggedLastName: string | null = localStorage.getItem('lastName');
  loggedTime: string | null = localStorage.getItem('loginTime');
  splittedLoggedTime: string[] = [];

  constructor(private httpClient: HttpClient, private router: Router) {
    this.getUsers().subscribe((users) => {
      this.users = users.filter(
        (user) =>
          user.firstName !== this.loggedFirstName &&
          user.lastName !== this.loggedLastName
      );
    });

    this.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    if (localStorage.getItem('log') != 't') {
      this.router.navigate(['./login']);
    }

    if (this.loggedTime !== null) {
      this.splittedLoggedTime = this.loggedTime.split(' ');
      console.log(this.splittedLoggedTime);
      this.loggedTime =
        this.splittedLoggedTime[2] +
        ' ' +
        this.splittedLoggedTime[1] +
        ' ' +
        this.splittedLoggedTime[3] +
        ' ' +
        this.splittedLoggedTime[4];
    }

    this.userIdChanges().subscribe((userId) => {
      this.userId = userId;
      this.getUserDetails().subscribe((userDetails) => {
        this.userDetails = userDetails;
      });
    });
  }

  closeDetail() {
    this.detailShow = false;
  }

  closeChat() {
    this.tempChats = [];
    this.showChat = false;
  }

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

  async chatsOpened(): Promise<void> {
    this.chatsCount++;
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
      .get(
        'https://api.zippopotam.us/us/' +
          this.userDetails.company.address.postalCode
      )
      .subscribe((zipData: any) => {
        this.zipData = zipData;
      });

    this.httpClient
      .get('https://api.genderize.io/?name=' + this.userDetails.firstName)
      .subscribe((genderData: any) => {
        this.genderData = genderData;
      });

    this.showMoreData = true;
  }

  postMessage(bodyText: string) {
    const url = 'http://httpbin.org/post';
    return this.httpClient.post<any>(url, { text: bodyText });
  }

  post(bodyText: string) {
    this.postMessage(bodyText).subscribe((response) => {
      console.log(response);
      this.message = response.json.text;
      this.lenJsonText = response.json.text.length;
      this.lastOriginNum = Number(response.origin.slice(-1));
      this.responseMessage = 'A'.repeat(this.lenJsonText + this.lastOriginNum);
      const responseDate = new Date();
      this.responseTime =
        responseDate.getHours() +
        ':' +
        responseDate.getMinutes() +
        ':' +
        responseDate.getSeconds();

      this.allChats.push({
        text: this.message,
        time: this.postTime,
        receiver: this.chatName,
        response: this.responseMessage,
        responseTime: this.responseTime,
      });

      this.tempChats.push({
        text: this.message,
        time: this.postTime,
        receiver: this.chatName,
        response: this.responseMessage,
        responseTime: this.responseTime,
      });
    });
  }

  handleSubmit(e: any) {
    e.preventDefault();
    if (this.text !== '' && this.text !== ' ') {
      const time = new Date();
      this.postTime =
        time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
      this.post(this.text);
      this.text = '';
    }
  }

  handleKeyUp(e: any) {
    if (e.keyCode === 13) {
      this.handleSubmit(e);
    }
  }

  hideData() {
    this.showMoreData = false;
  }

  changeUserId(newUserId: number) {
    this.showMoreData = false;
    this.detailShow = true;
    this.userId = newUserId;
    this.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  logout(): void {
    localStorage.removeItem('log');
    this.router.navigate(['./']);
  }
}
