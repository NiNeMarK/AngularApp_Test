import { Component, OnInit,ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], 
  templateUrl: './app.html',
})
export class AppComponent implements OnInit { 
  userList: any[] = [];
  isModalOpen = false;
  mode: 'add' | 'view' = 'add';
  userForm: FormGroup;
  
  private apiUrl = 'https://localhost:7066/api/users'; 

  constructor(private fb: FormBuilder, private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      address: ['', Validators.required],
      age: [{ value: 0, disabled: true }]
    });
  }

ngOnInit() {
  this.loadUsers();
}

loadUsers() {
  this.http.get<any[]>(this.apiUrl).subscribe({
    next: (data) => {
      this.userList = data;
      console.log('Data loaded:', data); 

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('โหลดข้อมูลไม่สำเร็จ:', err);
    }
  });
}

  calculateAge() {
    const bDayValue = this.userForm.get('birthDate')?.value;
    if (bDayValue) {
      const birthYear = new Date(bDayValue).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      this.userForm.patchValue({ age: age });
    }
  }

  openModal(mode: 'add' | 'view', data?: any) {
    this.mode = mode;
    this.isModalOpen = true;
    if (mode === 'view' && data) {
      this.userForm.patchValue(data);
      this.userForm.disable();
    } else {
      this.userForm.reset({ age: 0 });
      this.userForm.enable();
      this.userForm.get('age')?.disable();
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

 saveData() {
  if (this.userForm.valid) {
    const payload = this.userForm.getRawValue();
    
    console.log('Sending data...', payload);

    this.http.post(this.apiUrl, payload).subscribe({
      next: (response) => {
        console.log('Save success:', response);
        this.loadUsers();  
        this.closeModal(); 
        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Save failed:', err);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    });
  } else {
    
    console.warn('Form invalid:', this.userForm.errors);
  }
}
}