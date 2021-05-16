import { Component, OnInit } from '@angular/core';
import { BlogEvent } from '../interfaces/menu.interface';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
})
export class PagesComponent implements OnInit {
  constructor(public blog: BlogService) {}

  ngOnInit(): void {}
  blogEvent(event: BlogEvent) {
    this.blog.executeEvent(event);
  }
}
