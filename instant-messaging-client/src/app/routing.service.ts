import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class RoutingService {

  constructor(private router: Router) { }

  goChat() {
    this.router.navigate(['/chat']);
  }

  goError() {
    this.router.navigate(['/error']);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

}
