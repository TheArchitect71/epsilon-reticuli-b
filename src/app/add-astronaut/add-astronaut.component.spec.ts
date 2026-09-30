import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AppModule } from '../app.module';
import { AstronautService } from '../astronaut.service';
import { AddAstronautComponent } from './add-astronaut.component';
describe('add astronaut dialog',()=>{let close:jasmine.Spy;beforeEach(async()=>{close=jasmine.createSpy();await TestBed.configureTestingModule({imports:[AppModule],providers:[{provide:MatDialogRef,useValue:{close}},{provide:AstronautService,useValue:{filters:of([{category:'undergraduateMajor',options:['Physics']}])}}]}).compileComponents();});it('requires fields and retains save/close demo behavior',()=>{const f=TestBed.createComponent(AddAstronautComponent);f.detectChanges();expect(f.componentInstance.astronaut.valid).toBeFalse();f.componentInstance.astronaut.patchValue({firstName:'Test',lastName:'Person',birthdate:new Date(2000,0,1),undergraduateMajor:'Physics'});expect(f.componentInstance.astronaut.valid).toBeTrue();f.componentInstance.saveAstronaut();expect(close).toHaveBeenCalled();});it('cancels without saving',()=>{const f=TestBed.createComponent(AddAstronautComponent);f.componentInstance.close();expect(close).toHaveBeenCalled();});});
