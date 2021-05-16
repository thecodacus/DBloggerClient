import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit {
  private editor: EditorJS;
  @Input() readonly: boolean = false;
  constructor() {}
  ngAfterViewInit(): void {
    this.editor = this.initialize();
  }

  ngOnInit(): void {}
  initialize(): EditorJS {
    return new EditorJS({
      /**
       * Create a holder for the Editor and pass its ID
       */
      holder: 'editorjs',
      autofocus: true,
      readOnly: this.readonly,
      minHeight: 700,

      /**
       * Available Tools list.
       * Pass Tool's class or Settings object for each Tool you want to use
       */
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
          },
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
            },
          },
        },

        // ...
      },
    });
  }
}
