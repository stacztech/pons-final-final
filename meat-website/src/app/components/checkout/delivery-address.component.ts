import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, Address } from '../../services/auth.service';
import { Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-delivery-address',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="checkout-container">
      <div class="checkout-content">
        <!-- Main Content -->
        <div class="address-section">
          <h1>Select a delivery address</h1>
          
          <!-- Saved Addresses -->
          <div class="saved-addresses" *ngIf="savedAddresses.length > 0">
            <div *ngFor="let address of savedAddresses" 
                 class="address-option"
                 [class.selected]="selectedAddressId === address.id"
                 (click)="selectAddress(address.id)">
              <div class="radio-button">
                <input type="radio" 
                       [checked]="selectedAddressId === address.id"
                       name="addressSelection">
                <span class="radio-label">Deliver to this address</span>
              </div>
              <div class="address-details">
                <p class="name">{{ address.fullName }}</p>
                <p class="street">{{ address.addressLine1 }}, {{ address.city }}, {{ address.state }}</p>
                <p class="phone">Phone: {{ address.phoneNumber }}</p>
              </div>
              <button class="btn-edit" (click)="startEdit(address); $event.stopPropagation()">
                Edit
              </button>
            </div>
          </div>

          <!-- Add New Address Button -->
          <button *ngIf="!isAddingNew" class="btn-add-address" (click)="startAddNew()">Add New Address</button>

          <!-- Add New Address Form -->
          <div *ngIf="isAddingNew || isEditing" class="new-address-form">
            <div class="form-header">
              <h2>{{ savedAddresses.length > 0 ? 'Or add a new address' : 'Add a delivery address' }}</h2>
            </div>
            
            <div *ngIf="errorMessage" class="alert alert-danger" style="margin-bottom:10px;">{{ errorMessage }}</div>
            
            <form (ngSubmit)="saveAddress()">
              <div class="form-group">
                <label for="fullName">Full name (First and Last name)</label>
                <input type="text" id="fullName" [(ngModel)]="newAddress.fullName" name="fullName" required>
              </div>
              <div class="form-group">
                <label for="phone">Mobile number</label>
                <input type="tel" id="phone" [(ngModel)]="newAddress.phoneNumber" name="phoneNumber" required pattern="[0-9]{10}" placeholder="10-digit mobile number">
              </div>
              <div class="form-group">
                <label for="altPhone">Alternate Phone (optional)</label>
                <input type="tel" id="altPhone" [(ngModel)]="newAddress.altPhone" name="altPhone" pattern="[0-9]{10}" placeholder="Alternate 10-digit mobile number">
              </div>
              <div class="form-group">
                <label for="pincode">Pincode</label>
                <input type="text" id="pincode" [(ngModel)]="newAddress.pincode" name="pincode" required pattern="[0-9]{6}" maxlength="6" placeholder="6-digit pincode">
              </div>
              <div class="form-group">
                <label for="locality">Locality</label>
                <input type="text" id="locality" [(ngModel)]="newAddress.locality" name="locality" required placeholder="Locality / Area / Village">
              </div>
              <div class="form-group">
                <label for="address">Address (Area and Street)</label>
                <textarea id="address" [(ngModel)]="newAddress.addressLine1" name="addressLine1" required placeholder="Address (Area and Street)" class="address-textarea" rows="3"></textarea>
                <button type="button" class="btn-detect-location" (click)="detectCurrentLocation()">
                  <i class="bi bi-geo-alt"></i> Use my current location
                </button>
              </div>
              <div class="form-group">
                <label for="landmark">Landmark (optional)</label>
                <input type="text" id="landmark" [(ngModel)]="newAddress.landmark" name="landmark" placeholder="E.g. near Apollo hospital">
              </div>
              <div class="form-group">
                <label for="city">City/District/Town</label>
                <input type="text" id="city" [(ngModel)]="newAddress.city" name="city" required placeholder="City/District/Town">
              </div>
              <div class="form-group">
                <label for="state">State</label>
                <input type="text" id="state" [(ngModel)]="newAddress.state" name="state" required placeholder="State">
              </div>
              
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="saveAddressForLater" name="saveAddress"> Save this address for later use
                </label>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary">Use this address</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
    }

    .address-section {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      padding: 20px;
    }

    .saved-addresses {
      margin-bottom: 30px;
    }

    .address-option {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
    }

    .address-option:hover {
      border-color: #E31837;
    }

    .address-option.selected {
      border-color: #E31837;
      background: #fff5f6;
    }

    .radio-button {
      margin-bottom: 10px;
    }

    .radio-label {
      margin-left: 8px;
      font-weight: 500;
    }

    .address-details {
      margin-left: 25px;
    }

    .btn-edit {
      position: absolute;
      right: 15px;
      top: 15px;
      background: none;
      border: none;
      color: #E31837;
      cursor: pointer;
    }

    .new-address-form {
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-group input[type="text"],
    .form-group input[type="tel"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .btn-detect-location {
      background: none;
      border: none;
      color: #E31837;
      padding: 5px 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 10px;
    }

    .btn-add-address {
      background: none;
      border: none;
      color: #E31837;
      padding: 5px 0;
      cursor: pointer;
      display: block;
      margin-top: 10px;
      margin-left: auto;
    }

    .form-group textarea.address-textarea {
      width: 100%;
      padding: 16px 24px 16px 24px;
      border: 1px solid #dbe3ea;
      border-radius: 4px;
      font-size: 18px;
      color: #6c757d;
      background: #fff;
      resize: none;
      min-height: 90px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .form-group textarea.address-textarea:focus {
      outline: none;
      border-color: #b5c9d6;
      background: #f8fbff;
    }

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DeliveryAddressComponent implements OnInit {
  @Input() showOrderSummary: boolean = false;
  @Input() orderSummary: any;
  @Output() addressSelected = new EventEmitter<Address>();

  savedAddresses: Address[] = [];
  selectedAddressId: string | null = null;
  saveAddressForLater = false;
  isDetectingLocation = false;
  isAddingNew = false;
  isEditing = false;
  editAddressId: string | null = null;
  errorMessage: string = '';

  newAddress: Omit<Address, 'id' | 'isDefault'> & { altPhone?: string; locality?: string; landmark?: string; type: string } = {
    type: 'home',
    fullName: '',
    phoneNumber: '',
    altPhone: '',
    addressLine1: '',
    addressLine2: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses() {
    this.authService.getAddresses().subscribe({
      next: (response) => {
        this.savedAddresses = response.addresses || [];
        const defaultAddress = this.savedAddresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
          this.addressSelected.emit(defaultAddress);
        }
        if (this.savedAddresses.length === 0) {
          this.isAddingNew = true;
        } else {
          this.isAddingNew = false;
        }
      },
      error: () => {
        this.savedAddresses = [];
        this.isAddingNew = true;
      }
    });
  }

  selectAddress(id: string): void {
    this.selectedAddressId = id;
    const address = this.savedAddresses.find(a => a.id === id);
    if (address) this.addressSelected.emit(address);
  }

  setDefaultAddress(id: string) {
    this.authService.setDefaultAddress(id).subscribe({
      next: () => this.loadAddresses(),
      error: () => { this.errorMessage = 'Failed to set default address.'; }
    });
  }

  deleteAddress(id: string) {
    this.authService.deleteAddress(id).subscribe({
      next: () => {
        this.loadAddresses();
        if (this.selectedAddressId === id) {
          this.selectedAddressId = null;
        }
      },
      error: () => { this.errorMessage = 'Failed to delete address.'; }
    });
  }

  startAddNew() {
    this.isAddingNew = true;
    this.isEditing = false;
    this.editAddressId = null;
    this.newAddress = {
      type: 'home',
      fullName: '',
      phoneNumber: '',
      altPhone: '',
      addressLine1: '',
      addressLine2: '',
      locality: '',
      landmark: '',
      city: '',
      state: '',
      pincode: ''
    };
  }

  startEdit(address: Address) {
    this.isEditing = true;
    this.isAddingNew = false;
    this.editAddressId = address.id;
    this.newAddress = {
      type: address.type || 'home',
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      altPhone: address.altPhone || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      locality: address.locality || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode
    };
  }

  saveAddress() {
    // Validation
    if (!/^[0-9]{10}$/.test(this.newAddress.phoneNumber)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    if (this.newAddress.altPhone && !/^[0-9]{10}$/.test(this.newAddress.altPhone)) {
      this.errorMessage = 'Please enter a valid 10-digit alternate phone number.';
      return;
    }
    if (!/^[0-9]{6}$/.test(this.newAddress.pincode)) {
      this.errorMessage = 'Please enter a valid 6-digit pincode.';
      return;
    }
    if (!this.newAddress.locality) {
      this.errorMessage = 'Please enter your locality.';
      return;
    }
    if (!this.newAddress.city) {
      this.errorMessage = 'Please enter your city.';
      return;
    }
    if (!this.newAddress.state) {
      this.errorMessage = 'Please enter your state.';
      return;
    }
    this.errorMessage = '';
    if (this.isEditing && this.editAddressId) {
      this.authService.updateAddress(this.editAddressId, this.newAddress).subscribe({
        next: (response) => {
          this.isAddingNew = false;
          this.isEditing = false;
          this.editAddressId = null;
          if (response && response.address) {
            this.selectedAddressId = response.address.id;
            this.addressSelected.emit(response.address);
          } else {
            this.loadAddresses();
          }
        },
        error: () => { this.errorMessage = 'Failed to update address. Please try again.'; }
      });
    } else {
      const addressToSave = {
        ...this.newAddress,
        isDefault: false
      };
      this.authService.addAddress(addressToSave).subscribe({
        next: (response) => {
          this.isAddingNew = false;
          this.isEditing = false;
          this.editAddressId = null;
          if (response && response.address) {
            this.selectedAddressId = response.address.id;
            this.addressSelected.emit(response.address);
          } else {
            this.loadAddresses();
          }
        },
        error: () => { this.errorMessage = 'Failed to add address. Please try again.'; }
      });
    }
  }

  cancelAddEdit() {
    this.isAddingNew = false;
    this.isEditing = false;
    this.editAddressId = null;
  }

  detectCurrentLocation(): void {
    this.isDetectingLocation = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Here you would typically make an API call to reverse geocode
          // the coordinates into an address
          console.log('Location detected:', position.coords);
          this.isDetectingLocation = false;
        },
        (error) => {
          console.error('Error detecting location:', error);
          this.isDetectingLocation = false;
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.isDetectingLocation = false;
    }
  }

  canProceed(): boolean {
    return !!(this.selectedAddressId !== null ||
      (this.newAddress.fullName &&
        this.newAddress.phoneNumber &&
        this.newAddress.addressLine1));
  }

  proceedToPayment(): void {
    if (this.canProceed()) {
      // Navigate to payment page
      console.log('Proceeding to payment with address:', 
        this.selectedAddressId ? 
        this.savedAddresses.find(a => a.id === this.selectedAddressId) : 
        this.newAddress
      );
      // Add navigation logic here
    }
  }
} 