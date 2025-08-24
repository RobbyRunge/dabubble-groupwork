import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }

  searchMessages(keyword: string): Observable<any[]> {
    // Beispiel-Daten, später durch echte Suche ersetzen
    const dummyResults = [
      { text: 'Nachricht mit ' + keyword },
      { text: 'Noch eine Nachricht mit ' + keyword }
    ];
    return of(dummyResults);
  }
}