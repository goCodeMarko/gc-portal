import { NgModule } from "@angular/core";

import { MenuItems } from "./menu-items/menu-items";
import {
  AccordionAnchorDirective,
  AccordionLinkDirective,
  AccordionDirective,
} from "./accordion";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { LongPressDirective } from "./directives/long-press/long-press.directive";

@NgModule({
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    LongPressDirective,
  ],
  imports: [MatCardModule, CommonModule],
  exports: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    LongPressDirective,
  ],
  providers: [MenuItems],
})
export class SharedModule {}
