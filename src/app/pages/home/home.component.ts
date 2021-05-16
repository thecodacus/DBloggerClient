import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from 'src/app/interfaces/author.interface';
import { IBlogPost } from 'src/app/interfaces/blog.interface';
import { BlogService } from 'src/app/services/blog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public blogs: Observable<IBlogPost[]>;
  public authors: Observable<IUser[]>;
  constructor(public blogSvc: BlogService) {
    this.blogs = this.blogSvc.getAllBlogPosts();
    this.authors = this.blogSvc.getAllUsers();
  }

  ngOnInit(): void {}
}
