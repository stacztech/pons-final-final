import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of, throwError, catchError, tap } from 'rxjs';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface LocationDetails {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  formattedAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  private apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual API key

  constructor(private http: HttpClient) {}

  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }
    });
  }

  getAddressFromCoordinates(latitude: number, longitude: number): Observable<LocationDetails> {
    const url = `${this.geocodeUrl}?latlng=${latitude},${longitude}&key=${this.apiKey}`;
    
    return this.http.get(url).pipe(
      map((response: any) => {
        if (response.status === 'OK' && response.results.length > 0) {
          const result = response.results[0];
          const addressComponents = result.address_components;
          
          const locationDetails: LocationDetails = {
            latitude,
            longitude,
            address: '',
            city: '',
            state: '',
            pincode: '',
            formattedAddress: result.formatted_address
          };

          // Extract address components
          for (const component of addressComponents) {
            const types = component.types;
            
            if (types.includes('street_number') || types.includes('route')) {
              locationDetails.address += component.long_name + ' ';
            }
            if (types.includes('locality')) {
              locationDetails.city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              locationDetails.state = component.long_name;
            }
            if (types.includes('postal_code')) {
              locationDetails.pincode = component.long_name;
            }
          }

          locationDetails.address = locationDetails.address.trim();
          return locationDetails;
        }
        throw new Error('Unable to find address for this location');
      }),
      catchError(error => {
        console.error('Error getting address from coordinates:', error);
        return throwError(error);
      })
    );
  }
} 