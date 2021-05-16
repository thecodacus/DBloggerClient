import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorComponent } from './pages/author/author.component';
import { AuthorsComponent } from './pages/authors/authors.component';
import { HomeComponent } from './pages/home/home.component';
import { NewPostComponent } from './pages/new-post/new-post.component';
import { PagesComponent } from './pages/pages.component';
import { PostComponent } from './pages/post/post.component';
import { PostsComponent } from './pages/posts/posts.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'posts',
        component: PostsComponent,
      },
      {
        path: 'post/:id',
        component: PostComponent,
      },
      {
        path: 'authors',
        component: AuthorsComponent,
      },
      {
        path: 'author/:id',
        component: AuthorComponent,
      },
      {
        path: 'new-post',
        component: NewPostComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
