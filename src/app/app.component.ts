import { Component } from '@angular/core';
import { ContractService } from 'src/app/services/contract.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'DBloggerClient';
  constructor(public contract: ContractService) {}
}
