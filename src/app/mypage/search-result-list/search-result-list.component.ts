import { Component, OnInit, Input } from '@angular/core';
import { Condition } from 'src/app/interfaces/condition';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Deductions } from 'src/app/interfaces/deductions';

@Component({
  selector: 'app-search-result-list',
  templateUrl: './search-result-list.component.html',
  styleUrls: ['./search-result-list.component.scss'],
})
export class SearchResultListComponent implements OnInit {
  @Input() rate: Deductions;

  conditionsList: Condition[];
  queryTitle: string;
  typeFilter: string;
  baseLower: number;
  baseUpper: number;
  allowanceLower: number;
  allowanceUpper: number;
  basePerHourLower: number;
  basePerHourUpper: number;

  private index = this.searchService.index.condition;
  loading: boolean;
  result: {
    nbHits: number;
    hits: any[];
  }; // TODO: 型対応後調整(https://github.com/algolia/algoliasearch-client-javascript/pull/1086)

  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.conditionsList = [];
      this.index = this.searchService.index.condition;
      this.queryTitle = params.get('title') || '';
      this.typeFilter = params.get('type') || '';
      this.baseLower = +params.get('baseLower');
      this.baseUpper = +params.get('baseUpper');
      this.allowanceLower = +params.get('allowanceLower');
      this.allowanceUpper = +params.get('allowanceUpper');
      this.basePerHourLower = +params.get('basePerHourLower');
      this.basePerHourUpper = +params.get('basePerHourUpper');
      this.search();
    });
  }

  search() {
    this.loading = true;
    this.index
      .search(this.queryTitle, {
        facetFilters: [
          `userId: ${this.authService.uid}`,
          `type: ${this.typeFilter}`,
          `base >= ${this.baseLower}`,
        ],
      })
      .then((result) => {
        this.result = result;
        const items = result.hits as any[]; // TODO: 型対応後調整(https://github.com/algolia/algoliasearch-client-javascript/pull/1086)
        this.conditionsList.push(...items);
        this.loading = false;
      });
  }
}
