import { TestBed } from '@angular/core/testing';

import { ImagePreloadService } from './image-preload.service';

describe('ImagePreloadService', () => {
  let service: ImagePreloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagePreloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
