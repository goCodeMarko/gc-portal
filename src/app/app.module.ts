import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import {
  CommonModule,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { AppRoutes } from "./app.routing";
import { AppComponent } from "./app.component";

import { FlexLayoutModule } from "@angular/flex-layout";
import { FullComponent } from "./layouts/full/full.component";
import { AppHeaderComponent } from "./layouts/full/header/header.component";
import { AppSidebarComponent } from "./layouts/full/sidebar/sidebar.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DemoMaterialModule } from "./demo-material-module";
import { SharedModule } from "./shared/shared.module";
import { SpinnerComponent } from "./shared/spinner.component";
import { HttpRequestService } from "./http-request/http-request.service";
import { PopUpModalComponent } from "./modals/pop-up-modal/pop-up-modal.component";
import { MatInputModule } from "@angular/material/input";
import { AuthService } from "./authorization/auth.service";
import { TokenInterceptorServiceService } from "./token-interceptor/token-interceptor-service.service";
import { LoginComponent } from "./login/login.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TransactionModule } from "./transaction/transaction.module";
import { SocketService } from "./shared/socket/socket.service";
import { AudioService } from "./shared/audio/audio.service";
import { InternetConnectionService } from "./shared/internet-connection/internet-connection.service";
import { ViewNoteModalComponent } from "./modals/view-note-modal/view-note-modal.component";
import { ViewSnapshotModalComponent } from "./modals/view-snapshot-modal/view-snapshot-modal.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { CameraModalComponent } from "./modals/camera-modal/camera-modal.component";
import { WebcamModule } from "ngx-webcam";

@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    AppHeaderComponent,
    SpinnerComponent,
    AppSidebarComponent,
    PopUpModalComponent,
    ViewNoteModalComponent,
    LoginComponent,
    ViewNoteModalComponent,
    ViewSnapshotModalComponent,
    CameraModalComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    TransactionModule,
    MatButtonToggleModule,
    WebcamModule,
    RouterModule.forRoot(AppRoutes),
  ],
  providers: [
    HttpRequestService,
    SocketService,
    AudioService,
    AuthService,
    InternetConnectionService,
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorServiceService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
