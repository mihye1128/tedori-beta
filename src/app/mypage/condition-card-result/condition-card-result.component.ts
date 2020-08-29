import { Component, OnInit, Input } from '@angular/core';
import { Condition } from 'src/app/interfaces/condition';
import { Deductions } from 'src/app/interfaces/deductions';

@Component({
  selector: 'app-condition-card-result',
  templateUrl: './condition-card-result.component.html',
  styleUrls: ['./condition-card-result.component.scss'],
})
export class ConditionCardResultComponent implements OnInit {
  @Input() condition: Condition;
  @Input() rate: Deductions;

  opendTotal = false;
  opendDeduction = false;
  opendOwner = false;

  constructor() {}

  ngOnInit(): void {}

  changedText(value: boolean) {
    if (value) {
      return '閉じる';
    } else {
      return '詳細表示';
    }
  }
}