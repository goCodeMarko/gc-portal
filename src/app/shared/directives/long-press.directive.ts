import { Directive, Output, EventEmitter, HostListener } from "@angular/core";

@Directive({
  selector: "[longPress]",
})
export class LongPressDirective {
  // Duration for long press in milliseconds
  private readonly duration = 1000;

  // Event emitter for long press
  @Output() longPress = new EventEmitter<void>();

  // Variables to track the timer
  private timeout: any;
  private touchStart!: number;

  constructor() {}

  // Listen for mouse and touch events
  @HostListener("mousedown", ["$event"])
  @HostListener("touchstart", ["$event"])
  onMouseDown(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.touchStart = event.timeStamp;
    this.timeout = setTimeout(() => {
      this.longPress.emit();
    }, this.duration);
  }

  // Listen for mouse and touch events
  @HostListener("mouseup")
  @HostListener("mouseleave")
  @HostListener("touchend")
  onMouseUp() {
    clearTimeout(this.timeout);
  }
}
