import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Condition } from '../interfaces/condition';
import { Subject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ConditionsService {
  conditions = new Subject<Condition[]>();
  conditions$ = this.conditions.asObservable();

  constructor(private db: AngularFirestore, private snackBar: MatSnackBar) {}

  setConditions(conditions: Condition[]) {
    this.conditions.next(conditions);
  }

  saveConditions(conditions: Condition[]) {
    this.conditions.next(conditions);
    Promise.all(
      conditions.map((condition) => {
        const id = this.db.createId();
        return this.db.doc(`conditions/${id}`).set(condition);
      })
    ).then(() => {
      this.snackBar.open('マイページに保存しました。', '確認する', {
        duration: 2000,
      });
    });
  }

  getConditions(uid: string) {
    return this.db
      .collection<Condition>(`conditions`, (ref) =>
        ref.where('userId', '==', uid)
      )
      .valueChanges();
  }
}
