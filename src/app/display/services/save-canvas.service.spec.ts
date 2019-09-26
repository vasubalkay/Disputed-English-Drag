import { TestBed, inject } from '@angular/core/testing';
import { SaveCanvasService } from './save-canvas.service';

describe('SaveCanvasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SaveCanvasService]
    });
  });

  it('should be created', inject([SaveCanvasService], (service: SaveCanvasService) => {
    expect(service).toBeTruthy();
  }));
});
