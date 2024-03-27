import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AudioService {
  private audio: HTMLAudioElement = new Audio();
  private audioPath: string;

  constructor() {
    this.audioPath = "../../assets/audio/";
  }

  playSound(sound: string): void {
    this.audio.src = `${this.audioPath}${sound}`;
    this.audio.load();
    this.audio.play();
    console.log("yow");
  }
}
