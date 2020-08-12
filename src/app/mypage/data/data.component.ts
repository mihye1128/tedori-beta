import { Component, OnInit, Input } from '@angular/core';
import { Condition } from 'src/app/interfaces/condition';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnInit {
  @Input() condition: Condition;

  constructor() {}

  ngOnInit(): void {}

  getAge(age: string) {
    if (age === 'young') {
      return '〜 39歳';
    } else if (age === 'middle') {
      return '40歳 〜 64歳';
    } else {
      return '65歳 〜';
    }
  }
}
