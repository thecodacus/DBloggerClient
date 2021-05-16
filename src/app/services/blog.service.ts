import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { bufferWhen, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IUser } from '../interfaces/author.interface';
import { BlogEvent, IMenu, MenuType } from '../interfaces/menu.interface';
import { ContractService } from './contract.service';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  public env = environment;
  public menus: IMenu[] = [
    {
      name: 'Posts',
      type: MenuType.PATH,
      path: '/posts',
    },
    {
      name: 'Authors',
      type: MenuType.PATH,
      path: '/authors',
    },
    {
      name: 'About',
      type: MenuType.PATH,
      path: '/about',
    },
  ];
  public secondaryMenu: Observable<IMenu[]>;
  private setCurrentProfile: BehaviorSubject<IUser> = new BehaviorSubject(null);
  public currentProfile: Observable<IUser>;

  constructor(private contract: ContractService) {
    this.secondaryMenu = this.getSecondaryMenu();
    this.currentProfile = this.setCurrentProfile.asObservable();
  }
  private getSecondaryMenu(): Observable<IMenu[]> {
    return this.contract.isConnected().pipe(
      switchMap((x) => {
        if (!x)
          return of([
            {
              name: 'Connect Wallet',
              event: BlogEvent.ConnectWallet,
              type: MenuType.EVENT,
            },
          ]);
        return this.contract.getSelectedAddress().pipe(
          switchMap((id) => {
            if (id) return from(this.contract.getUserProfile(id));
            else return of(null);
          }),
          map((user) => {
            if (user == undefined) {
              return [
                {
                  name: 'Register',
                  type: MenuType.PATH,
                  path: '/register',
                },
                {
                  name: 'Disconnect',
                  type: MenuType.EVENT,
                  event: BlogEvent.DisconnectWallet,
                },
              ];
            }
            this.setCurrentProfile.next(user);
            return [
              {
                name: 'New Post',
                type: MenuType.PATH,
                path: '/new-post',
              },
              {
                name: 'Disconnect',
                type: MenuType.EVENT,
                event: BlogEvent.DisconnectWallet,
              },
            ];
          })
        );
      })
    );
  }
  public async executeEvent(event: BlogEvent) {
    switch (event) {
      case BlogEvent.ConnectWallet:
        await this.contract.connect();
        break;

      case BlogEvent.DisconnectWallet:
        await this.contract.disconnect();
        break;
      default:
        break;
    }
  }
  public getAllBlogPosts() {
    return this.contract.isConnected().pipe(
      switchMap((connected) => {
        if (connected) return from(this.contract.getAllPosts());
        return of([]);
      })
    );
  }
  public getAllAuthors() {
    return this.contract.isConnected().pipe(
      switchMap((connected) => {
        if (connected) return from(this.contract.getAllAuthorProfile());
        return of([]);
      })
    );
  }
  public getAllUsers() {
    return this.contract.isConnected().pipe(
      switchMap((connected) => {
        if (connected) return from(this.contract.getAllUserProfile());
        return of([]);
      })
    );
  }
}
