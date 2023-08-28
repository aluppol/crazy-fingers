import { Injectable } from '@angular/core';


export interface IContext {
  userId?: number;
  userName?: string;
  baseRoute?: string;
}


@Injectable()
export class Context implements IContext {
  userId?: number | undefined;
  userName?: string | undefined;
  baseRoute?: string | undefined;
}
