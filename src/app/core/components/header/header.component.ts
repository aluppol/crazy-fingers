import { Component, OnInit } from '@angular/core';
import { Context } from '../../context';

@Component({
  selector: 'cf-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(
    public context: Context,
  ) { }

  ngOnInit(): void {
  }

}
