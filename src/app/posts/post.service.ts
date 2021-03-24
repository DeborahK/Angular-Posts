import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject, throwError } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { UserService } from "../Users/user.service";

import { Post } from "./post";

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsUrl = 'api/posts';

  allPosts$ = this.http.get<Post[]>(this.postsUrl);

  selectedCategorySubject = new BehaviorSubject<number>(0);
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  postsForCategory$ = this.selectedCategory$.pipe(
    switchMap(categoryId => this.http.get<Post[]>(this.postsUrl + (categoryId === 0 ? '' : `?categoryId=${categoryId}`)))
  )

  selectedUserSubject = new Subject<string>();
  selectedUser$ = this.selectedUserSubject.asObservable();

  postsForUser$ = this.selectedUser$.pipe(
    switchMap(userName => this.userService.getUserId(userName)),
    switchMap(userId => this.getPostsForUser(userId))
  );

  constructor(private http: HttpClient,
              private userService: UserService) { }

  private getPostsForUser(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.postsUrl}?userId=${userId}`).pipe(
      catchError(this.handleError)
    )
  }

  selectedCategoryChanged(categoryId: number): void {
    this.selectedCategorySubject.next(categoryId);
  }

  selectedUserChanged(userName: string): void {
    this.selectedUserSubject.next(userName);
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}