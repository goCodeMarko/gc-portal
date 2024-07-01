import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from "@angular/core";

@Directive({
  selector: "[imageHandler]",
})
export class ImageHandlerDirective implements OnInit {
  @Input("loaderImage") loaderImage!: string;
  public img!: string;
  constructor(private element: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    console.log("ngOnInit - loaderImage:", this.loaderImage);
    console.log("ngOnInit - element src:", this.element.nativeElement.src);
    this.img = this.element.nativeElement.src;
    // Check if image is loaded, otherwise set default image
    this.setDefaultImage();
  }

  @HostListener("error", ["$event"])
  onError(event: Event) {
    console.error("Image load error:", event);

    console.log("--------On Error");
    // this.setDefaultImage();
  }

  @HostListener("load")
  onLoad() {
    console.log("--------On Load");
    console.log(123232, this.element.nativeElement);
    if (this.element.nativeElement.src !== this.img) {
      this.renderer.removeClass(this.element.nativeElement, "gs-image-loader");
    }
  }

  private setDefaultImage() {
    if (
      !this.element.nativeElement.complete ||
      this.element.nativeElement.naturalHeight === 0
    ) {
      this.renderer.addClass(this.element.nativeElement, "gs-image-loader");
      this.element.nativeElement.src = this.loaderImage;
    }
  }
}
