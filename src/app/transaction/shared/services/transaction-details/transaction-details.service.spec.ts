import { TestBed } from "@angular/core/testing";
import { TransactionDetailsService } from "./transaction-details.service";

describe("TransactionDetailsService", () => {
  let service: TransactionDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionDetailsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
