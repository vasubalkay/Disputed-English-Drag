import { TestBed, inject } from '@angular/core/testing';

import { PostDropActionsService } from './post-drop-actions.service';

describe('PostDropActionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PostDropActionsService]
    });
  });

  it('should be created', inject([PostDropActionsService], (service: PostDropActionsService) => {
    expect(service).toBeTruthy();
  }));
});