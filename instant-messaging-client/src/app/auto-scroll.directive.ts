
import { Directive, AfterViewChecked, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutoScroll]'
})
export class AutoScrollDirective implements AfterViewChecked  {

  constructor(private list: ElementRef) { }

  ngAfterViewChecked() {
      this.scrollToBottom();
  }

  scrollToBottom(): void {
      this.list.nativeElement.scrollTop =
          this.list.nativeElement.scrollHeight;
  }
}
