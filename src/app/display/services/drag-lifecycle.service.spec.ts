import { TestBed, inject } from '@angular/core/testing';

import { DragLifecycleService } from './drag-lifecycle.service';

describe('DragLifecycleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DragLifecycleService]
    });
  });

  it('should be created', inject([DragLifecycleService], (service: DragLifecycleService) => {
    expect(service).toBeTruthy();
  }));
});