import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import * as linkParser from 'parse-link-header';
@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.sass']
})
export class HousesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'region', 'words']
  houseData: any
  paginatorLength = 0
  pageSize = 25
  currentPage = 1
  loading = false
  detailData: any
  detailLoading = false
  cadetBranchesData: any
  cadetBranchesLoading = true
  swornMembersData: any
  swornMembersLoading = true
  constructor(private dataService: DataService) { }
  ngOnInit(): void {
    this.dataService.itemCount.subscribe(count => this.paginatorLength = count)
    this.dataService.details.subscribe(data => this.detailData = data)
    this.dataService.detailLoading.subscribe(loading => this.detailLoading = loading)

    this.dataService.swornMembers.subscribe(data => this.swornMembersData = data)
    this.dataService.swornMembersLoading.subscribe(loading => this.swornMembersLoading = loading)
    this.dataService.cadetBranches.subscribe(data => this.cadetBranchesData = data)
    this.dataService.cadetBranchesLoading.subscribe(loading => this.cadetBranchesLoading = loading)

    this.updateList()
    this.dataService.updateTotalItems()
  }

  updateList() {
    this.loading = true
    this.dataService.getHouses(this.pageSize, this.currentPage).subscribe(res => {
      this.houseData = res
      this.loading = false
    })
  }

  handlePageEvent($event: any) {
    this.pageSize = $event.pageSize
    this.currentPage = $event.pageIndex + 1
    this.updateList()
  }
  houseClicked(row: any) {
    this.setSelectedRow(row)
    this.dataService.getHouseDetails(row.url);
  }

  setSelectedRow(row: any) {
    this.houseData.forEach((element: any) => {
      element.selected = false
    });
    row.selected = true
  }
}
