import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RootComponent } from './root.component';

describe('RootComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        RootComponent
      ],
    }).compileComponents();
  });

  it('should create the Root', () => {
    const fixture = TestBed.createComponent(RootComponent);
    const root = fixture.componentInstance;
    expect(root).toBeTruthy();
  });

  it('should have as title \'crazy-fingers\'', () => {
    const fixture = TestBed.createComponent(RootComponent);
    const root = fixture.componentInstance;
    expect(root.title).toEqual('crazy-fingers');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(RootComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('crazy-fingers Root is running!');
  });
});
