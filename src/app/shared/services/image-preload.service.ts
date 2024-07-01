import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ImagePreloadService {
  // Array to store preloaded image elements and their statuses
  private images: { img: HTMLImageElement; loaded: boolean }[] = [];

  constructor() {}

  // Method to preload a list of images
  preload(images: string[]): Promise<void> {
    // Create an array of promises to track the loading status of each image
    const loadPromises = images.map((image) => this.loadImage(image));

    // Return a promise that resolves when all images are loaded
    return Promise.all(loadPromises).then(() => {
      console.log("All images have been preloaded.");
    });
  }

  // Helper method to load a single image and return a promise
  private loadImage(imageSrc: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image(); // Create a new Image object
      img.src = imageSrc; // Set the source of the image to the provided URL
      img.onload = () => {
        // When the image is loaded, set its status to true
        this.images.push({ img, loaded: true });
        resolve(); // Resolve the promise indicating the image has loaded
      };
      img.onerror = () => {
        // Handle image loading error
        this.images.push({ img, loaded: false });
        reject(new Error(`Failed to load image: ${imageSrc}`)); // Reject the promise indicating an error
      };
    });
  }

  // Method to check if all images are loaded
  areAllImagesLoaded(): boolean {
    return this.images.every((image) => image.loaded);
  }
}
