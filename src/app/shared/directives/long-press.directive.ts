import { Directive, Output, EventEmitter, HostListener } from "@angular/core";

@Directive({
  selector: "[longPress]",
})
export class LongPressDirective {
  // Duration for long press in milliseconds
  private readonly duration = 500;

  // Event emitter for long press
  @Output() longPress = new EventEmitter<void>();

  // Variables to track the timer
  private pressing!: boolean;
  private longPressing!: boolean;
  private timeout!: any;

  constructor() {}

  // Listen for mouse and touch events
  @HostListener("mousedown", ["$event"])
  @HostListener("touchstart", ["$event"])
  onMouseDown(event: MouseEvent | TouchEvent) {
    this.pressing = true;
    this.longPressing = false;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.pressing) {
        this.longPressing = true;
        this.longPress.emit();
      }
    }, this.duration);
  }

  // Listen for mouse and touch events
  @HostListener("mouseup")
  @HostListener("mouseleave")
  @HostListener("touchend")
  onMouseUp(event: MouseEvent | TouchEvent) {
    if (this.longPressing) {
      event.preventDefault();
    }
    this.pressing = false;
    clearTimeout(this.timeout);
  }
}
