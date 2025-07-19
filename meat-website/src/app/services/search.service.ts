import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, catchError, tap } from 'rxjs/operators';

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  route: string;
  weight: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private recentSearchesKey = 'recentSearches';
  private maxRecentSearches = 5;

  // Complete product catalog for all categories
  private productCatalog: SearchResult[] = [
    // Chicken Products
    {
      id: 'CC001',
      name: 'Chicken Curry Cut with Skin',
      category: 'Chicken',
      image: 'assets/images/cws.jpeg',
      price: 170,
      route: '/chicken',
      weight: '1 kg'
    },
    {
      id: 'CC002',
      name: 'Chicken Curry Cut without Skin',
      category: 'Chicken',
      image: 'assets/images/cwos.png',
      price: 220,
      route: '/chicken',
      weight: '1 kg'
    },
    {
      id: 'BL001',
      name: 'Chicken Boneless Curry Cut',
      category: 'Chicken',
      image: 'assets/images/cbbl.webp',
      price: 350,
      route: '/chicken',
      weight: '1 kg'
    },
    {
      id: 'BL002',
      name: 'Chicken Breast Boneless',
      category: 'Chicken',
      image: 'assets/images/cbl.jpg',
      price: 350,
      route: '/chicken',
      weight: '1 kg'
    },
    {
      id: 'SP001',
      name: 'Chicken Wings with Skin',
      category: 'Chicken',
      image: 'assets/images/cw.jpg',
      price: 100,
      route: '/chicken',
      weight: '500 g'
    },

    // Country Chicken Products
    {
      id: 'CCC001',
      name: 'Country Chicken Small',
      category: 'Country Chicken',
      image: 'assets/images/country-chicken.jpg',
      price: 399,
      route: '/country-chicken',
      weight: '600-700 g'
    },
    {
      id: 'CCC002',
      name: 'Country Chicken Medium',
      category: 'Country Chicken',
      image: 'assets/images/country-chicken.jpg',
      price: 599,
      route: '/country-chicken',
      weight: '800-900 g'
    },
    {
      id: 'CCC003',
      name: 'Country Chicken Large',
      category: 'Country Chicken',
      image: 'assets/images/country-chicken.jpg',
      price: 799,
      route: '/country-chicken',
      weight: '1-1.2 kg'
    },

    // Japanese Quail Products
    {
      id: 'JQ001',
      name: 'Japanese Quail',
      category: 'Japanese Quail',
      image: 'assets/images/j1.jfif',
      price: 55,
      route: '/japanese-quail',
      weight: '1 piece'
    },
    {
      id: 'JQ002',
      name: 'Japanese Quail Cleaned',
      category: 'Japanese Quail',
      image: 'assets/images/j1.jfif',
      price: 65,
      route: '/japanese-quail',
      weight: '1 piece'
    },

    // Turkey Products
    {
      id: 'TR001',
      name: 'Turkey Bird Meat',
      category: 'Turkey',
      image: 'assets/images/turkey.jfif',
      price: 700,
      route: '/turkey',
      weight: '1 kg'
    },
    {
      id: 'TR002',
      name: 'Turkey Bird Curry Cut',
      category: 'Turkey',
      image: 'assets/images/turkey.jfif',
      price: 750,
      route: '/turkey',
      weight: '1 kg'
    },

    // Goat Products
    {
      id: 'GT001',
      name: 'Mutton Curry Cut with Bone',
      category: 'Goat',
      image: 'assets/images/Mcurrywithbone.webp',
      price: 800,
      route: '/goat',
      weight: '1 kg'
    },
    {
      id: 'GT002',
      name: 'Mutton Curry Cut without Bone',
      category: 'Goat',
      image: 'assets/images/Mutton Curry without Bone.jpg',
      price: 950,
      route: '/goat',
      weight: '1 kg'
    },
    {
      id: 'GT003',
      name: 'Mutton Chops Curry',
      category: 'Goat',
      image: 'assets/images/Muttonchops.webp',
      price: 900,
      route: '/goat',
      weight: '1 kg'
    },
    {
      id: 'GT004',
      name: 'Mutton Breast Curry',
      category: 'Goat',
      image: 'assets/images/Mbreastcurry.webp',
      price: 900,
      route: '/goat',
      weight: '1 kg'
    }
  ];

  constructor() {}

  search(query: string): Observable<SearchResult[]> {
    const searchTerm = query.toLowerCase().trim();
    
    // Search in name, category, and weight, and include alternative terms
    const results = this.productCatalog.filter(product => {
      const searchableText = [
        product.name.toLowerCase(),
        product.category.toLowerCase(),
        product.weight.toLowerCase(),
        // Add alternative search terms
        product.category === 'Goat' ? 'mutton' : '',
        product.category === 'Japanese Quail' ? 'kada' : '',
        product.category === 'Turkey' ? 'turkey bird' : '',
        // Add common variations
        product.name.toLowerCase().replace('mutton', 'goat'),
        product.name.toLowerCase().replace('goat', 'mutton'),
        // Add weight variations
        product.weight.toLowerCase().replace('kg', 'kilo'),
        product.weight.toLowerCase().replace('g', 'gram')
      ].join(' ');

      return searchableText.includes(searchTerm);
    });

    // Save to recent searches if there are results
    if (results.length > 0 && query.trim()) {
      this.saveToRecentSearches(query.trim());
    }

    // Simulate API delay
    return of(results).pipe(delay(300));
  }

  getRecentSearches(): string[] {
    const searches = localStorage.getItem(this.recentSearchesKey);
    return searches ? JSON.parse(searches) : [];
  }

  private saveToRecentSearches(query: string) {
    const searches = this.getRecentSearches();
    const newSearches = [
      query,
      ...searches.filter(s => s !== query)
    ].slice(0, this.maxRecentSearches);
    
    localStorage.setItem(this.recentSearchesKey, JSON.stringify(newSearches));
  }

  addRecentSearch(query: string) {
    if (query.trim()) {
      this.saveToRecentSearches(query.trim());
    }
  }

  getPopularSearches(): string[] {
    return [
      'Chicken Curry Cut',
      'Country Chicken',
      'Japanese Quail',
      'Turkey Bird',
      'Mutton with Bone',
      'Mutton without Bone',
      'Chicken Wings',
      'Mutton Chops'
    ];
  }
} 