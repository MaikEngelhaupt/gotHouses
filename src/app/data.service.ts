import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as linkParser from 'parse-link-header';
import { Observable, Subject } from 'rxjs';
import { catchError, map, reduce, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class DataService {

  private baseApiUrl = "https://anapioficeandfire.com/api/houses";
  public itemCount = new Subject<number>();
  public detailLoading = new Subject<boolean>();
  public cadetBranchesLoading = new Subject<boolean>();
  public swornMembersLoading = new Subject<boolean>();
  public details = new Subject<{}>();
  public cadetBranches = new Subject<any[]>();
  public swornMembers = new Subject<any[]>();
  constructor(private httpClient: HttpClient) { }

  public getHouses(pageSize: number, page: number) {
    let params = new HttpParams().set('pageSize', pageSize.toString()).set('page', page.toString());
    return this.httpClient.get(this.baseApiUrl, { params: params });
  }

  public updateTotalItems() {
    let pageSize = 10
    this.getNumberOfHouses(pageSize)
  }

  private getNumberOfHouses(pageSize: number) {
    let lastPage = 0
    let params = new HttpParams().set('pageSize', pageSize.toString());
    this.httpClient.get(this.baseApiUrl, { params: params, observe: 'response' }).subscribe(res => {
      let linkString = res.headers.get('Link')
      if (linkString) {
        let link = linkParser(linkString)
        if (link) {
          lastPage = +link.last.page
        }
        this.getCountFromLastPage(lastPage, pageSize)
      }

    })
  }

  private getCountFromLastPage(lastPage: number, pageSize: number) {
    let params = new HttpParams().set('pageSize', pageSize.toString()).set('page', lastPage.toString());
    this.httpClient.get<[]>(this.baseApiUrl, { params: params }).subscribe(
      a => {
        let items = ((lastPage - 1) * pageSize) + a.length
        this.itemCount.next(items)
      })
  }

  public getHouseDetails(url: string) {
    this.detailLoading.next(true)
    this.cadetBranchesLoading.next(true)
    this.swornMembersLoading.next(true)

    this.httpClient.get(url).subscribe(
      async (res: any) => {
        res.currentLord = await this.getCharacterName(res.currentLord)
        res.founder = await this.getCharacterName(res.founder)
        res.heir = await this.getCharacterName(res.heir)
        res.overlord = await this.getHouseName(res.overlord)
        Object.keys(res).forEach(key => {
          if (Array.isArray(res[key]))
            return;
          if (res[key].length <= 0)
            res[key] = "unknown"
        })
        this.details.next(res)
        this.detailLoading.next(false)

        let sM = []
        let cB = []
        for (let i = 0; i < res.cadetBranches.length; i++) {
          cB[i] = await this.getHouseName(res.cadetBranches[i])
        }
        this.cadetBranches.next(cB)
        this.cadetBranchesLoading.next(false)
        for (let i = 0; i < res.swornMembers.length; i++) {
          sM[i] = await this.getCharacter(res.swornMembers[i])
        }
        this.swornMembers.next(sM)
        this.swornMembersLoading.next(false)
      }
    )
  }

  private async getCharacter(url: string) {
    if (url.length <= 0)
      return ""

    let character: any = await this.httpClient.get(url).toPromise()
    return character
  }

  private async getCharacterName(url: string) {
    if (url.length <= 0)
      return ""

    let character: any = await this.httpClient.get(url).toPromise()
    let name = character.name
    if (name.length <= 0 && character.aliases.length > 0)
      name = character.aliases[0]

    return name
  }

  private async getHouseName(url: string) {
    if (url.length <= 0)
      return ""

    let house: any = await this.httpClient.get(url).toPromise()
    return house.name
  }
}
