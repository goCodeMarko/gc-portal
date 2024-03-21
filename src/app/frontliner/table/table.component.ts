import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "../../modals/pop-up-modal/pop-up-modal.component";
import { HttpRequestService } from "../../http-request/http-request.service";
import { EditBookComponent } from "../../modals/edit-book/edit-book.component";
import { saveAs } from "file-saver";
interface IBooks {
  author: string;
  stocks: number;
  isdeleted: boolean;
  _id: string;
  title: string;
  price: number;
}

interface IResponse {
  success: string;
  data: {
    items: IBooks[];
    meta: {
      total: number;
      limit: number;
      page: number;
      pages: number;
    };
  };
  code: number;
  message: string;
}

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent implements OnInit, OnChanges {
  // @Input() componentName: string = "";
  @Input() filters:
    | {
        search: string;
        dateStart: string;
        dateEnd: string;
        skip: number;
        skipCount: number;
        limit: number;
      }
    | any = {};
  @Input() data: any[] = [];
  @Input() headers: any[] = [];
  @Input() dataNames: any[] = [];
  @Input() totalCount = 0;
  @Input() totalPages = 0;
  @Input() currentPage = 0;
  @Output() viewCashout = new EventEmitter<object>();
  @Output() next = new EventEmitter<object>();
  @Output() previous = new EventEmitter<object>();

  @Output() emitButtonClick = new EventEmitter<string>();
  pdfbtn = false;
  excelbtn = false;
  checked = false;
  indeterminate = false;

  // value1: number = this.filters.limit;

  constructor(private dialog: MatDialog, private hrs: HttpRequestService) {}

  ngOnInit(): void {
    console.log(34343, this.data);
  }

  ngOnChanges(changes: SimpleChanges): void {}

  emitNext() {
    if (this.currentPage < this.totalPages) {
      this.filters.skipCount += this.filters.skip;

      this.next.emit(this.getFilters);
    }
  }

  buttonClicked(type: string) {
    this.emitButtonClick.emit(type);
  }

  emitPrev() {
    if (this.filters.skipCount > 0) {
      this.filters.skipCount -= this.filters.skip;

      this.previous.emit(this.getFilters);
    }
  }

  emitViewCashout(data: any) {
    this.viewCashout.emit(data);
  }

  get getFilters() {
    return this.filters;
  }

  setFilter() {
    // console.log(222222, this.value1);
  }

  // openDeleteModal(id: string) {
  //   this.dialog
  //     .open(PopUpModalComponent, {
  //       width: "330px",
  //       data: {
  //         deletebutton: true,
  //         title: "You're about to delete a book",
  //         message:
  //           "This will <b>delete the book from the database</b> <br> are you sure about it?",
  //       },
  //     })
  //     .componentInstance.result.subscribe((data: boolean) => {
  //       if (data) this.deleteBook(id);
  //     });
  // }

  // openEditModal(book: object) {
  //   this.dialog
  //     .open(EditBookComponent, {
  //       width: "300px",
  //       data: {
  //         data: book,
  //       },
  //     })
  //     .componentInstance.result.subscribe(
  //       (newData: { save: boolean; newData: object }) => {
  //         if (newData.save) this.editBook(book, newData);
  //       }
  //     );
  // }

  // private editBook(oldData: any, newData: any) {
  //   this.hrs.request(
  //     "put",
  //     `book/updateBook/${oldData._id}`,
  //     newData.updateddata,
  //     async (data: IResponse) => {
  //       if (data.success) {
  //         this.editCurrentBookInTable(oldData._id, newData);
  //       } else {
  //         if (data.message == "Restricted") {
  //           this.dialog.open(PopUpModalComponent, {
  //             width: "300px",
  //             data: {
  //               deletebutton: false,
  //               title: "Access Denied",
  //               message:
  //                 "Oops, It looks like you <b>dont have access</b> on this feature.",
  //             },
  //           });
  //         }
  //       }
  //     }
  //   );
  // }

  // private deleteBook(id: string) {
  //   this.hrs.request(
  //     "put",
  //     `book/deleteBook/${id}`,
  //     this.filters,
  //     async (data: IResponse) => {
  //       if (data.success) {
  //         this.books.push(data.data?.items[0]);
  //         this.totalCount -= 1;
  //         this.deleteCurrentBookInTable(id);
  //       } else {
  //         if (data.message == "Restricted") {
  //           this.dialog.open(PopUpModalComponent, {
  //             width: "300px",
  //             data: {
  //               deletebutton: false,
  //               title: "Access Denied",
  //               message:
  //                 "Oops, It looks like you <b>dont have access</b> on this feature.",
  //             },
  //           });
  //         }
  //       }
  //     }
  //   );
  // }

  // private deleteCurrentBookInTable(id: string) {
  //   this.books.splice(
  //     this.books.findIndex((book) => book._id == id),
  //     1
  //   );
  // }

  // private editCurrentBookInTable(id: string, edited: any) {
  //   this.books.forEach((data, i) => {
  //     if (data._id == id) {
  //       this.books[i].author = edited.updateddata.author;
  //       this.books[i].title = edited.updateddata.title;
  //       this.books[i].stocks = edited.updateddata.stocks;
  //       this.books[i].price = edited.updateddata.price;
  //     }
  //   });
  // }

  // public downloadPDF() {
  //   this.pdfbtn = true;
  //   console.log(123123213, "downloadPDF()");
  //   this.hrs.request("download", "user/downloadPDF", {}, async (res: any) => {
  //     const filename = `PDF_123`;
  //     console.log(123123213, res);
  //     if (res.body) {
  //       saveAs(res.body, filename);
  //     }

  //     this.pdfbtn = false;
  //   });
  // }

  // public downloadExcel() {
  //   this.excelbtn = true;
  //   console.log(143434, this.excelbtn);
  //   this.hrs.request("download", "user/downloadExcel", {}, async (res: any) => {
  //     const filename = `EXCEL_123`;
  //     if (res.body) {
  //       saveAs(res.body, filename);
  //     }

  //     this.excelbtn = false;
  //   });
  // }
}
