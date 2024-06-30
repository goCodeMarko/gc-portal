import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ImagePreloadService {
  // Array to store preloaded image elements
  private images: HTMLImageElement[] = [];

  constructor() {}

  // Method to preload a list of images
  preload(images: string[]): void {
    // Iterate over each image URL provided in the array
    for (const image of images) {
      const img = new Image(); // Create a new Image object
      img.src = image; // Set the source of the image to the provided URL
      this.images.push(img); // Push the created image object to the images array
    }
  }
}
